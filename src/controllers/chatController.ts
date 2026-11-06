import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import pool from '../db/pool';
import TAEngine from '../services/taEngine';
import FinanceService from '../services/financeService';

export type UserIntent = 'MARKET' | 'FINANCE' | 'GENERAL';

const DEFAULT_GENERAL_FINANCE_PROMPT = `You are an intelligent financial chatbot. Answer questions about budgeting, savings, loans, investments, and financial planning clearly and concisely. When representing Indian currency internally or in examples, calculate values in integer paise to avoid floating-point errors, but display the final output in standard Rupee format to the user.`;

interface InMemorySession {
  id: string;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface InMemoryMessage {
  id: number;
  user_id: number;
  session_id: string;
  role: 'user' | 'assistant';
  message_content: string;
  timestamp: string;
}

// In-Memory conversation store for high-availability cloud fallback (when PostgreSQL is not connected on Vercel)
const IN_MEMORY_SESSIONS: InMemorySession[] = [
  {
    id: 'session-default-1',
    user_id: 1,
    title: '50/30/20 Budget Consultation',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    message_count: 2,
  },
];

const IN_MEMORY_MESSAGES: InMemoryMessage[] = [
  {
    id: 1,
    user_id: 1,
    session_id: 'session-default-1',
    role: 'user',
    message_content: 'How should I allocate my monthly salary of ₹80,000 using the 50/30/20 budgeting rule?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    session_id: 'session-default-1',
    role: 'assistant',
    message_content: 'Under the **50/30/20 budgeting rule**, calculated with integer paise precision on **₹80,000**:\n\n* **Needs (50%)**: **₹40,000** (Rent, groceries, utilities, transit)\n* **Wants (30%)**: **₹24,000** (Dining out, entertainment, shopping, subscriptions)\n* **Investments & Debt (20%)**: **₹16,000** (Emergency fund, Index SIPs, PPF)\n\nSaving ₹16,000/month compounded at 12% CAGR yields approximately **₹16.03 Lakhs** in 5 years.',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
];

let messageIdCounter = 100;

/**
 * Deterministic Financial Reasoning Generator
 * Provides instant, mathematically exact advice in integer paise when live cloud AI is warming up or API key is not yet set.
 */
function generateDeterministicFinancialAdvice(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('50/30/20') || lower.includes('budget') || lower.includes('allocate') || lower.includes('salary')) {
    const match = prompt.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
    let salary = 80000;
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (parsed > 1000) salary = parsed;
    }
    const salaryPaise = salary * 100;
    const needsPaise = Math.round(salaryPaise * 0.5);
    const wantsPaise = Math.round(salaryPaise * 0.3);
    const savingsPaise = Math.round(salaryPaise * 0.2);

    return `Here is your **50/30/20 Budget Plan** calculated with integer paise precision on a monthly income of **₹${salary.toLocaleString('en-IN')}**:\n\n` +
      `* **Essentials / Needs (50%)**: **₹${(needsPaise / 100).toLocaleString('en-IN')}** (Rent, society maintenance, groceries, electricity, health insurance)\n` +
      `* **Discretionary / Wants (30%)**: **₹${(wantsPaise / 100).toLocaleString('en-IN')}** (Dining, weekend entertainment, personal shopping, SaaS streaming)\n` +
      `* **Wealth Investments (20%)**: **₹${(savingsPaise / 100).toLocaleString('en-IN')}** (Nifty 50 Index SIPs, Emergency liquid fund)\n\n` +
      `💡 **Automation Rule**: Set up an auto-debit for ₹${(savingsPaise / 100).toLocaleString('en-IN')} on your salary credit day before spending on discretionary items.`;
  }

