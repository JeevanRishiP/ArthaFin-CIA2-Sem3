// ==========================================================================
// ArthaAI • Client Application Logic (Unified Multi-System Architecture)
// 1. AI Financial Chatbot (with Persistent PostgreSQL History)
// 2. AI-Based Stock Market Analysis & Prediction Engine
// 3. AI-Powered Personal Finance & Wealth Ledger Management
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

  // --- DOM Elements: View 1 (Chatbot) ---
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesContainer = document.getElementById('messages-container');
  const welcomeCard = document.getElementById('welcome-card');
  const typingIndicator = document.getElementById('typing-indicator');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const syncHistoryBtn = document.getElementById('sync-history-btn');
  const clearDbHistoryBtn = document.getElementById('clear-db-history-btn');

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
  const discretionaryAlertsList = document.getElementById('discretionary-alerts-list');
  const categoryBarsList = document.getElementById('category-bars-list');
  const financeTransactionsTbody = document.getElementById('finance-transactions-tbody');
  const txCountBadge = document.getElementById('tx-count-badge');
  const openAddTxModalBtn = document.getElementById('open-add-tx-modal-btn');
  const askFinanceAiBtn = document.getElementById('ask-finance-ai-btn');
  const txModal = document.getElementById('tx-modal');
  const txModalClose = document.getElementById('tx-modal-close');
  const addTransactionForm = document.getElementById('add-transaction-form');
  const txAmount = document.getElementById('tx-amount');
  const txCategory = document.getElementById('tx-category');
  const txDescription = document.getElementById('tx-description');
  const txDate = document.getElementById('tx-date');

  // --- State Variables ---
  const activeUserId = 1; // Primary active user ID
  let currentTicker = '^NSEI';
  let isAwaitingResponse = false;
  let activeView = 'view-chat';

  // ==========================================================================
  // INITIALIZATION: Load Persistent Chat History Immediately
  // ==========================================================================
  initApplication();

  async function initApplication() {
    console.log('🚀 Initializing ArthaAI Unified Dashboard...');
    // Set default date for transaction modal
    if (txDate) txDate.value = new Date().toISOString().split('T')[0];

    // Load persistent chat history from PostgreSQL immediately on launch
    await loadUserHistory(activeUserId);

    // Populate category dropdown
    loadCategories();
  }

  // ==========================================================================
  // VIEW SWITCHER LOGIC
  // ==========================================================================
  function switchView(targetViewId) {
    if (!workspaceViews[targetViewId]) return;
    activeView = targetViewId;

    // Toggle active state on tabs
    navTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-view') === targetViewId);
    });

    sidebarModeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === targetViewId);
    });

    // Show selected view, hide others
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

    // Close mobile sidebar
    if (window.innerWidth <= 900 && sidebar) {
      sidebar.classList.remove('open');
    }

    // Trigger on-demand data loads
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

  // Mobile sidebar controls
  sidebarToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // ==========================================================================
  // FEATURE 1: AI-POWERED FINANCIAL CHATBOT (PERSISTENT CONVERSATION HISTORY)
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

    // 1. Immediately append user message to DOM
    appendMessageEnvelope('user', query, new Date().toISOString(), 'You');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    setLoadingState(true);

    try {
      // 2. Dispatch query to backend controller (saves to PostgreSQL chat_history)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeUserId,
          message: query,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to communicate with AI Advisor.');
      }

      if (data.model_used && activeModelName) {
        activeModelName.textContent = data.model_used.replace('models/', '');
      }

      // 3. Append assistant response
      appendMessageEnvelope(
        'assistant',
        data.message,
        data.assistant_record?.timestamp || new Date().toISOString(),
        'ArthaAI Advisor',
        data.intent
      );
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
      intentBadgeHtml = '<span class="status-chip active" style="margin-left: 8px;">📈 Market Analysis</span>';
    } else if (intent === 'FINANCE') {
      intentBadgeHtml = '<span class="status-chip warning" style="margin-left: 8px;">💳 Finance Ledger</span>';
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

  // Load chat history from PostgreSQL
  async function loadUserHistory(userId) {
    try {
      setLoadingState(true);
      const res = await fetch(`/api/chat/history/${userId}`);
      const data = await res.json();

      messagesContainer.innerHTML = '';

      if (data.success && Array.isArray(data.history) && data.history.length > 0) {
        if (welcomeCard) welcomeCard.style.display = 'none';
        data.history.forEach((item) => {
          const sender = item.role === 'user' ? 'You' : 'ArthaAI Advisor';
          appendMessageEnvelope(item.role, item.message_content, item.timestamp, sender);
        });
        console.log(`✅ Loaded ${data.history.length} saved conversation messages from PostgreSQL.`);
      } else {
        if (welcomeCard) {
          welcomeCard.style.display = 'flex';
          messagesContainer.appendChild(welcomeCard);
        }
      }
    } catch (err) {
      console.error('Failed to load persistent history:', err);
    } finally {
      setLoadingState(false);
    }
  }

  // Reload history manually
  syncHistoryBtn.addEventListener('click', () => {
    loadUserHistory(activeUserId);
  });

  // Clear Database History permanently
  clearDbHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to permanently clear all saved chat history from PostgreSQL?')) {
      return;
    }
    try {
      await fetch(`/api/chat/history/${activeUserId}`, { method: 'DELETE' });
      messagesContainer.innerHTML = '';
      if (welcomeCard) {
        welcomeCard.style.display = 'flex';
        messagesContainer.appendChild(welcomeCard);
      }
    } catch (err) {
      console.error('Failed to clear database history:', err);
    }
  });

  // Clear current view
  clearChatBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    if (welcomeCard) {
      welcomeCard.style.display = 'flex';
      messagesContainer.appendChild(welcomeCard);
    }
  });

  newChatBtn.addEventListener('click', () => {
    switchView('view-chat');
    messagesContainer.innerHTML = '';
    if (welcomeCard) {
      welcomeCard.style.display = 'flex';
      messagesContainer.appendChild(welcomeCard);
    }
    messageInput.focus();
  });

  // Clickable Prompt Chips
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

      // 1. Fetch Quantitative Technical Analysis Report
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
  // FEATURE 3: AI-POWERED PERSONAL FINANCE & WEALTH LEDGER MANAGEMENT
  // ==========================================================================
  askFinanceAiBtn.addEventListener('click', () => {
    const prompt = 'Analyze my monthly personal finance ledger. How much did I spend, what is my current savings rate, and what are your strict recommendations to cut discretionary leaks and save more?';
    switchView('view-chat');
    messageInput.value = prompt;
    messageInput.style.height = 'auto';
    chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  openAddTxModalBtn.addEventListener('click', () => {
    txModal.style.display = 'flex';
  });

  txModalClose.addEventListener('click', () => {
    txModal.style.display = 'none';
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

  addTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(txAmount.value);
    const catId = txCategory.value;
    const desc = txDescription.value.trim();
    const dateVal = txDate.value;

    if (!amountVal || !catId || !desc) return;

    try {
      const btn = document.getElementById('save-tx-btn');
      btn.disabled = true;
      btn.textContent = 'Saving to PostgreSQL...';

      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeUserId,
          category_id: catId,
          amount: amountVal,
          description: desc,
          date: dateVal,
        }),
      });

      const data = await res.json();
      btn.disabled = false;
      btn.textContent = 'Save Transaction to PostgreSQL';

      if (data.success) {
        txModal.style.display = 'none';
        addTransactionForm.reset();
        if (txDate) txDate.value = new Date().toISOString().split('T')[0];
        await loadFinanceData();
      } else {
        alert(data.error || 'Failed to save transaction.');
      }
    } catch (err) {
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

      // Render Discretionary Spending Alert Boxes
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

      // Render Category Progress Bars
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

      // Render Transactions Table
      renderTransactionsTable(l.recentTransactions || []);
    } catch (err) {
      console.error('Finance ledger load error:', err);
    }
  }

  function renderTransactionsTable(transactions) {
    financeTransactionsTbody.innerHTML = '';
    txCountBadge.textContent = `${transactions.length} Records`;

    if (!transactions || transactions.length === 0) {
      financeTransactionsTbody.innerHTML = '<tr><td colspan="6" class="table-loading">No transactions recorded. Click "➕ Add Transaction" to insert your first record.</td></tr>';
      return;
    }

    transactions.forEach((t) => {
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
          <button class="glass-action-pill danger delete-tx-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.72rem;">
            Delete
          </button>
        </td>
      `;
      financeTransactionsTbody.appendChild(tr);
    });

    // Delete transaction handler
    document.querySelectorAll('.delete-tx-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget).getAttribute('data-id');
        if (!id || !confirm('Delete this transaction?')) return;
        try {
          await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' });
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

  function escapeHtml(str) {
    if (!str) return '';
    return str
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
});
