import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import pool from '../db/pool';
import TAEngine from '../services/taEngine';
import FinanceService from '../services/financeService';

export type UserIntent = 'MARKET' | 'FINANCE' | 'GENERAL';

const DEFAULT_GENERAL_FINANCE_PROMPT = `You are an intelligent financial chatbot. Answer questions about budgeting, savings, loans, investments, and financial planning clearly and concisely. When representing Indian currency internally or in examples, calculate values in integer paise to avoid floating-point errors, but display the final output in standard Rupee format to the user.`;

/**
 * Call Google Gemini API with automatic model fallback for resilience
 */
async function callGemini(
  systemInstruction: string,
  userPrompt: string
): Promise<{ text: string; modelUsed: string }> {
  const rawApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const apiKey = rawApiKey.replace(/^["'\s]+|["'\s]+$/g, '').trim();

  if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    throw new Error('GEMINI_API_KEY is missing or invalid in .env.');
  }

  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const candidateModels = [
    preferredModel,
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastError: any = null;

  for (const model of candidateModels) {
    // 1. Try official SDK
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      if (response.text) {
        return { text: response.text.trim(), modelUsed: model };
      }
    } catch (sdkError: any) {
      // 2. Fallback to Google Gemini REST endpoint
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const restResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          }),
        });

        if (restResponse.ok) {
          const json = (await restResponse.json()) as any;
          const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            return { text: candidate.trim(), modelUsed: model };
          }
        }
      } catch (restError: any) {
        // Continue to next candidate model
      }

      lastError = sdkError;
    }
  }

  throw lastError || new Error('All candidate Google Gemini models failed.');
}

/**
 * Step 4A (Classification):
 * Fast, zero-shot intent routing via Google Gemini API
 */
async function classifyIntent(userMessage: string): Promise<UserIntent> {
  const classificationPrompt = `Classify this query into one category: MARKET (stocks, indices, Nifty, S&P 500, trading), FINANCE (personal budget, spending, savings, expenses), or GENERAL (basic financial literacy). Query: "${userMessage}". Output strictly one word: MARKET, FINANCE, or GENERAL.`;

  try {
    const res = await callGemini(
      'You are a strict text classification router. Output only the category name in capital letters.',
      classificationPrompt
    );

    const upper = res.text.toUpperCase();
    if (upper.includes('MARKET')) return 'MARKET';
    if (upper.includes('FINANCE')) return 'FINANCE';
    if (upper.includes('GENERAL')) return 'GENERAL';
  } catch (err: any) {
    console.warn('[IntentRouter] Gemini classification notice, using pattern matcher:', err.message);
  }

  // Robust keyword/pattern fallback
  if (/nifty|gspc|sp500|s&p|stock|index|indices|trading|break of structure|bos|fvg|fair value gap|candlestick|sma|bull|bear/i.test(userMessage)) {
    return 'MARKET';
  }
  if (/budget|spent|spending|expense|expenses|savings|income|salary|transactions|ledger|dine|dining|rent|subscriptions/i.test(userMessage)) {
    return 'FINANCE';
  }

  return 'GENERAL';
}

/**
 * Helper: generates a clean title from the user prompt
 */
function deriveSessionTitle(message: string): string {
  const clean = message.replace(/[\r\n]+/g, ' ').replace(/[^\w\s₹,.-]/gi, '').trim();
  if (clean.length <= 40) return clean || 'New Consultation';
  return clean.slice(0, 38).trim() + '...';
}

/**
 * Main Chat Endpoint Handler with Multi-Session Conversation Isolation & Master Intent Routing
 */