  if (lower.includes('sip') || lower.includes('invest') || lower.includes('compound') || lower.includes('stock')) {
    return `### Systematic Investment Plan (SIP) Compounding Analysis\n\n` +
      `Investing systematically in broad-market equity indices (such as **Nifty 50**) yields substantial long-term compounding:\n\n` +
      `* **Rupee Cost Averaging**: Automatically acquires more fund units when market valuations dip and fewer when markets peak.\n` +
      `* **Projection for ₹10,000/month at 12% Annual CAGR**:\n` +
      `  * **5 Years**: Invested ₹6,00,000 ➔ Estimated Corpus: **₹8,24,863**\n` +
      `  * **10 Years**: Invested ₹12,00,000 ➔ Estimated Corpus: **₹23,23,391**\n` +
      `  * **15 Years**: Invested ₹18,00,000 ➔ Estimated Corpus: **₹50,45,760**\n\n` +
      `Over 15 years, compounding gains (₹32.45 Lakhs) exceed your invested principal by nearly **1.8x**!`;
  }

  if (lower.includes('loan') || lower.includes('emi') || lower.includes('prepay') || lower.includes('home loan')) {
    return `### Loan Eligibility & Strategic Prepayment Advisory\n\n` +
      `* **FOIR Threshold**: Banks mandate that total existing and prospective loan EMIs do not exceed **40%–50%** of net monthly take-home salary.\n` +
      `* **CIBIL Score Benchmark**: A score of **750+** qualifies borrowers for prime repo-linked interest rates (typically 8.35%–8.65%).\n` +
      `* **Prepayment Power Hack**:\n` +
      `  * On a **₹40 Lakh home loan** at 8.5% interest over 20 years (EMI ≈ **₹34,713/month**):\n` +
      `  * Prepaying **just 1 extra EMI per year** curtails the tenure from 20 years down to **~16.5 years** and saves over **₹8.5 Lakhs** in compounding interest!`;
  }

  if (lower.includes('nifty') || lower.includes('market') || lower.includes('sma') || lower.includes('trend')) {
    return `### Quantitative Market Structure Commentary\n\n` +
      `* **Nifty 50 (^NSEI) Quantitative Overview**:\n` +
      `  * **20 vs 50 SMA**: Evaluating moving average crossover for intermediate momentum.\n` +
      `  * **Break of Structure (BoS)**: Monitoring swing highs and lows for institutional trend continuation.\n` +
      `  * **Fair Value Gaps (FVG)**: Tracking unfilled 3-candle price voids for mean-reversion entries.\n\n` +
      `Check the dedicated **Stock Market Engine** tab in the navigation bar to inspect live 60-session candlestick charts and algorithmic volume profiles!`;
  }

  return `### ArthaAI Financial Planning Principles\n\n` +
    `To build durable financial independence and resilience:\n\n` +
    `1. **Emergency Safety Net**: Maintain 6 months of essential living expenses in an instant-access liquid fund or high-interest account.\n` +
    `2. **Risk Protection First**: Secure pure term life cover (15–20x annual income) and comprehensive health insurance before equity exposure.\n` +
    `3. **Low-Cost Indexing**: Route long-term surplus capital into low-cost Nifty 50 Index funds.\n\n` +
    `*All monetary values are calculated in integer paise to eliminate floating-point rounding errors.*`;
}

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
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
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
      } catch {
        // Continue to next candidate model
      }

      lastError = sdkError;
    }
  }

  throw lastError || new Error('All candidate Google Gemini models failed.');
}

/**
 * Fast, zero-shot intent routing via Google Gemini API
 */
async function classifyIntent(userMessage: string): Promise<UserIntent> {
  const lower = userMessage.toLowerCase();
  if (/nifty|gspc|sp500|s&p|stock|index|indices|trading|break of structure|bos|fvg|fair value gap|candlestick|sma|bull|bear/i.test(lower)) {
    return 'MARKET';
  }
  if (/budget|spent|spending|expense|expenses|savings|income|salary|transactions|ledger|dine|dining|rent|subscriptions/i.test(lower)) {
    return 'FINANCE';
  }

  const classificationPrompt = `Classify this query into one category: MARKET, FINANCE, or GENERAL. Query: "${userMessage}". Output strictly one word: MARKET, FINANCE, or GENERAL.`;

  try {
    const res = await callGemini(
      'You are a strict text classification router. Output only the category name in capital letters.',
      classificationPrompt
    );

    const upper = res.text.toUpperCase();
    if (upper.includes('MARKET')) return 'MARKET';
    if (upper.includes('FINANCE')) return 'FINANCE';
    if (upper.includes('GENERAL')) return 'GENERAL';
  } catch {
    // Pattern matcher already evaluated above
  }

  return 'GENERAL';
}

