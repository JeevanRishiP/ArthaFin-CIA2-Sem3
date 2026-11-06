// ==========================================================================
// ArthaAI • Client Application Logic (Unified Multi-System Architecture)
// 1. AI Financial Chatbot (Multi-Session Isolated Conversation Management)
// 2. AI-Based Stock Market Analysis & Prediction Engine
// 3. AI-Powered Personal Finance & Wealth Ledger (with Graphical Donut Chart)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements: Navigation & View Switching ---
  const navTabs = document.querySelectorAll('.nav-tab-pill');
  const sidebarModeBtns = document.querySelectorAll('.mode-nav-btn');
  const workspaceViews = {
    'view-chat': document.getElementById('view-chat'),
    'view-market': document.getElementById('view-market'),
    'view-finance': document.getElementById('view-finance'),
  };

  const activeModelName = document.getElementById('active-model-name');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  // --- DOM Elements: Sidebar Conversations (Like ChatGPT / Claude) ---
  const sidebarSessionsList = document.getElementById('sidebar-sessions-list');
  const sessionCountPill = document.getElementById('session-count-pill');
  const newChatBtn = document.getElementById('new-chat-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const syncHistoryBtn = document.getElementById('sync-history-btn');
  const clearDbHistoryBtn = document.getElementById('clear-db-history-btn');

  // --- DOM Elements: View 1 (Chatbot) ---
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesContainer = document.getElementById('messages-container');
  const welcomeCard = document.getElementById('welcome-card');
  const typingIndicator = document.getElementById('typing-indicator');

  // --- DOM Elements: View 2 (Stock Market) ---
  const marketAsOfBadge = document.getElementById('market-as-of-badge');
  const segBtns = document.querySelectorAll('.seg-btn');
  const refreshMarketBtn = document.getElementById('refresh-market-btn');
  const askMarketAiBtn = document.getElementById('ask-market-ai-btn');
  const trendClosePrice = document.getElementById('trend-close-price');
  const trendCrossoverBadge = document.getElementById('trend-crossover-badge');
  const trendSmaDetails = document.getElementById('trend-sma-details');
  const trendSummaryText = document.getElementById('trend-summary-text');
  const bosStatusBadge = document.getElementById('bos-status-badge');
  const bosLevelPrice = document.getElementById('bos-level-price');
  const bosSwingsText = document.getElementById('bos-swings-text');
  const bosDescriptionText = document.getElementById('bos-description-text');
  const fvgCountBadge = document.getElementById('fvg-count-badge');
  const fvgLatestRange = document.getElementById('fvg-latest-range');
  const fvgFormationDate = document.getElementById('fvg-formation-date');
  const fvgDescriptionText = document.getElementById('fvg-description-text');
  const pocPriceLevel = document.getElementById('poc-price-level');
  const pocWeightText = document.getElementById('poc-weight-text');
  const pocDescriptionText = document.getElementById('poc-description-text');
  const marketAiPredictionBody = document.getElementById('market-ai-prediction-body');
  const marketCandlesTbody = document.getElementById('market-candles-tbody');
  const candlesCountBadge = document.getElementById('candles-count-badge');

  // --- DOM Elements: View 3 (Personal Finance) ---
  const financePeriodBadge = document.getElementById('finance-period-badge');
  const finIncomeTotal = document.getElementById('fin-income-total');
  const finExpenseTotal = document.getElementById('fin-expense-total');
  const finSavingsTotal = document.getElementById('fin-savings-total');
  const finSavingsBadge = document.getElementById('fin-savings-badge');
  const finSavingsRate = document.getElementById('fin-savings-rate');
  const finRateStatus = document.getElementById('fin-rate-status');
  const finSavingsBar = document.getElementById('fin-savings-bar');
  const financePieChartContainer = document.getElementById('finance-pie-chart-container');
  const financePieLegend = document.getElementById('finance-pie-legend');
  const discretionaryAlertsList = document.getElementById('discretionary-alerts-list');
  const categoryBarsList = document.getElementById('category-bars-list');
  const financeTransactionsTbody = document.getElementById('finance-transactions-tbody');
  const txCountBadge = document.getElementById('tx-count-badge');
  const openAddTxModalBtn = document.getElementById('open-add-tx-modal-btn');
  const askFinanceAiBtn = document.getElementById('ask-finance-ai-btn');
  const txModal = document.getElementById('tx-modal');
  const txModalClose = document.getElementById('tx-modal-close');
  const txModalHeading = document.getElementById('tx-modal-heading');
  const txModalSubheading = document.getElementById('tx-modal-subheading');
  const addTransactionForm = document.getElementById('add-transaction-form');
  const txEditId = document.getElementById('tx-edit-id');
  const txAmount = document.getElementById('tx-amount');
  const txCategory = document.getElementById('tx-category');
  const txDescription = document.getElementById('tx-description');
  const txDate = document.getElementById('tx-date');
  const saveTxBtn = document.getElementById('save-tx-btn');

  // --- State Variables ---
  const activeUserId = 1; // Primary active user ID (Rohan Sharma)
  let activeSessionId = null; // Currently active conversation thread (null = fresh consultation)
  let currentTicker = '^NSEI';
  let isAwaitingResponse = false;
  let activeView = 'view-chat';
  const transactionsCache = new Map(); // Store transactions by ID for fast editing lookup

  // Vibrant Palette for VisionOS Glass Donut Chart
  const DONUT_COLORS = [
    '#38bdf8', // Neon Sky Blue
    '#818cf8', // Electric Indigo
    '#f43f5e', // Vibrant Rose
    '#f59e0b', // Radiant Amber
    '#10b981', // Crisp Emerald
    '#06b6d4', // Bright Teal
    '#a855f7', // Mystic Purple
    '#ec4899', // Pink Fuchsia
    '#6366f1', // Ultra Violet
    '#14b8a6', // Deep Cyan
  ];

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  initApplication();

  async function initApplication() {
    console.log('🚀 Initializing ArthaAI Unified Intelligence System...');
    if (txDate) txDate.value = new Date().toISOString().split('T')[0];

    // 1. Load Past Conversation Sessions from PostgreSQL into Sidebar Locks
    await loadChatSessions();

    // 2. Pre-load Transaction Categories for Modal
    loadCategories();
  }

  // ==========================================================================
  // VIEW SWITCHER LOGIC
  // ==========================================================================
  function switchView(targetViewId) {
    if (!workspaceViews[targetViewId]) return;
    activeView = targetViewId;

    navTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-view') === targetViewId);
    });

    sidebarModeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === targetViewId);
    });

    Object.keys(workspaceViews).forEach((viewId) => {
      const el = workspaceViews[viewId];
      if (el) {
        if (viewId === targetViewId) {
          el.style.display = viewId === 'view-chat' ? 'flex' : 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    });

    if (window.innerWidth <= 900 && sidebar) {
      sidebar.classList.remove('open');
    }

    if (targetViewId === 'view-market') {
      loadMarketData(currentTicker);
    } else if (targetViewId === 'view-finance') {
      loadFinanceData();
    }
  }

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => switchView(tab.getAttribute('data-view')));
  });

  sidebarModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.getAttribute('data-view')));
  });

  sidebarToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // ==========================================================================
  // MULTI-SESSION CONVERSATION MANAGEMENT (Like ChatGPT / Claude / Gemini)
  // ==========================================================================

  /**
   * Fetches all conversation sessions from PostgreSQL and populates the sidebar
   */
  async function loadChatSessions() {
    try {
      const res = await fetch(`/api/chat/sessions/${activeUserId}`);
      const data = await res.json();

      if (!data.success || !Array.isArray(data.sessions)) {
        sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">Could not load past consultations.</div>';
        return;
      }

      sessionCountPill.textContent = data.sessions.length;
      sidebarSessionsList.innerHTML = '';

      if (data.sessions.length === 0) {
        sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">No previous consultations saved yet.</div>';
        if (!activeSessionId) {
          showWelcomeCard();
        }
        return;
      }

      data.sessions.forEach((session) => {
        const item = document.createElement('div');
        const isActive = activeSessionId === session.id;
        item.className = `session-lock-item ${isActive ? 'active' : ''}`;
        item.setAttribute('data-session-id', session.id);

        item.innerHTML = `
          <div class="session-info">
            <span class="session-icon">💬</span>
            <div class="session-meta">
              <span class="session-title-text" title="${escapeHtml(session.title)}">${escapeHtml(session.title)}</span>
              <span class="session-date-text">${formatSessionDate(session.updated_at || session.created_at)}</span>
            </div>
          </div>
          <button class="session-delete-btn" data-delete-id="${session.id}" title="Delete consultation">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;

        // Switch to session when clicking item body
        item.addEventListener('click', (e) => {
          if (e.target.closest('.session-delete-btn')) return;
          switchSession(session.id);
        });

        // Delete button inside session item
        const deleteBtn = item.querySelector('.session-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteSession(session.id);
        });

        sidebarSessionsList.appendChild(item);
      });

      // If no active session yet, load the latest conversation thread
      if (!activeSessionId && data.sessions.length > 0) {
        switchSession(data.sessions[0].id);
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
      sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">Error connecting to session store.</div>';
    }
  }

  /**
   * Switches to an existing conversation thread and restores its messages
   */
  async function switchSession(sessionId) {
    activeSessionId = sessionId;
    switchView('view-chat');

    // Update active highlight in sidebar
    document.querySelectorAll('.session-lock-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-session-id') === sessionId);
    });

    try {
      setLoadingState(true);
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      const data = await res.json();

      messagesContainer.innerHTML = '';

      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        if (welcomeCard) welcomeCard.style.display = 'none';
        data.messages.forEach((msg) => {
          const sender = msg.role === 'user' ? 'You' : 'ArthaAI Advisor';
          appendMessageEnvelope(msg.role, msg.message_content, msg.timestamp, sender);
        });
      } else {
        showWelcomeCard();
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
      showWelcomeCard();
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Starts a brand new conversation entirely from zero (ChatGPT / Claude style)
   */
  function startNewConsultation() {
    activeSessionId = null;
    switchView('view-chat');

    // Clear active highlights in sidebar
    document.querySelectorAll('.session-lock-item').forEach((item) => {
      item.classList.remove('active');
    });

    // Clear current chat container and show welcome card with middle suggestions
    messagesContainer.innerHTML = '';
    showWelcomeCard();
    messageInput.value = '';
    messageInput.focus();
    console.log('✨ Started new consultation thread from zero.');
  }

  function showWelcomeCard() {
    if (welcomeCard) {
      welcomeCard.style.display = 'flex';
      messagesContainer.appendChild(welcomeCard);
    }
  }

  /**
   * Permanently deletes a single conversation session from PostgreSQL
   */
  async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this consultation thread?')) return;
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (activeSessionId === sessionId) {
          startNewConsultation();
        }
        await loadChatSessions();
      } else {
        alert(data.error || 'Failed to delete session.');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Error communicating with server.');
    }
  }

  // Top and sidebar "New Consultation" triggers
  newChatBtn.addEventListener('click', startNewConsultation);
  clearChatBtn.addEventListener('click', startNewConsultation);

  // Sync button reloads sessions
  syncHistoryBtn.addEventListener('click', () => {
    loadChatSessions();
    if (activeSessionId) {
      switchSession(activeSessionId);
    }
  });

  // Clear All DB History permanently
  clearDbHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to permanently clear ALL saved consultations from PostgreSQL?')) {
      return;
    }
    try {
      await fetch(`/api/chat/history/${activeUserId}`, { method: 'DELETE' });
      startNewConsultation();
      await loadChatSessions();
    } catch (err) {
      console.error('Failed to clear database history:', err);
    }
  });

  // ==========================================================================
  // FEATURE 1: AI-POWERED FINANCIAL CHATBOT (RAG + CONTEXT INJECTION)
  // ==========================================================================

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
  });

  // Enter to send
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isAwaitingResponse && messageInput.value.trim() !== '') {
        chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  });

  // Submit Chat Query
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = messageInput.value.trim();
    if (!query || isAwaitingResponse) return;

    if (welcomeCard) welcomeCard.style.display = 'none';

    // 1. Immediately append user message to UI
    appendMessageEnvelope('user', query, new Date().toISOString(), 'You');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    setLoadingState(true);

    try {
      // 2. Dispatch query to backend controller with session_id
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeUserId,
          session_id: activeSessionId, // Links message strictly to current thread
          message: query,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to communicate with AI Advisor.');
      }

      // Update model badge if present
      if (data.model_used && activeModelName) {
        activeModelName.textContent = data.model_used.replace('models/', '');
      }

      // If a new session was created on the backend, update our activeSessionId and refresh sidebar
      const wasFreshThread = !activeSessionId;
      if (data.session_id) {
        activeSessionId = data.session_id;
      }

      // 3. Append assistant response
      appendMessageEnvelope(
        'assistant',
        data.message,
        data.assistant_record?.timestamp || new Date().toISOString(),
        'ArthaAI Advisor',
        data.intent
      );

      // Refresh sidebar list so new consultation appears or title updates
      if (wasFreshThread) {
        await loadChatSessions();
      }
    } catch (err) {
      appendMessageEnvelope(
        'assistant',
        `⚠️ **Error**: ${err.message || 'Unable to connect to financial intelligence service.'}`,
        new Date().toISOString(),
        'System Alert'
      );
    } finally {
      setLoadingState(false);
      messageInput.focus();
    }
  });

  // Loading state
  function setLoadingState(loading) {
    isAwaitingResponse = loading;
    sendBtn.disabled = loading;
    typingIndicator.style.display = loading ? 'block' : 'none';
    if (loading) scrollToBottom();
  }

  // Append message envelope
  function appendMessageEnvelope(role, text, isoTimestamp, authorName, intent) {
    const envelope = document.createElement('div');
    envelope.className = `message-envelope ${role}`;

    const header = document.createElement('div');
    header.className = 'message-header-row';

    let intentBadgeHtml = '';
    if (intent === 'MARKET') {
      intentBadgeHtml = '<span class="status-chip active" style="margin-left: 8px;">📈 Market Structure</span>';
    } else if (intent === 'FINANCE') {
      intentBadgeHtml = '<span class="status-chip warning" style="margin-left: 8px;">💳 Ledger Audit</span>';
    }

    header.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span class="author-tag">${escapeHtml(authorName)}</span>
        ${intentBadgeHtml}
      </div>
      <span>${formatTime(isoTimestamp)}</span>
    `;

    const bubble = document.createElement('div');
    bubble.className = 'bubble-body';
    bubble.innerHTML = formatMarkdown(text);

    envelope.appendChild(header);
    envelope.appendChild(bubble);
    messagesContainer.appendChild(envelope);
    scrollToBottom();
  }

  // Clickable Middle Suggestion Cards (Moved to Center of New Conversation Page)
  document.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt && !isAwaitingResponse) {
        switchView('view-chat');
        messageInput.value = prompt;
        messageInput.style.height = 'auto';
        chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  });

  // ==========================================================================
  // FEATURE 2: STOCK MARKET ANALYSIS & PREDICTION SYSTEM
  // ==========================================================================
  segBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTicker = btn.getAttribute('data-ticker') || '^NSEI';
      loadMarketData(currentTicker);
    });
  });

  refreshMarketBtn.addEventListener('click', async () => {
    try {
      refreshMarketBtn.disabled = true;
      refreshMarketBtn.textContent = '⏳ Syncing Yahoo Finance...';
      const res = await fetch('/api/market/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 60 }),
      });
      const data = await res.json();
      if (data.success) {
        await loadMarketData(currentTicker);
      }
    } catch (e) {
      alert('Failed to sync live market data.');
    } finally {
      refreshMarketBtn.disabled = false;
      refreshMarketBtn.innerHTML = '<span>🔄 Sync Market Data</span>';
    }
  });

  askMarketAiBtn.addEventListener('click', () => {
    const prompt = `Give me a comprehensive quantitative breakdown of ${currentTicker === '^NSEI' ? 'Nifty 50' : 'S&P 500'} (${currentTicker}) right now. What do the 20 vs 50 SMA crossover, Break of Structure, and Fair Value Gaps mean for next week?`;
    switchView('view-chat');
    messageInput.value = prompt;
    messageInput.style.height = 'auto';
    chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  async function loadMarketData(ticker) {
    try {
      marketAsOfBadge.textContent = 'Analyzing...';
      const isUs = ticker === '^GSPC';
      const currencySymbol = isUs ? '$' : '₹';

      // 1. Fetch Technical Analysis Report
      const analysisRes = await fetch(`/api/market/analysis/${encodeURIComponent(ticker)}`);
      const analysisData = await analysisRes.json();

      if (analysisData.success && analysisData.report) {
        const r = analysisData.report;
        marketAsOfBadge.textContent = `As of ${r.asOfDate} (${r.assetName})`;
        candlesCountBadge.textContent = `${r.totalCandlesAnalyzed} Sessions Analyzed`;

        // Card 1: 20 vs 50 SMA Trend
        trendClosePrice.textContent = `${currencySymbol}${r.trend.currentClose.toLocaleString()}`;
        trendSmaDetails.textContent = `20 SMA: ${currencySymbol}${r.trend.sma20.toLocaleString()} | 50 SMA: ${currencySymbol}${r.trend.sma50.toLocaleString()} (${r.trend.spreadPercentage}%)`;
        trendSummaryText.textContent = r.trend.summary;

        trendCrossoverBadge.className = 'status-chip';
        if (r.trend.crossoverState === 'GOLDEN_CROSS' || r.trend.crossoverState === 'BULLISH_TREND') {
          trendCrossoverBadge.classList.add('success');
          trendCrossoverBadge.textContent = r.trend.crossoverState === 'GOLDEN_CROSS' ? 'Golden Cross' : 'Bullish Alignment';
        } else {
          trendCrossoverBadge.classList.add('danger');
          trendCrossoverBadge.textContent = r.trend.crossoverState === 'DEATH_CROSS' ? 'Death Cross' : 'Bearish Alignment';
        }

        // Card 2: Market Structure (BoS)
        bosStatusBadge.className = 'status-chip';
        if (r.marketStructure.detected) {
          bosStatusBadge.classList.add(r.marketStructure.type === 'BULLISH_BOS' ? 'success' : 'danger');
          bosStatusBadge.textContent = r.marketStructure.type === 'BULLISH_BOS' ? 'Bullish BoS' : 'Bearish BoS';
          bosLevelPrice.textContent = `${currencySymbol}${r.marketStructure.brokenLevel?.toLocaleString() || 'N/A'}`;
        } else {
          bosStatusBadge.classList.add('neutral');
          bosStatusBadge.textContent = 'Consolidating';
          bosLevelPrice.textContent = `${currencySymbol}${r.trend.currentClose.toLocaleString()}`;
        }
        bosSwingsText.textContent = `High: ${currencySymbol}${r.marketStructure.recentSwingHigh?.price || 'N/A'} | Low: ${currencySymbol}${r.marketStructure.recentSwingLow?.price || 'N/A'}`;
        bosDescriptionText.textContent = r.marketStructure.description;

        // Card 3: Fair Value Gaps
        const fvgs = r.imbalances || [];
        fvgCountBadge.textContent = `${fvgs.length} Detected`;
        fvgCountBadge.className = 'status-chip active';
        if (fvgs.length > 0) {
          const latestFvg = fvgs[fvgs.length - 1];
          fvgLatestRange.textContent = `${currencySymbol}${latestFvg.gapBottom} - ${currencySymbol}${latestFvg.gapTop}`;
          fvgFormationDate.textContent = `${latestFvg.type.replace('_', ' ')} (${latestFvg.candle3Date})`;
          fvgDescriptionText.textContent = latestFvg.description;
        } else {
          fvgLatestRange.textContent = 'Balanced';
          fvgFormationDate.textContent = 'No active voids';
          fvgDescriptionText.textContent = 'Market price action is currently balanced with no wide 3-candle imbalance gaps.';
        }

        // Card 4: Point of Control (PoC) & Liquidity
        if (r.keyLevels.pointOfControl) {
          pocPriceLevel.textContent = `${currencySymbol}${r.keyLevels.pointOfControl.toLocaleString()}`;
          pocWeightText.textContent = `Institutional Value Node at ${currencySymbol}${r.keyLevels.pointOfControl.toLocaleString()}`;
          pocDescriptionText.textContent = `Major Volume Profile density. Immediate swing resistance at ${currencySymbol}${r.keyLevels.resistance || 'N/A'}, support at ${currencySymbol}${r.keyLevels.support || 'N/A'}.`;
        }

        // AI Market Prediction & Commentary
        marketAiPredictionBody.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <p><strong>Structural Outlook:</strong> ${r.assetName} (${r.ticker}) closed at <strong>${currencySymbol}${r.trend.currentClose.toLocaleString()}</strong>. ${r.marketStructure.description}</p>
            <p><strong>Momentum Status:</strong> Moving averages indicate <strong>${r.trend.crossoverState.replace('_', ' ')}</strong> with the 20-day SMA at ${currencySymbol}${r.trend.sma20.toLocaleString()} and 50-day SMA at ${currencySymbol}${r.trend.sma50.toLocaleString()}.</p>
            <p><strong>Actionable Trading Zones:</strong> Heavy institutional volume is centered around the Point of Control at <strong>${currencySymbol}${r.keyLevels.pointOfControl?.toLocaleString()}</strong>. Key overhead resistance is locked at <strong>${currencySymbol}${r.keyLevels.resistance?.toLocaleString() || 'N/A'}</strong>.</p>
          </div>
        `;
      }

      // 2. Fetch Candlesticks Table
      const candlesRes = await fetch(`/api/market/candles/${encodeURIComponent(ticker)}`);
      const candlesData = await candlesRes.json();
      if (candlesData.success && Array.isArray(candlesData.candles)) {
        renderCandlesTable(candlesData.candles.slice(-15).reverse(), currencySymbol);
      }
    } catch (err) {
      console.error('Market data load error:', err);
    }
  }

  function renderCandlesTable(candles, symbol) {
    marketCandlesTbody.innerHTML = '';
    if (!candles || candles.length === 0) {
      marketCandlesTbody.innerHTML = '<tr><td colspan="6" class="table-loading">No candlestick records available.</td></tr>';
      return;
    }

    candles.forEach((c) => {
      const tr = document.createElement('tr');
      const isBullish = c.close >= c.open;
      const colorStyle = isBullish ? 'color: #34d399;' : 'color: #f87171;';

      tr.innerHTML = `
        <td><strong>${c.date}</strong></td>
        <td>${symbol}${c.open.toLocaleString()}</td>
        <td>${symbol}${c.high.toLocaleString()}</td>
        <td>${symbol}${c.low.toLocaleString()}</td>
        <td style="${colorStyle}"><strong>${symbol}${c.close.toLocaleString()}</strong></td>
        <td>${c.volume.toLocaleString()}</td>
      `;
      marketCandlesTbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // FEATURE 3: AI-POWERED PERSONAL FINANCE (LEDGER, PIE CHART & TRANSACTION EDIT)
  // ==========================================================================
  askFinanceAiBtn.addEventListener('click', () => {
    const prompt = 'Analyze my monthly personal finance ledger. How much did I spend, what is my current savings rate, and what are your strict recommendations to cut discretionary leaks and save more?';
    switchView('view-chat');
    messageInput.value = prompt;
    messageInput.style.height = 'auto';
    chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  // Open modal in "Add" mode
  openAddTxModalBtn.addEventListener('click', () => {
    txEditId.value = '';
    addTransactionForm.reset();
    if (txDate) txDate.value = new Date().toISOString().split('T')[0];
    txModalHeading.textContent = 'Add Personal Transaction';
    txModalSubheading.textContent = 'Recorded into PostgreSQL with integer paise precision';
    saveTxBtn.innerHTML = '<span>Save Transaction</span>';
    txModal.style.display = 'flex';
  });

  txModalClose.addEventListener('click', () => {
    txModal.style.display = 'none';
  });

  // Close modal on backdrop click
  txModal.addEventListener('click', (e) => {
    if (e.target === txModal) {
      txModal.style.display = 'none';
    }
  });

  async function loadCategories() {
    try {
      const res = await fetch('/api/finance/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        txCategory.innerHTML = '<option value="">Select a Category...</option>';
        data.categories.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = `${cat.type === 'income' ? '🟢' : '🔴'} ${cat.name}`;
          txCategory.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('Could not load categories:', e);
    }
  }

  // Open modal in "Edit" mode
  function openEditTxModal(txId) {
    const tx = transactionsCache.get(txId);
    if (!tx) return;

    txEditId.value = tx.id;
    txAmount.value = tx.amount;
    txCategory.value = tx.categoryId || '';
    txDescription.value = tx.description;
    txDate.value = tx.date;

    txModalHeading.textContent = 'Edit Personal Transaction';
    txModalSubheading.textContent = 'Update transaction record in PostgreSQL';
    saveTxBtn.innerHTML = '<span>Update Transaction</span>';
    txModal.style.display = 'flex';
  }

  // Add / Edit Form submission
  addTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEditing = Boolean(txEditId.value);
    const amountVal = parseFloat(txAmount.value);
    const catId = txCategory.value;
    const desc = txDescription.value.trim();
    const dateVal = txDate.value;

    if (!amountVal || !catId || !desc) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      saveTxBtn.disabled = true;
      saveTxBtn.innerHTML = isEditing ? '<span>Updating PostgreSQL...</span>' : '<span>Saving to PostgreSQL...</span>';

      const url = isEditing
        ? `/api/finance/transactions/${encodeURIComponent(txEditId.value)}`
        : '/api/finance/transactions';

      const method = isEditing ? 'PUT' : 'POST';

      const bodyPayload = isEditing
        ? {
            category_id: catId,
            amount: amountVal,
            description: desc,
            date: dateVal,
          }
        : {
            user_id: activeUserId,
            category_id: catId,
            amount: amountVal,
            description: desc,
            date: dateVal,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      saveTxBtn.disabled = false;
      saveTxBtn.innerHTML = isEditing ? '<span>Update Transaction</span>' : '<span>Save Transaction</span>';

      if (data.success) {
        txModal.style.display = 'none';
        txEditId.value = '';
        addTransactionForm.reset();
        if (txDate) txDate.value = new Date().toISOString().split('T')[0];
        await loadFinanceData();
      } else {
        alert(data.error || 'Failed to persist transaction.');
      }
    } catch (err) {
      saveTxBtn.disabled = false;
      saveTxBtn.innerHTML = '<span>Save Transaction</span>';
      alert('Network error saving transaction.');
    }
  });

  async function loadFinanceData() {
    try {
      const res = await fetch(`/api/finance/ledger/${activeUserId}`);
      const data = await res.json();

      if (!data.success || !data.ledger) return;

      const l = data.ledger;
      financePeriodBadge.textContent = l.period.label;
      finIncomeTotal.textContent = `₹${l.metrics.totalIncome.toLocaleString('en-IN')}`;
      finExpenseTotal.textContent = `₹${l.metrics.totalExpenses.toLocaleString('en-IN')}`;
      finSavingsTotal.textContent = `₹${l.metrics.netSavings.toLocaleString('en-IN')}`;

      finSavingsRate.textContent = `${l.metrics.savingsRatePercent}%`;
      finSavingsBar.style.width = `${Math.min(Math.max(l.metrics.savingsRatePercent, 0), 100)}%`;

      finRateStatus.className = 'status-chip';
      if (l.metrics.savingsRatePercent >= 20) {
        finRateStatus.classList.add('success');
        finRateStatus.textContent = 'Healthy (≥20%)';
      } else {
        finRateStatus.classList.add('danger');
        finRateStatus.textContent = 'Low (<20%)';
      }

      // 1. Render Graphical Donut / Pie Chart & Interactive Legend
      renderExpenseDonutChart(l.categoryBreakdown.expenses || [], l.metrics.totalExpenses);

      // 2. Render Discretionary Spending Alert Boxes
      discretionaryAlertsList.innerHTML = '';
      if (l.discretionarySpendingAlerts && l.discretionarySpendingAlerts.length > 0) {
        l.discretionarySpendingAlerts.forEach((alertItem) => {
          const div = document.createElement('div');
          div.className = 'alert-item-box';
          div.innerHTML = `
            <strong>${escapeHtml(alertItem.categoryName)}</strong>
            <div class="alert-amount">₹${alertItem.amount.toLocaleString('en-IN')}</div>
            <span>${alertItem.percentageOfExpenses}% of monthly outflow</span>
          `;
          discretionaryAlertsList.appendChild(div);
        });
      } else {
        discretionaryAlertsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No severe discretionary spending leaks found for this cycle.</p>';
      }

      // 3. Render Category Progress Bars
      categoryBarsList.innerHTML = '';
      if (l.categoryBreakdown.expenses && l.categoryBreakdown.expenses.length > 0) {
        l.categoryBreakdown.expenses.forEach((cat) => {
          const row = document.createElement('div');
          row.className = 'category-bar-row';
          row.innerHTML = `
            <div class="category-bar-meta">
              <strong>${escapeHtml(cat.categoryName)}</strong>
              <span>₹${cat.totalAmount.toLocaleString('en-IN')} (${cat.percentageOfTotal}%)</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${cat.percentageOfTotal}%;"></div>
            </div>
          `;
          categoryBarsList.appendChild(row);
        });
      }

      // 4. Render Transactions Table with Edit & Delete Options
      renderTransactionsTable(l.recentTransactions || []);
    } catch (err) {
      console.error('Finance ledger load error:', err);
    }
  }

  /**
   * Renders a responsive, mathematically precise SVG Donut Chart with glowing VisionOS segments
   */
  function renderExpenseDonutChart(expenses, totalExpenses) {
    if (!financePieChartContainer || !financePieLegend) return;

    financePieChartContainer.innerHTML = '';
    financePieLegend.innerHTML = '';

    if (!expenses || expenses.length === 0 || totalExpenses <= 0) {
      financePieChartContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; height:100%; color: var(--text-muted);">
          <span style="font-size: 2rem; margin-bottom: 8px;">📊</span>
          <span style="font-size: 0.82rem;">No expense outflows recorded for this period.</span>
        </div>
      `;
      financePieLegend.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">Add expenses to visualize category distribution.</div>';
      return;
    }

    // Geometry of SVG Donut
    const r = 54; // radius
    const circumference = 2 * Math.PI * r; // ~339.292

    let accumulatedOffset = 0;
    const circlesSvg = expenses.map((cat, idx) => {
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const fraction = cat.totalAmount / totalExpenses;
      const dashLength = fraction * circumference;
      const strokeOffset = -accumulatedOffset;
      accumulatedOffset += dashLength;

      return `
        <circle
          class="donut-segment"
          cx="80"
          cy="80"
          r="${r}"
          stroke="${color}"
          stroke-dasharray="${dashLength.toFixed(2)} ${(circumference - dashLength).toFixed(2)}"
          stroke-dashoffset="${strokeOffset.toFixed(2)}"
        >
          <title>${escapeHtml(cat.categoryName)}: ₹${cat.totalAmount.toLocaleString('en-IN')} (${cat.percentageOfTotal}%)</title>
        </circle>
      `;
    }).join('');

    // Inject SVG and centered metrics
    financePieChartContainer.innerHTML = `
      <svg class="pie-donut-svg" viewBox="0 0 160 160">
        <!-- Background track -->
        <circle cx="80" cy="80" r="${r}" stroke="rgba(255, 255, 255, 0.05)" stroke-width="22" fill="none" />
        <!-- Colored Segments -->
        ${circlesSvg}
      </svg>
      <div class="donut-center-info">
        <span class="donut-center-label">Total Outflow</span>
        <span class="donut-center-value">₹${totalExpenses.toLocaleString('en-IN')}</span>
        <span class="donut-center-sub">${expenses.length} Categories</span>
      </div>
    `;

    // Render Legend Items Grid
    expenses.forEach((cat, idx) => {
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-left">
          <span class="legend-color-dot" style="background-color: ${color}; color: ${color};"></span>
          <span class="legend-name" title="${escapeHtml(cat.categoryName)}">${escapeHtml(cat.categoryName)}</span>
        </div>
        <div class="legend-right">
          <span class="legend-amount">₹${cat.totalAmount.toLocaleString('en-IN')}</span>
          <span class="legend-pct">${cat.percentageOfTotal}%</span>
        </div>
      `;
      financePieLegend.appendChild(item);
    });
  }

  /**
   * Renders the transactions table with Edit and Delete capabilities
   */
  function renderTransactionsTable(transactions) {
    financeTransactionsTbody.innerHTML = '';
    transactionsCache.clear();
    txCountBadge.textContent = `${transactions.length} Records`;

    if (!transactions || transactions.length === 0) {
      financeTransactionsTbody.innerHTML = '<tr><td colspan="6" class="table-loading">No transactions recorded. Click "➕ Add Transaction" to insert your first record.</td></tr>';
      return;
    }

    transactions.forEach((t) => {
      transactionsCache.set(t.id, t);
      const tr = document.createElement('tr');
      const isIncome = t.categoryType === 'income';
      const badgeStyle = isIncome ? 'background: rgba(16, 185, 129, 0.2); color: #34d399;' : 'background: rgba(239, 68, 68, 0.2); color: #f87171;';
      const amountStyle = isIncome ? 'color: #34d399; font-weight: 700;' : 'color: #f87171; font-weight: 700;';

      tr.innerHTML = `
        <td>${t.date}</td>
        <td><strong>${escapeHtml(t.description)}</strong></td>
        <td><span class="status-chip" style="${badgeStyle}">${escapeHtml(t.categoryName)}</span></td>
        <td>${isIncome ? 'Income' : 'Expense'}</td>
        <td style="${amountStyle}">${isIncome ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}</td>
        <td>
          <div class="table-action-group">
            <button class="edit-tx-btn" data-edit-id="${t.id}" title="Edit transaction">
              ✏️ Edit
            </button>
            <button class="glass-action-pill danger delete-tx-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.72rem;">
              Delete
            </button>
          </div>
        </td>
      `;
      financeTransactionsTbody.appendChild(tr);
    });

    // Wire up Edit buttons
    document.querySelectorAll('.edit-tx-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget).getAttribute('data-edit-id');
        if (id) openEditTxModal(id);
      });
    });

    // Wire up Delete buttons
    document.querySelectorAll('.delete-tx-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget).getAttribute('data-id');
        if (!id || !confirm('Delete this transaction?')) return;
        try {
          await fetch(`/api/finance/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
          await loadFinanceData();
        } catch (err) {
          alert('Could not delete transaction.');
        }
      });
    });
  }

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function formatTime(isoStr) {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function formatSessionDate(isoStr) {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let parsed = escapeHtml(text);

    // Code blocks
    parsed = parsed.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    parsed = parsed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Headers
    parsed = parsed.replace(/^### (.*$)/gim, '<h4 style="margin: 12px 0 6px; color: #38bdf8;">$1</h4>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h3 style="margin: 14px 0 8px; color: #818cf8;">$1</h3>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h2 style="margin: 16px 0 10px; color: #fff;">$1</h2>');
    // Unordered lists
    parsed = parsed.replace(/^\* (.*$)/gim, '<li style="margin-left: 20px;">$1</li>');
    parsed = parsed.replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>');
    // Line breaks
    parsed = parsed.replace(/\n\n/g, '<br><br>');
    parsed = parsed.replace(/\n/g, '<br>');

    return parsed;
  }

  /* ==========================================================================
     Financial Quick Calculators Logic (SIP, Loan EMI, 50/30/20 Budget)
     ========================================================================== */
  const calcToggleBtn = document.getElementById('calc-toggle-btn');
  const calcModal = document.getElementById('calc-modal');
  const calcModalClose = document.getElementById('calc-modal-close');
  const calcTabBtns = document.querySelectorAll('.calc-tab-btn');
  const calcTabPanels = {
    sip: document.getElementById('tab-sip'),
    emi: document.getElementById('tab-emi'),
    budget: document.getElementById('tab-budget'),
  };

  function formatINR(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  if (calcToggleBtn && calcModal) {
    calcToggleBtn.addEventListener('click', () => {
      calcModal.style.display = 'flex';
      calculateSIP();
      calculateEMI();
      calculateBudget();
    });

    if (calcModalClose) {
      calcModalClose.addEventListener('click', () => {
        calcModal.style.display = 'none';
      });
    }

    calcModal.addEventListener('click', (e) => {
      if (e.target === calcModal) calcModal.style.display = 'none';
    });
  }

  calcTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      calcTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      Object.entries(calcTabPanels).forEach(([key, panel]) => {
        if (panel) panel.style.display = key === target ? 'flex' : 'none';
      });
    });
  });

  // 1. SIP Calculator
  const sipAmtSlider = document.getElementById('sip-amount-slider');
  const sipRateSlider = document.getElementById('sip-rate-slider');
  const sipYearsSlider = document.getElementById('sip-years-slider');

  function calculateSIP() {
    if (!sipAmtSlider || !sipRateSlider || !sipYearsSlider) return;
    const P = parseFloat(sipAmtSlider.value);
    const cagr = parseFloat(sipRateSlider.value);
    const years = parseFloat(sipYearsSlider.value);

    const amtDisp = document.getElementById('sip-amount-display');
    const rateDisp = document.getElementById('sip-rate-display');
    const yearsDisp = document.getElementById('sip-years-display');
    if (amtDisp) amtDisp.textContent = formatINR(P);
    if (rateDisp) rateDisp.textContent = `${cagr}%`;
    if (yearsDisp) yearsDisp.textContent = `${years} Years`;

    const i = (cagr / 100) / 12;
    const n = years * 12;
    const invested = P * n;
    const total = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = total - invested;

    const invRes = document.getElementById('sip-invested-res');
    const retRes = document.getElementById('sip-returns-res');
    const totRes = document.getElementById('sip-total-res');
    if (invRes) invRes.textContent = formatINR(invested);
    if (retRes) retRes.textContent = formatINR(returns);
    if (totRes) totRes.textContent = formatINR(total);
  }

  [sipAmtSlider, sipRateSlider, sipYearsSlider].forEach((slider) => {
    if (slider) slider.addEventListener('input', calculateSIP);
  });

  // 2. Loan EMI Calculator
  const emiAmtSlider = document.getElementById('emi-amount-slider');
  const emiRateSlider = document.getElementById('emi-rate-slider');
  const emiYearsSlider = document.getElementById('emi-years-slider');

  function calculateEMI() {
    if (!emiAmtSlider || !emiRateSlider || !emiYearsSlider) return;
    const P = parseFloat(emiAmtSlider.value);
    const annualRate = parseFloat(emiRateSlider.value);
    const years = parseFloat(emiYearsSlider.value);

    const amtDisp = document.getElementById('emi-amount-display');
    const rateDisp = document.getElementById('emi-rate-display');
    const yearsDisp = document.getElementById('emi-years-display');
    if (amtDisp) amtDisp.textContent = formatINR(P);
    if (rateDisp) rateDisp.textContent = `${annualRate}%`;
    if (yearsDisp) yearsDisp.textContent = `${years} Years`;

    const r = (annualRate / 100) / 12;
    const n = years * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const mRes = document.getElementById('emi-monthly-res');
    const intRes = document.getElementById('emi-interest-res');
    const totRes = document.getElementById('emi-total-res');
    if (mRes) mRes.textContent = formatINR(emi);
    if (intRes) intRes.textContent = formatINR(totalInterest);
    if (totRes) totRes.textContent = formatINR(totalPayment);
  }

  [emiAmtSlider, emiRateSlider, emiYearsSlider].forEach((slider) => {
    if (slider) slider.addEventListener('input', calculateEMI);
  });

  // 3. 50/30/20 Budget Calculator
  const budgetIncomeSlider = document.getElementById('budget-income-slider');

  function calculateBudget() {
    if (!budgetIncomeSlider) return;
    const income = parseFloat(budgetIncomeSlider.value);
    const incDisp = document.getElementById('budget-income-display');
    if (incDisp) incDisp.textContent = formatINR(income);

    const needs = income * 0.50;
    const wants = income * 0.30;
    const savings = income * 0.20;

    const nRes = document.getElementById('budget-needs-res');
    const wRes = document.getElementById('budget-wants-res');
    const sRes = document.getElementById('budget-savings-res');
    if (nRes) nRes.textContent = formatINR(needs);
    if (wRes) wRes.textContent = formatINR(wants);
    if (sRes) sRes.textContent = formatINR(savings);
  }

  if (budgetIncomeSlider) budgetIncomeSlider.addEventListener('input', calculateBudget);

  // Ask AI prefill handlers
  const sipAskBtn = document.getElementById('sip-ask-ai-btn');
  if (sipAskBtn) {
    sipAskBtn.addEventListener('click', () => {
      const p = sipAmtSlider.value;
      const r = sipRateSlider.value;
      const y = sipYearsSlider.value;
      if (calcModal) calcModal.style.display = 'none';
      chatInput.value = `I am planning a SIP of ₹${parseInt(p, 10).toLocaleString('en-IN')}/month for ${y} years at an expected CAGR of ${r}%. Can you analyze which asset allocation (e.g., Large-cap index vs Flexi-cap) suits this horizon and how step-up SIP could boost my final wealth?`;
      chatInput.focus();
      handleSend();
    });
  }

  const emiAskBtn = document.getElementById('emi-ask-ai-btn');
  if (emiAskBtn) {
    emiAskBtn.addEventListener('click', () => {
      const p = emiAmtSlider.value;
      const r = emiRateSlider.value;
      const y = emiYearsSlider.value;
      if (calcModal) calcModal.style.display = 'none';
      chatInput.value = `I am considering a loan of ₹${parseInt(p, 10).toLocaleString('en-IN')} at ${r}% interest for ${y} years. What are the best strategies to prepay this loan faster and save interest?`;
      chatInput.focus();
      handleSend();
    });
  }

  const budgetAskBtn = document.getElementById('budget-ask-ai-btn');
  if (budgetAskBtn) {
    budgetAskBtn.addEventListener('click', () => {
      const inc = budgetIncomeSlider.value;
      if (calcModal) calcModal.style.display = 'none';
      chatInput.value = `My monthly take-home income is ₹${parseInt(inc, 10).toLocaleString('en-IN')}. Based on the 50/30/20 rule, help me break down an actionable monthly budget covering rent, groceries, discretionary spending, emergency fund, and mutual funds.`;
      chatInput.focus();
      handleSend();
    });
  }

  // Export conversation as Markdown (.md)
  const exportBtn = document.getElementById('export-chat-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const envelopes = chatMessagesContainer.querySelectorAll('.message-envelope');
      if (envelopes.length === 0) {
        showToast('No messages to export yet.');
        return;
      }

      let markdown = `# ArthaAI Financial Advisory Session Transcript\n`;
      markdown += `*Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)*\n\n---\n\n`;

      envelopes.forEach((env) => {
        const isUser = env.classList.contains('user');
        const role = isUser ? '👤 User' : '🤖 ArthaAI (Advisor)';
        const textContent = env.querySelector('.message-bubble')?.innerText || '';
        markdown += `### ${role}\n\n${textContent.trim()}\n\n---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arthafin_transcript_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Conversation exported as Markdown.');
    });
  }

});