export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, message, session_id } = req.body;

    if (!user_id || !message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Both user_id and a non-empty message are required.',
      });
      return;
    }

    const userIdNum = parseInt(String(user_id), 10);
    if (isNaN(userIdNum)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user_id. Must be a valid numeric ID.',
      });
      return;
    }

    // Ensure user exists
    const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [userIdNum]);
    if (userCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [userIdNum, `User ${userIdNum}`]
      );
    }

    // 1. Resolve or Create Chat Session (Thread / Lock)
    let activeSessionId = session_id;
    let sessionTitle = 'New Consultation';

    if (activeSessionId) {
      const sessionCheck = await pool.query(
        'SELECT id, title FROM chat_sessions WHERE id = $1 AND user_id = $2',
        [activeSessionId, userIdNum]
      );
      if (sessionCheck.rows.length > 0) {
        sessionTitle = sessionCheck.rows[0].title;
        // If title is default, update it with initial user question
        if (sessionTitle === 'New Consultation' || sessionTitle === 'Previous Consultation History') {
          sessionTitle = deriveSessionTitle(message.trim());
          await pool.query(
            'UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [sessionTitle, activeSessionId]
          );
        }
      } else {
        // Create session with supplied UUID
        sessionTitle = deriveSessionTitle(message.trim());
        const createSession = await pool.query(
          `INSERT INTO chat_sessions (id, user_id, title)
           VALUES ($1, $2, $3)
           RETURNING id, title;`,
          [activeSessionId, userIdNum, sessionTitle]
        );
        activeSessionId = createSession.rows[0].id;
      }
    } else {
      // Create new session from scratch
      sessionTitle = deriveSessionTitle(message.trim());
      const createSession = await pool.query(
        `INSERT INTO chat_sessions (user_id, title)
         VALUES ($1, $2)
         RETURNING id, title;`,
        [userIdNum, sessionTitle]
      );
      activeSessionId = createSession.rows[0].id;
    }

    // 2. Save user message to PostgreSQL chat_history under this session
    const userInsertResult = await pool.query(
      `INSERT INTO chat_history (user_id, session_id, role, message_content, timestamp)
       VALUES ($1, $2, 'user', $3, CURRENT_TIMESTAMP)
       RETURNING id, user_id, session_id, role, message_content, timestamp`,
      [userIdNum, activeSessionId, message.trim()]
    );
    const userMessageRecord = userInsertResult.rows[0];

    // 3. Step 4A: Master Intent Routing via Google Gemini
    const intent = await classifyIntent(message.trim());
    console.log(`[MasterIntentRouter] Session: ${activeSessionId} | Query: "${message.trim()}" => Intent: [${intent}]`);

    // 4. Step 4B: RAG Context Injection based on classified intent
    let systemPrompt = DEFAULT_GENERAL_FINANCE_PROMPT;
    let marketContext: any = null;
    let financeContext: any = null;

    if (intent === 'MARKET') {
      const targetTicker = /s&p|sp500|gspc|us market/i.test(message) ? '^GSPC' : '^NSEI';
      marketContext = await TAEngine.analyze(targetTicker);

      systemPrompt = `You are a quantitative market analyst. Translate this technical data into actionable insights for the user.

Real-Time Quantitative Market Analysis for ${marketContext.assetName} (${marketContext.ticker}) as of ${marketContext.asOfDate}:
${JSON.stringify(marketContext, null, 2)}

Instructions:
1. Explain the 20 SMA vs 50 SMA crossover trend status clearly.
2. Translate what the Break of Structure (BoS) means for current market direction.
3. Detail active Fair Value Gaps (FVG) and key liquidity zones (Point of Control / Swing High & Low levels).
4. Provide conversational, actionable market structure commentary without sounding like a robot.`;
    } else if (intent === 'FINANCE') {
      financeContext = await FinanceService.getMonthlyLedger(userIdNum);

      systemPrompt = `You are a personal wealth manager. Analyze this spending data and provide strict recommendations to optimize savings.

User Monthly Financial Ledger (${financeContext.period.label}):
${JSON.stringify(financeContext, null, 2)}

Instructions:
1. Evaluate their current savings rate (${financeContext.metrics.savingsRatePercent}%) against healthy benchmarks (20-30%).
2. Call out specific high discretionary spending areas (e.g. food delivery/dining, impulse tech shopping, recurring SaaS subscriptions).
3. Provide direct, strict, high-impact recommendations to eliminate leaks and build emergency/investment reserves.
4. Format all values in clear Indian Rupee format (₹).`;
    } else {
      systemPrompt = DEFAULT_GENERAL_FINANCE_PROMPT;
    }

    // 5. Multi-turn conversation context strictly for THIS specific chat session!
    const historyResult = await pool.query(
      `SELECT role, message_content 
       FROM chat_history 
       WHERE session_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 6`,
      [activeSessionId]
    );

    const chronologicalHistory = historyResult.rows.reverse();
    const formattedHistory = chronologicalHistory
      .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.message_content}`)
      .join('\n');

    const promptPayload = `Recent Conversation Context:
${formattedHistory}

User: ${message.trim()}