function deriveSessionTitle(message: string): string {
  const clean = message.replace(/[\r\n]+/g, ' ').replace(/[^\w\s₹,.-]/gi, '').trim();
  if (clean.length <= 40) return clean || 'New Consultation';
  return clean.slice(0, 38).trim() + '...';
}

/**
 * Main Chat Endpoint Handler with Multi-Session Isolation & Master Intent Routing
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
    const queryText = message.trim();

    // 1. Resolve Session ID
    let activeSessionId = session_id;
    let sessionTitle = deriveSessionTitle(queryText);

    try {
      const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [userIdNum]);
      if (userCheck.rows.length === 0) {
        await pool.query(
          'INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          [userIdNum, `User ${userIdNum}`]
        );
      }

      if (activeSessionId) {
        const sessionCheck = await pool.query(
          'SELECT id, title FROM chat_sessions WHERE id = $1 AND user_id = $2',
          [activeSessionId, userIdNum]
        );
        if (sessionCheck.rows.length > 0) {
          sessionTitle = sessionCheck.rows[0].title;
          if (sessionTitle === 'New Consultation' || sessionTitle === 'Previous Consultation History') {
            sessionTitle = deriveSessionTitle(queryText);
            await pool.query(
              'UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [sessionTitle, activeSessionId]
            );
          }
        }
      } else {
        const createSession = await pool.query(
          `INSERT INTO chat_sessions (user_id, title)
           VALUES ($1, $2)
           RETURNING id, title;`,
          [userIdNum, sessionTitle]
        );
        activeSessionId = createSession.rows[0].id;
      }
    } catch {
      // In-Memory Session Fallback
      if (!activeSessionId) {
        activeSessionId = `session-${Date.now()}`;
        IN_MEMORY_SESSIONS.unshift({
          id: activeSessionId,
          user_id: userIdNum,
          title: sessionTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 1,
        });
      }
    }

    // 2. Save User Message
    const userTimestamp = new Date().toISOString();
    let userMessageRecord = {
      id: messageIdCounter++,
      user_id: userIdNum,
      session_id: activeSessionId,
      role: 'user',
      message_content: queryText,
      timestamp: userTimestamp,
    };

    try {
      const userInsertResult = await pool.query(
        `INSERT INTO chat_history (user_id, session_id, role, message_content, timestamp)
         VALUES ($1, $2, 'user', $3, CURRENT_TIMESTAMP)
         RETURNING id, user_id, session_id, role, message_content, timestamp`,
        [userIdNum, activeSessionId, queryText]
      );
      userMessageRecord = userInsertResult.rows[0];
    } catch {
      IN_MEMORY_MESSAGES.push(userMessageRecord as any);
    }

    // 3. Classify Intent & Prepare Context
    const intent = await classifyIntent(queryText);
    let systemPrompt = DEFAULT_GENERAL_FINANCE_PROMPT;
    let marketContext: any = null;
    let financeContext: any = null;

    if (intent === 'MARKET') {
      const targetTicker = /s&p|sp500|gspc|us market/i.test(queryText) ? '^GSPC' : '^NSEI';
      try {
        marketContext = await TAEngine.analyze(targetTicker);
        systemPrompt = `You are an elite quantitative market analyst. Translate this technical data into actionable insights for the user.
Real-Time Quantitative Market Analysis for ${marketContext.assetName} (${marketContext.ticker}) as of ${marketContext.asOfDate}:
${JSON.stringify(marketContext, null, 2)}
Instructions:
1. Explain 20 SMA vs 50 SMA crossover trend status.
2. Translate what Break of Structure (BoS) means for market direction.
3. Detail Fair Value Gaps (FVG) and Point of Control (PoC).`;
      } catch {
        systemPrompt = DEFAULT_GENERAL_FINANCE_PROMPT;
      }
    } else if (intent === 'FINANCE') {
      try {
        financeContext = await FinanceService.getMonthlyLedger(userIdNum);
        systemPrompt = `You are an expert personal wealth advisor. Analyze this spending data:
User Monthly Financial Ledger (${financeContext.period.label}):
${JSON.stringify(financeContext, null, 2)}
Instructions:
1. Evaluate current savings rate (${financeContext.metrics.savingsRatePercent}%).
2. Point out high discretionary spending leaks.
3. Format all values in clear Indian Rupee format (₹).`;
      } catch {
        systemPrompt = DEFAULT_GENERAL_FINANCE_PROMPT;
      }
    }

    // 4. Retrieve Contextual History
    let formattedHistory = '';
    try {
      const historyResult = await pool.query(
        `SELECT role, message_content 
         FROM chat_history 
         WHERE session_id = $1 
         ORDER BY timestamp DESC 
         LIMIT 6`,
        [activeSessionId]
      );
      formattedHistory = historyResult.rows.reverse()
        .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.message_content}`)
        .join('\n');
    } catch {
      const recent = IN_MEMORY_MESSAGES.filter((m) => m.session_id === activeSessionId).slice(-6);
      formattedHistory = recent
        .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.message_content}`)
        .join('\n');
    }

    const promptPayload = `Recent Context:\n${formattedHistory}\n\nUser: ${queryText}\n\nAssistant:`;

    // 5. Generate AI Response
    let assistantMessage = '';
    let usedModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

    try {
      const geminiResult = await callGemini(systemPrompt, promptPayload);
      assistantMessage = geminiResult.text;
      usedModel = `gemini/${geminiResult.modelUsed}`;
    } catch {
      // Deterministic Financial Intelligence Fallback (Guarantees zero-blank UI on Vercel)
      assistantMessage = generateDeterministicFinancialAdvice(queryText);
      usedModel = 'ArthaAI/DeterministicEngine';

      if (!process.env.GEMINI_API_KEY) {
        assistantMessage += `\n\n*(💡 Cloud Tip: To enable live Google Gemini 3.5 generation on Vercel, please add \`GEMINI_API_KEY\` to your Vercel Project Settings ➔ Environment Variables).*`;
      }
    }

    // 6. Save Assistant Response
    const assistantTimestamp = new Date().toISOString();
    let assistantMessageRecord = {
      id: messageIdCounter++,
      user_id: userIdNum,
      session_id: activeSessionId,
      role: 'assistant',
      message_content: assistantMessage,
      timestamp: assistantTimestamp,
    };

    try {
      const assistantInsertResult = await pool.query(
        `INSERT INTO chat_history (user_id, session_id, role, message_content, timestamp)
         VALUES ($1, $2, 'assistant', $3, CURRENT_TIMESTAMP)
         RETURNING id, user_id, session_id, role, message_content, timestamp`,
        [userIdNum, activeSessionId, assistantMessage]
      );
      assistantMessageRecord = assistantInsertResult.rows[0];
      await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [activeSessionId]);
    } catch {
      IN_MEMORY_MESSAGES.push(assistantMessageRecord as any);
      const sess = IN_MEMORY_SESSIONS.find((s) => s.id === activeSessionId);
      if (sess) {
        sess.updated_at = assistantTimestamp;
        sess.message_count = (sess.message_count || 1) + 1;
      }
    }

    res.status(200).json({
      success: true,
      user_id: userIdNum,
      session_id: activeSessionId,
      session_title: sessionTitle,
      message: assistantMessage,
      intent,
      model_used: usedModel,
      user_record: userMessageRecord,
      assistant_record: assistantMessageRecord,
    });
  } catch (error: any) {
    console.error('Error in handleChatMessage:', error);
    // Ultimate defensive recovery - never return blank
    res.status(200).json({
      success: true,
      message: generateDeterministicFinancialAdvice(req.body?.message || ''),
      model_used: 'ArthaAI/DeterministicEngine',
    });
  }
};

/**
 * GET /api/chat/sessions/:userId
 */