Assistant:`;

    // 6. Step 4C (Execution): Send contextualized prompt to Google Gemini API
    let assistantMessage = '';
    let usedModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

    try {
      const geminiResult = await callGemini(systemPrompt, promptPayload);
      assistantMessage = geminiResult.text;
      usedModel = `gemini/${geminiResult.modelUsed}`;
    } catch (geminiErr: any) {
      console.error('[ChatController] Gemini API execution error:', geminiErr.message);
      assistantMessage = `⚠️ **AI Service Notice**: Unable to generate response via Google Gemini API: ${geminiErr.message}. Please verify your API key in \`.env\`.`;
    }

    // 7. Save assistant response to PostgreSQL chat_history under this session
    const assistantInsertResult = await pool.query(
      `INSERT INTO chat_history (user_id, session_id, role, message_content, timestamp)
       VALUES ($1, $2, 'assistant', $3, CURRENT_TIMESTAMP)
       RETURNING id, user_id, session_id, role, message_content, timestamp`,
      [userIdNum, activeSessionId, assistantMessage]
    );
    const assistantMessageRecord = assistantInsertResult.rows[0];

    // 8. Update session timestamp
    await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [activeSessionId]);

    // 9. Return to frontend
    res.status(200).json({
      success: true,
      user_id: userIdNum,
      session_id: activeSessionId,
      session_title: sessionTitle,
      intent,
      message: assistantMessage,
      model_used: usedModel,
      user_record: userMessageRecord,
      assistant_record: assistantMessageRecord,
      market_context: marketContext || undefined,
      finance_context: financeContext || undefined,
    });
  } catch (error: any) {
    console.error('[ChatController] Internal Error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing the chat message.',
      details: error.message,
    });
  }
};

/**
 * GET /api/chat/sessions/:userId
 * Retrieves list of past conversation sessions for the left sidebar
 */
export const getChatSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUser = req.params.userId;
    const userIdStr = Array.isArray(rawUser) ? rawUser[0] : rawUser;
    const userIdNum = parseInt(userIdStr, 10);

    if (isNaN(userIdNum)) {
      res.status(400).json({ success: false, error: 'Invalid userId parameter.' });
      return;
    }

    const result = await pool.query(
      `SELECT 
         s.id,
         s.user_id,
         s.title,
         s.created_at,
         s.updated_at,
         COUNT(m.id)::int as message_count
       FROM chat_sessions s
       LEFT JOIN chat_history m ON m.session_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.updated_at DESC;`,
      [userIdNum]
    );

    res.status(200).json({
      success: true,
      sessions: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat sessions.',
      details: error.message,
    });
  }
};

/**
 * POST /api/chat/sessions
 * Creates an empty new conversation session
 */
export const createChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, title } = req.body;
    const userIdNum = parseInt(String(user_id || 1), 10);

    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, title)
       VALUES ($1, $2)
       RETURNING id, user_id, title, created_at, updated_at;`,
      [userIdNum, title || 'New Consultation']
    );

    res.status(201).json({
      success: true,
      session: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session.',
      details: error.message,
    });
  }
};

/**
 * GET /api/chat/sessions/:sessionId/messages
 * Retrieves all messages for a specific session thread
 */
export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSession = req.params.sessionId;
    const sessionId = Array.isArray(rawSession) ? rawSession[0] : rawSession;

    const result = await pool.query(
      `SELECT id, user_id, session_id, role, message_content, timestamp 
       FROM chat_history 
       WHERE session_id = $1 
       ORDER BY timestamp ASC;`,
      [sessionId]
    );

    res.status(200).json({
      success: true,
      messages: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session messages.',
      details: error.message,
    });
  }
};

/**
 * DELETE /api/chat/sessions/:sessionId
 * Permanently deletes a conversation session and all its messages
 */
export const deleteChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSession = req.params.sessionId;
    const sessionId = Array.isArray(rawSession) ? rawSession[0] : rawSession;

    await pool.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat session.',
      details: error.message,
    });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const userIdNum = parseInt(userIdStr, 10);

    if (isNaN(userIdNum)) {
      res.status(400).json({ success: false, error: 'Invalid userId parameter.' });
      return;
    }

    const result = await pool.query(
      `SELECT id, user_id, session_id, role, message_content, timestamp 
       FROM chat_history 
       WHERE user_id = $1 
       ORDER BY timestamp ASC`,
      [userIdNum]
    );

    res.status(200).json({
      success: true,
      history: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history.',
      details: error.message,
    });
  }
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const userIdNum = parseInt(userIdStr, 10);

    if (isNaN(userIdNum)) {
      res.status(400).json({ success: false, error: 'Invalid userId parameter.' });
      return;
    }

    await pool.query('DELETE FROM chat_history WHERE user_id = $1', [userIdNum]);
    await pool.query('DELETE FROM chat_sessions WHERE user_id = $1', [userIdNum]);

    res.status(200).json({
      success: true,
      message: `Chat history and sessions cleared for user ${userIdNum}`,
    });
  } catch (error: any) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history.',
      details: error.message,
    });
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, google_id, email, name, avatar_url, created_at FROM users ORDER BY id ASC`
    );
    res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users.',
      details: error.message,
    });
  }
};