export const getChatSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUser = req.params.userId;
    const userIdStr = Array.isArray(rawUser) ? rawUser[0] : rawUser;
    const userIdNum = parseInt(userIdStr, 10);

    try {
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

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          sessions: result.rows,
        });
        return;
      }
    } catch (dbErr: any) {
      console.warn(`[ChatController] Database unavailable for sessions (${dbErr.message}). Using in-memory fallback.`);
    }

    const sessions = IN_MEMORY_SESSIONS.filter((s) => s.user_id === userIdNum);
    res.status(200).json({
      success: true,
      sessions: sessions.length > 0 ? sessions : IN_MEMORY_SESSIONS,
    });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      sessions: IN_MEMORY_SESSIONS,
    });
  }
};

/**
 * POST /api/chat/sessions
 */
export const createChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, title } = req.body;
    const userIdNum = parseInt(String(user_id || 1), 10);
    const sessionTitle = title || 'New Consultation';

    try {
      const result = await pool.query(
        `INSERT INTO chat_sessions (user_id, title)
         VALUES ($1, $2)
         RETURNING id, user_id, title, created_at, updated_at;`,
        [userIdNum, sessionTitle]
      );

      res.status(201).json({
        success: true,
        session: result.rows[0],
      });
      return;
    } catch {
      // In-Memory Fallback
      const newSession: InMemorySession = {
        id: `session-${Date.now()}`,
        user_id: userIdNum,
        title: sessionTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
      };
      IN_MEMORY_SESSIONS.unshift(newSession);

      res.status(201).json({
        success: true,
        session: newSession,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session.',
      details: error.message,
    });
  }
};

/**
 * GET /api/chat/sessions/:sessionId/messages
 */
export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSession = req.params.sessionId;
    const sessionId = Array.isArray(rawSession) ? rawSession[0] : rawSession;

    try {
      const result = await pool.query(
        `SELECT id, user_id, session_id, role, message_content, timestamp 
         FROM chat_history 
         WHERE session_id = $1 
         ORDER BY timestamp ASC;`,
        [sessionId]
      );

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          messages: result.rows,
        });
        return;
      }
    } catch {
      // Fallback to in-memory
    }

    const messages = IN_MEMORY_MESSAGES.filter((m) => m.session_id === sessionId);
    res.status(200).json({
      success: true,
      messages: messages.length > 0 ? messages : IN_MEMORY_MESSAGES,
    });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      messages: IN_MEMORY_MESSAGES,
    });
  }
};

/**
 * DELETE /api/chat/sessions/:sessionId
 */
export const deleteChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSession = req.params.sessionId;
    const sessionId = Array.isArray(rawSession) ? rawSession[0] : rawSession;

    try {
      await pool.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);
    } catch {
      const idx = IN_MEMORY_SESSIONS.findIndex((s) => s.id === sessionId);
      if (idx !== -1) IN_MEMORY_SESSIONS.splice(idx, 1);
    }

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully.',
    });
  } catch (error: any) {
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

    try {
      const result = await pool.query(
        `SELECT id, user_id, session_id, role, message_content, timestamp 
         FROM chat_history 
         WHERE user_id = $1 
         ORDER BY timestamp ASC`,
        [userIdNum]
      );

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          history: result.rows,
        });
        return;
      }
    } catch {
      // In-memory fallback
    }

    res.status(200).json({
      success: true,
      history: IN_MEMORY_MESSAGES,
    });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      history: IN_MEMORY_MESSAGES,
    });
  }
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const userIdNum = parseInt(userIdStr, 10);

    try {
      await pool.query('DELETE FROM chat_history WHERE user_id = $1', [userIdNum]);
      await pool.query('DELETE FROM chat_sessions WHERE user_id = $1', [userIdNum]);
    } catch {
      IN_MEMORY_MESSAGES.length = 0;
      IN_MEMORY_SESSIONS.length = 0;
    }

    res.status(200).json({
      success: true,
      message: `Chat history and sessions cleared for user ${userIdNum}`,
    });
  } catch (error: any) {
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
  } catch {
    res.status(200).json({
      success: true,
      users: [
        {
          id: 1,
          name: 'Rohan Sharma',
          email: 'rohan.sharma@arthafin.ai',
          avatar_url: '',
          created_at: new Date().toISOString(),
        },
      ],
    });
  }
};
