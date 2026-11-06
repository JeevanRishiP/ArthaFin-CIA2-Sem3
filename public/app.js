// ==========================================================================
// ArthaAI • Client Application Master Controller
// 1. AI Financial Chatbot (Multi-Session Isolated Conversation Management)
// 2. AI-Based Stock Market Quantitative Engine (SMA Crossover, BoS & FVGs)
// 3. AI-Powered Personal Finance & Wealth Ledger (Interactive Donut Chart)
// 4. Pinterest-Style Solid Dark Authentication (Google SSO + Email Flow)
// 5. Financial Quick Calculators (SIP, Loan EMI, 50/30/20 Budget Allocator)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // DOM ELEMENT REFERENCES (All safely guarded with null checks)
  // ==========================================================================

  // --- View Switching & Navigation ---
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

  // --- Multi-Session Conversations in Sidebar ---
  const sidebarSessionsList = document.getElementById('sidebar-sessions-list');
  const sessionCountPill = document.getElementById('session-count-pill');
  const newChatBtn = document.getElementById('new-chat-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const clearDbHistoryBtn = document.getElementById('clear-db-history-btn');
  const syncHistoryBtn = document.getElementById('sync-history-btn');

  // --- User Profiles & Authentication Anchor in Sidebar & Header ---
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserEmail = document.getElementById('sidebar-user-email');
  const sidebarSignoutBtn = document.getElementById('sidebar-signout-btn');
  const sidebarGuestCard = document.getElementById('sidebar-guest-card');
  const sidebarLoginTrigger = document.getElementById('sidebar-login-trigger');
  const headerLoginBtn = document.getElementById('header-login-btn');
  const headerUserCapsule = document.getElementById('header-user-capsule');
  const headerAvatar = document.getElementById('header-avatar');
  const headerName = document.getElementById('header-name');

  // --- Pinterest-Style Auth Modal Elements ---
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const authErrorBanner = document.getElementById('auth-error-banner');
  const googleAuthBtn = document.getElementById('google-auth-btn');

  const authStepEmail = document.getElementById('auth-step-email');
  const authEmailInput = document.getElementById('auth-email-input');
  const emailContinueBtn = document.getElementById('email-continue-btn');

  const authStepLogin = document.getElementById('auth-step-login');
  const loginEmailDisplay = document.getElementById('login-email-display');
  const editEmailBtn = document.getElementById('edit-email-btn');
  const authLoginPassword = document.getElementById('auth-login-password');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const loginBackToEmailBtn = document.getElementById('login-back-to-email-btn');

  const authStepRegister = document.getElementById('auth-step-register');
  const registerEmailDisplay = document.getElementById('register-email-display');
  const editRegisterEmailBtn = document.getElementById('edit-register-email-btn');
  const authRegisterName = document.getElementById('auth-register-name');
  const authRegisterPassword = document.getElementById('auth-register-password');
  const authRegisterConfirm = document.getElementById('auth-register-confirm');
  const passwordStrengthBar = document.getElementById('password-strength-bar');
  const registerSubmitBtn = document.getElementById('register-submit-btn');
  const registerBackToEmailBtn = document.getElementById('register-back-to-email-btn');

  // --- View 1: Chatbot Elements ---
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesContainer = document.getElementById('messages-container');
  const welcomeCard = document.getElementById('welcome-card');
  const typingIndicator = document.getElementById('typing-indicator');

  // --- View 2: Stock Market Elements ---
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

  // --- View 3: Personal Finance Elements ---
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

  // Transaction Modal Elements
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

  // --- Financial Quick Calculators Elements ---
  const calcToggleBtn = document.getElementById('calc-toggle-btn');
  const calcModal = document.getElementById('calc-modal');
  const calcModalClose = document.getElementById('calc-modal-close');
  const calcTabBtns = document.querySelectorAll('.calc-tab-btn');
  const calcTabPanels = {
    sip: document.getElementById('tab-sip'),
    emi: document.getElementById('tab-emi'),
    budget: document.getElementById('tab-budget'),
  };
  const exportChatBtn = document.getElementById('export-chat-btn');

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  let currentUser = {
    id: 1,
    name: 'Rohan Sharma',
    email: 'rohan.sharma@arthafin.ai',
    is_authenticated: false,
  };

  let activeSessionId = null; // null = fresh consultation
  let currentTicker = '^NSEI';
  let isAwaitingResponse = false;
  let activeView = 'view-chat';
  const transactionsCache = new Map();

  const DONUT_COLORS = [
    '#38bdf8', '#818cf8', '#34d399', '#f43f5e',
    '#fbbf24', '#a855f7', '#06b6d4', '#f97316',
    '#ec4899', '#10b981', '#6366f1', '#eab308'
  ];

  // ==========================================================================
  // INITIALIZATION ON LOAD
  // ==========================================================================
  initApplication();

  async function initApplication() {
    console.log('🚀 Initializing ArthaAI Unified Intelligence System...');

    // 1. Hydrate authentication session from localStorage
    await hydrateAuthSession();

    // 2. Set default date on transaction modal
    if (txDate) txDate.value = new Date().toISOString().split('T')[0];

    // 3. Load past consultation sessions into sidebar
    await loadChatSessions();

    // 4. Preload categories for transaction ledger
    loadCategories();
  }

  // ==========================================================================
  // AUTHENTICATION: PINTEREST-STYLE SSO & CREDENTIAL MANAGER
  // ==========================================================================

  async function hydrateAuthSession() {
    const token = localStorage.getItem('arthafin_token');
    if (!token) {
      updateUserUIState(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        currentUser = { ...data.user, is_authenticated: true };
        updateUserUIState(true);
      } else {
        localStorage.removeItem('arthafin_token');
        updateUserUIState(false);
      }
    } catch {
      updateUserUIState(false);
    }
  }

  function updateUserUIState(isLoggedIn) {
    if (isLoggedIn && currentUser) {
      const initial = (currentUser.name || currentUser.email || 'U')[0].toUpperCase();
      if (sidebarUserCard) sidebarUserCard.style.display = 'flex';
      if (sidebarGuestCard) sidebarGuestCard.style.display = 'none';
      if (sidebarUserAvatar) sidebarUserAvatar.textContent = initial;
      if (sidebarUserName) sidebarUserName.textContent = currentUser.name || 'User';
      if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email || '';

      if (headerLoginBtn) headerLoginBtn.style.display = 'none';
      if (headerUserCapsule) {
        headerUserCapsule.style.display = 'flex';
        if (headerAvatar) headerAvatar.textContent = initial;
        if (headerName) headerName.textContent = (currentUser.name || 'User').split(' ')[0];
      }
    } else {
      currentUser = { id: 1, name: 'Guest User', email: 'guest@arthafin.ai', is_authenticated: false };
      if (sidebarUserCard) sidebarUserCard.style.display = 'none';
      if (sidebarGuestCard) sidebarGuestCard.style.display = 'block';
      if (headerLoginBtn) headerLoginBtn.style.display = 'flex';
      if (headerUserCapsule) headerUserCapsule.style.display = 'none';
    }
  }

  function openAuthModal() {
    if (!authModal) return;
    authModal.style.display = 'flex';
    goToAuthStep('email');
    clearAuthError();
    if (authEmailInput) {
      authEmailInput.value = '';
      setTimeout(() => authEmailInput.focus(), 100);
    }
  }

  function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
    clearAuthError();
  }

  function setAuthError(msg) {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = msg;
    authErrorBanner.style.display = 'block';
  }

  function clearAuthError() {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = '';
    authErrorBanner.style.display = 'none';
  }

  function goToAuthStep(step) {
    clearAuthError();
    if (authStepEmail) authStepEmail.style.display = step === 'email' ? 'flex' : 'none';
    if (authStepLogin) authStepLogin.style.display = step === 'login' ? 'flex' : 'none';
    if (authStepRegister) authStepRegister.style.display = step === 'register' ? 'flex' : 'none';
  }

  // Trigger login modal from sidebar or header
  if (sidebarLoginTrigger) sidebarLoginTrigger.addEventListener('click', openAuthModal);
  if (headerLoginBtn) headerLoginBtn.addEventListener('click', openAuthModal);
  if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Google OAuth Popup Trigger
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', () => {
      clearAuthError();
      const width = 500;
      const height = 620;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        '/api/auth/google/start',
        'GoogleAccountsOAuth',
        `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup blocked by browser: fallback to in-window redirect
        window.location.href = '/api/auth/google/start';
        return;
      }

      // Check for popup closure as fallback if postMessage was intercepted
      const pollTimer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          const token = localStorage.getItem('arthafin_token');
          if (token && !currentUser.is_authenticated) {
            await hydrateAuthSession();
            closeAuthModal();
            showToast(`Welcome back, ${currentUser.name || 'User'}!`);
            await loadChatSessions();
            if (activeView === 'view-finance') loadFinanceData();
          }
        }
      }, 500);
    });
  }

  // Listen for Google Auth callback postMessage
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      const { token, user } = event.data;
      if (token && user) {
        localStorage.setItem('arthafin_token', token);
        currentUser = { ...user, is_authenticated: true };
        updateUserUIState(true);
        closeAuthModal();
        showToast(`Welcome back, ${user.name}!`);
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      }
    }
  });

  // Listen for cross-tab or cross-window auth synchronization
  window.addEventListener('storage', async (e) => {
    if (e.key === 'arthafin_token' && e.newValue && !currentUser.is_authenticated) {
      await hydrateAuthSession();
      closeAuthModal();
      showToast(`Welcome back, ${currentUser.name || 'User'}!`);
      await loadChatSessions();
      if (activeView === 'view-finance') loadFinanceData();
    }
  });

  // Step 1: Check Email
  if (authStepEmail) {
    authStepEmail.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const email = authEmailInput?.value.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        setAuthError('Please enter a valid email address.');
        return;
      }

      try {
        if (emailContinueBtn) emailContinueBtn.disabled = true;
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (data.user_exists) {
          // Existing account -> Password Login Step
          if (loginEmailDisplay) loginEmailDisplay.textContent = email;
          if (authLoginPassword) authLoginPassword.value = '';
          goToAuthStep('login');
          setTimeout(() => authLoginPassword?.focus(), 100);
        } else {
          // New account -> Registration Step
          if (registerEmailDisplay) registerEmailDisplay.textContent = email;
          if (authRegisterPassword) authRegisterPassword.value = '';
          if (authRegisterConfirm) authRegisterConfirm.value = '';
          goToAuthStep('register');
          setTimeout(() => authRegisterPassword?.focus(), 100);
        }
      } catch (err) {
        setAuthError('Connection error. Please try again.');
      } finally {
        if (emailContinueBtn) emailContinueBtn.disabled = false;
      }
    });
  }

  // Step 2A: Password Login
  if (authStepLogin) {
    authStepLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const email = authEmailInput?.value.trim().toLowerCase();
      const password = authLoginPassword?.value;

      if (!password) {
        setAuthError('Please enter your password.');
        return;
      }

      try {
        if (loginSubmitBtn) loginSubmitBtn.disabled = true;
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid credentials.');
        }

        localStorage.setItem('arthafin_token', data.token);
        currentUser = { ...data.user, is_authenticated: true };
        updateUserUIState(true);
        closeAuthModal();
        showToast(`Welcome back, ${data.user.name || 'Advisor'}!`);
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      } catch (err) {
        setAuthError(err.message || 'Login failed.');
      } finally {
        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
      }
    });
  }

  // Step 2B: Account Registration
  if (authStepRegister) {
    authStepRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const email = authEmailInput?.value.trim().toLowerCase();
      const name = authRegisterName?.value.trim() || 'Valued User';
      const password = authRegisterPassword?.value;
      const confirmPassword = authRegisterConfirm?.value;

      if (!password || password.length < 8) {
        setAuthError('Password must be at least 8 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please re-enter.');
        return;
      }

      try {
        if (registerSubmitBtn) registerSubmitBtn.disabled = true;
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Registration failed.');
        }

        localStorage.setItem('arthafin_token', data.token);
        currentUser = { ...data.user, is_authenticated: true };
        updateUserUIState(true);
        closeAuthModal();
        showToast(`Account created! Welcome, ${data.user.name}!`);
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      } catch (err) {
        setAuthError(err.message || 'Account creation failed.');
      } finally {
        if (registerSubmitBtn) registerSubmitBtn.disabled = false;
      }
    });
  }

  // Back to email links
  if (editEmailBtn) editEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (editRegisterEmailBtn) editRegisterEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (loginBackToEmailBtn) loginBackToEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (registerBackToEmailBtn) registerBackToEmailBtn.addEventListener('click', () => goToAuthStep('email'));

  // Password Visibility Toggles
  document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.textContent = isPass ? '🔒' : '👁️';
      }
    });
  });

  // Password Strength Bar
  if (authRegisterPassword && passwordStrengthBar) {
    authRegisterPassword.addEventListener('input', () => {
      const val = authRegisterPassword.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const pct = (score / 4) * 100;
      passwordStrengthBar.style.width = `${pct}%`;
      if (score <= 1) passwordStrengthBar.style.backgroundColor = '#ef4444';
      else if (score <= 2) passwordStrengthBar.style.backgroundColor = '#f59e0b';
      else if (score === 3) passwordStrengthBar.style.backgroundColor = '#38bdf8';
      else passwordStrengthBar.style.backgroundColor = '#10b981';
    });
  }

  // Logout Handler
  if (sidebarSignoutBtn) {
    sidebarSignoutBtn.addEventListener('click', () => {
      localStorage.removeItem('arthafin_token');
      updateUserUIState(false);
      showToast('Signed out of ArthaAI.');
      startNewConsultation();
    });
  }

  // ==========================================================================
  // VIEW SWITCHING LOGIC (Chatbot, Stock Market, Personal Finance)
  // ==========================================================================

  function switchView(targetViewId) {
    if (!workspaceViews[targetViewId]) return;
    activeView = targetViewId;

    // 1. Update navigation tabs in header
    navTabs.forEach((tab) => {
      const tabTarget = tab.getAttribute('data-view');
      tab.classList.toggle('active', tabTarget === targetViewId);
    });

    // 2. Update mode buttons in sidebar
    sidebarModeBtns.forEach((btn) => {
      const btnTarget = btn.getAttribute('data-view');
      btn.classList.toggle('active', btnTarget === targetViewId);
    });

    // 3. Show active view, hide others
    Object.entries(workspaceViews).forEach(([id, el]) => {
      if (el) {
        if (id === targetViewId) {
          el.style.display = id === 'view-chat' ? 'flex' : 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      }
    });

    // Close mobile sidebar if open
    if (window.innerWidth <= 900 && sidebar) {
      sidebar.classList.remove('open');
    }

    // Trigger data loading for selected view
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

  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // ==========================================================================
  // VIEW 1: AI FINANCIAL CHATBOT & MULTI-SESSION CONVERSATIONS
  // ==========================================================================

  async function loadChatSessions() {
    if (!sidebarSessionsList) return;
    try {
      const res = await fetch(`/api/chat/sessions/${currentUser.id}`);
      const data = await res.json();

      if (!data.success || !Array.isArray(data.sessions)) {
        sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">Could not load past consultations.</div>';
        return;
      }

      if (sessionCountPill) sessionCountPill.textContent = data.sessions.length;
      sidebarSessionsList.innerHTML = '';

      if (data.sessions.length === 0) {
        sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">No previous consultations saved yet.</div>';
        if (!activeSessionId) showWelcomeCard();
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

        item.addEventListener('click', (e) => {
          if (e.target.closest('.session-delete-btn')) return;
          switchSession(session.id);
        });

        const deleteBtn = item.querySelector('.session-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSession(session.id);
          });
        }

        sidebarSessionsList.appendChild(item);
      });

      if (!activeSessionId && data.sessions.length > 0) {
        switchSession(data.sessions[0].id);
      }
    } catch {
      if (sidebarSessionsList) {
        sidebarSessionsList.innerHTML = '<div class="sidebar-empty-sessions">PostgreSQL session storage offline.</div>';
      }
    }
  }

  async function switchSession(sessionId) {
    if (!sessionId) return;
    activeSessionId = sessionId;

    document.querySelectorAll('.session-lock-item').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-session-id') === String(sessionId));
    });

    if (clearDbHistoryBtn) clearDbHistoryBtn.style.display = 'flex';

    try {
      setLoadingState(true);
      const res = await fetch(`/api/chat/history/${sessionId}?userId=${currentUser.id}`);
      const data = await res.json();

      if (messagesContainer) messagesContainer.innerHTML = '';
      if (welcomeCard) welcomeCard.style.display = 'none';

      if (data.success && Array.isArray(data.chat_history) && data.chat_history.length > 0) {
        data.chat_history.forEach((msg) => {
          appendMessageEnvelope(
            msg.role,
            msg.message_content,
            msg.timestamp,
            msg.role === 'user' ? 'You' : 'ArthaAI Advisor',
            msg.role === 'assistant' ? 'Direct Intelligence' : undefined
          );
        });
      } else {
        showWelcomeCard();
      }
    } catch {
      showWelcomeCard();
    } finally {
      setLoadingState(false);
      scrollToBottom();
    }
  }

  function startNewConsultation() {
    activeSessionId = null;
    document.querySelectorAll('.session-lock-item').forEach((el) => el.classList.remove('active'));
    if (clearDbHistoryBtn) clearDbHistoryBtn.style.display = 'none';
    if (messagesContainer) messagesContainer.innerHTML = '';
    showWelcomeCard();
    switchView('view-chat');
    if (messageInput) messageInput.focus();
  }

  function showWelcomeCard() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';
    if (welcomeCard) {
      messagesContainer.appendChild(welcomeCard);
      welcomeCard.style.display = 'flex';
      rebindPromptChips();
    }
  }

  async function deleteSession(sessionId) {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (activeSessionId === sessionId) {
          activeSessionId = null;
          showWelcomeCard();
        }
        await loadChatSessions();
      }
    } catch (err) {
      console.error('Failed to delete consultation thread', err);
    }
  }

  // Clear current view
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (messagesContainer) messagesContainer.innerHTML = '';
      showWelcomeCard();
    });
  }

  // Clear entire DB history for this session
  if (clearDbHistoryBtn) {
    clearDbHistoryBtn.addEventListener('click', async () => {
      if (!activeSessionId) return;
      if (!confirm('Are you sure you want to permanently delete this consultation thread?')) return;
      await deleteSession(activeSessionId);
    });
  }

  if (newChatBtn) newChatBtn.addEventListener('click', startNewConsultation);
  if (syncHistoryBtn) syncHistoryBtn.addEventListener('click', loadChatSessions);

  // Auto-resize chat textarea
  if (messageInput) {
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 180) + 'px';
    });

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isAwaitingResponse && messageInput.value.trim() !== '') {
          handleChatSubmit();
        }
      }
    });
  }

  // Chat Form Submission
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleChatSubmit();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleChatSubmit();
    });
  }

  async function handleChatSubmit() {
    if (!messageInput) return;
    const query = messageInput.value.trim();
    if (!query || isAwaitingResponse) return;

    if (welcomeCard) welcomeCard.style.display = 'none';

    // 1. Immediately append user message
    appendMessageEnvelope('user', query, new Date().toISOString(), currentUser.name || 'You');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    setLoadingState(true);

    try {
      // 2. Dispatch query to backend controller
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          session_id: activeSessionId,
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

      const wasFreshThread = !activeSessionId;
      if (data.session_id) activeSessionId = data.session_id;

      // 3. Append assistant response
      appendMessageEnvelope(
        'assistant',
        data.message,
        data.assistant_record?.timestamp || new Date().toISOString(),
        'ArthaAI Advisor',
        data.intent
      );

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
      if (messageInput) messageInput.focus();
    }
  }

  function setLoadingState(loading) {
    isAwaitingResponse = loading;
    if (typingIndicator) typingIndicator.style.display = loading ? 'flex' : 'none';
    if (sendBtn) sendBtn.disabled = loading;
    if (loading) scrollToBottom();
  }

  function appendMessageEnvelope(role, text, isoTimestamp, authorName, intent) {
    if (!messagesContainer) return;
    const envelope = document.createElement('div');
    envelope.className = `message-envelope ${role}`;

    const isUser = role === 'user';
    const roleIcon = isUser ? '👤' : '🤖';
    const formattedTime = formatTime(isoTimestamp);
    const parsedHtml = formatMarkdown(text);

    let intentBadgeHtml = '';
    if (intent && !isUser) {
      intentBadgeHtml = `<span class="intent-pill">${escapeHtml(intent)}</span>`;
    }

    envelope.innerHTML = `
      <div class="message-meta-row">
        <div class="author-tag">
          <span class="role-icon">${roleIcon}</span>
          <span class="author-name">${escapeHtml(authorName || (isUser ? 'You' : 'ArthaAI Advisor'))}</span>
        </div>
        <div class="meta-right">
          ${intentBadgeHtml}
          <span class="timestamp-tag">${formattedTime}</span>
        </div>
      </div>
      <div class="message-bubble">${parsedHtml}</div>
    `;

    messagesContainer.appendChild(envelope);
    scrollToBottom();
  }

  function rebindPromptChips() {
    document.querySelectorAll('.prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt && messageInput) {
          switchView('view-chat');
          messageInput.value = prompt;
          messageInput.focus();
          handleChatSubmit();
        }
      });
    });
  }
  rebindPromptChips();

  // ==========================================================================
  // VIEW 2: AI-BASED STOCK MARKET ANALYSIS & PREDICTION ENGINE
  // ==========================================================================

  segBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTicker = btn.getAttribute('data-ticker') || '^NSEI';
      loadMarketData(currentTicker);
    });
  });

  if (refreshMarketBtn) {
    refreshMarketBtn.addEventListener('click', () => loadMarketData(currentTicker));
  }

  if (askMarketAiBtn) {
    askMarketAiBtn.addEventListener('click', () => {
      switchView('view-chat');
      if (messageInput) {
        messageInput.value = `Give me an institutional technical analysis of ${currentTicker} including SMA crossovers, Break of Structure (BoS), Fair Value Gaps (FVG), and liquidity levels.`;
        messageInput.focus();
        handleChatSubmit();
      }
    });
  }

  async function loadMarketData(ticker) {
    try {
      if (marketAsOfBadge) marketAsOfBadge.textContent = 'Syncing...';
      const res = await fetch(`/api/market/analysis?ticker=${encodeURIComponent(ticker)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch market data.');
      }

      if (marketAsOfBadge) marketAsOfBadge.textContent = `As of ${data.asOf}`;

      // 1. Trend & SMA
      if (data.trend) {
        if (trendClosePrice) trendClosePrice.textContent = `₹${data.trend.currentClose.toLocaleString('en-IN')}`;
        if (trendSmaDetails) {
          trendSmaDetails.textContent = `20 SMA: ₹${data.trend.sma20.toLocaleString('en-IN')} | 50 SMA: ₹${data.trend.sma50.toLocaleString('en-IN')}`;
        }
        if (trendSummaryText) trendSummaryText.textContent = data.trend.summary;
        if (trendCrossoverBadge) {
          trendCrossoverBadge.textContent = data.trend.crossover;
          trendCrossoverBadge.className = `status-chip ${data.trend.crossover.includes('Bullish') ? 'success' : 'danger'}`;
        }
      }

      // 2. Break of Structure (BoS)
      if (data.structure) {
        if (bosStatusBadge) {
          bosStatusBadge.textContent = data.structure.status;
          bosStatusBadge.className = `status-chip ${data.structure.status.includes('Bullish') ? 'success' : data.structure.status.includes('Bearish') ? 'danger' : 'neutral'}`;
        }
        if (bosLevelPrice) {
          bosLevelPrice.textContent = data.structure.breakLevel
            ? `₹${data.structure.breakLevel.toLocaleString('en-IN')}`
            : 'Unbroken';
        }
        if (bosSwingsText) {
          bosSwingsText.textContent = `Swing High: ₹${data.structure.recentHigh.toLocaleString('en-IN')} | Swing Low: ₹${data.structure.recentLow.toLocaleString('en-IN')}`;
        }
        if (bosDescriptionText) bosDescriptionText.textContent = data.structure.description;
      }

      // 3. Fair Value Gaps (FVG)
      if (data.fvg) {
        if (fvgCountBadge) {
          fvgCountBadge.textContent = `${data.fvg.unmitigatedCount} Active`;
          fvgCountBadge.className = `status-chip ${data.fvg.unmitigatedCount > 0 ? 'active' : 'neutral'}`;
        }
        if (data.fvg.latestGap) {
          if (fvgLatestRange) {
            fvgLatestRange.textContent = `₹${data.fvg.latestGap.bottom.toLocaleString('en-IN')} - ₹${data.fvg.latestGap.top.toLocaleString('en-IN')}`;
          }
          if (fvgFormationDate) {
            fvgFormationDate.textContent = `${data.fvg.latestGap.type} FVG formed on ${data.fvg.latestGap.date}`;
          }
        } else {
          if (fvgLatestRange) fvgLatestRange.textContent = 'None';
          if (fvgFormationDate) fvgFormationDate.textContent = '3-Candle Imbalance Scan';
        }
        if (fvgDescriptionText) fvgDescriptionText.textContent = data.fvg.description;
      }

      // 4. Point of Control (PoC)
      if (data.volumeProfile) {
        if (pocPriceLevel) pocPriceLevel.textContent = `₹${data.volumeProfile.pocLevel.toLocaleString('en-IN')}`;
        if (pocWeightText) pocWeightText.textContent = `${data.volumeProfile.pocWeight}% Total Session Volume Concentration`;
        if (pocDescriptionText) pocDescriptionText.textContent = data.volumeProfile.description;
      }

      // 5. AI Prediction Commentary
      if (data.aiPrediction && marketAiPredictionBody) {
        marketAiPredictionBody.innerHTML = formatMarkdown(data.aiPrediction);
      }

      // 6. Candlestick History Table
      if (data.recentCandles) {
        renderCandlesTable(data.recentCandles, data.symbol);
      }
    } catch (err) {
      if (marketAiPredictionBody) {
        marketAiPredictionBody.innerHTML = `⚠️ <span style="color: #f87171;">Failed to load live market data: ${err.message}</span>`;
      }
    }
  }

  function renderCandlesTable(candles, symbol) {
    if (!marketCandlesTbody) return;
    if (!candles || candles.length === 0) {
      marketCandlesTbody.innerHTML = `<tr><td colspan="6" class="table-loading">No candlestick records available.</td></tr>`;
      return;
    }

    if (candlesCountBadge) candlesCountBadge.textContent = `${candles.length} Sessions (${symbol})`;
    const isINR = symbol.includes('NSEI');
    const currency = isINR ? '₹' : '$';

    marketCandlesTbody.innerHTML = candles.slice(-25).reverse().map((c) => {
      const isUp = c.close >= c.open;
      const colorStyle = isUp ? 'color: #34d399;' : 'color: #f87171;';
      return `
        <tr>
          <td>${c.date}</td>
          <td>${currency}${c.open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="color: #38bdf8;">${currency}${c.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="color: #f87171;">${currency}${c.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="${colorStyle} font-weight: 700;">${currency}${c.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="color: var(--text-muted);">${c.volume ? c.volume.toLocaleString('en-IN') : 'N/A'}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // VIEW 3: AI-POWERED PERSONAL FINANCE LEDGER & WEALTH OPTIMIZER
  // ==========================================================================

  if (openAddTxModalBtn) {
    openAddTxModalBtn.addEventListener('click', () => {
      if (txEditId) txEditId.value = '';
      if (txModalHeading) txModalHeading.textContent = 'Add Personal Transaction';
      if (txModalSubheading) txModalSubheading.textContent = 'Recorded into PostgreSQL with integer paise precision';
      if (addTransactionForm) addTransactionForm.reset();
      if (txDate) txDate.value = new Date().toISOString().split('T')[0];
      if (txModal) txModal.style.display = 'flex';
    });
  }

  if (txModalClose && txModal) {
    txModalClose.addEventListener('click', () => (txModal.style.display = 'none'));
    txModal.addEventListener('click', (e) => {
      if (e.target === txModal) txModal.style.display = 'none';
    });
  }

  if (askFinanceAiBtn) {
    askFinanceAiBtn.addEventListener('click', () => {
      switchView('view-chat');
      if (messageInput) {
        messageInput.value = `Analyze my personal ledger transactions, discretionary spending leaks, and recommend a strategy to increase my monthly savings rate to 30%.`;
        messageInput.focus();
        handleChatSubmit();
      }
    });
  }

  async function loadCategories() {
    if (!txCategory) return;
    try {
      const res = await fetch('/api/finance/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        txCategory.innerHTML = '<option value="">Select a Category...</option>';
        data.categories.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.name;
          opt.textContent = `${cat.name} (${cat.type === 'expense' ? 'Outflow' : 'Inflow'}${cat.is_discretionary ? ' • Discretionary' : ''})`;
          txCategory.appendChild(opt);
        });
      }
    } catch {
      // Fallback categories
      txCategory.innerHTML = `
        <option value="">Select a Category...</option>
        <option value="Salary">Salary (Inflow)</option>
        <option value="Rent">Rent (Outflow)</option>
        <option value="Groceries">Groceries (Outflow)</option>
        <option value="Food & Dining">Food & Dining (Discretionary)</option>
        <option value="Entertainment">Entertainment (Discretionary)</option>
        <option value="Utilities">Utilities (Outflow)</option>
        <option value="Investment">Investment (Outflow)</option>
      `;
    }
  }

  function openEditTxModal(txId) {
    const tx = transactionsCache.get(Number(txId));
    if (!tx || !txModal) return;

    if (txEditId) txEditId.value = tx.id;
    if (txModalHeading) txModalHeading.textContent = 'Edit Personal Transaction';
    if (txModalSubheading) txModalSubheading.textContent = `Modifying record #${tx.id} with integer paise precision`;
    if (txAmount) txAmount.value = (tx.amount_paise / 100).toFixed(2);
    if (txCategory) txCategory.value = tx.category;
    if (txDescription) txDescription.value = tx.description;
    if (txDate) txDate.value = tx.date ? tx.date.split('T')[0] : '';
    txModal.style.display = 'flex';
  }

  if (addTransactionForm) {
    addTransactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = txEditId?.value;
      const amountRupees = parseFloat(txAmount?.value || '0');
      const amountPaise = Math.round(amountRupees * 100);
      const category = txCategory?.value;
      const description = txDescription?.value.trim();
      const date = txDate?.value;

      if (!amountPaise || !category || !description || !date) {
        alert('Please fill out all transaction fields.');
        return;
      }

      try {
        if (saveTxBtn) saveTxBtn.disabled = true;
        const isEdit = Boolean(id);
        const url = isEdit ? `/api/finance/transactions/${id}` : '/api/finance/transactions';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            amountPaise,
            category,
            description,
            date,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to save transaction.');
        }

        if (txModal) txModal.style.display = 'none';
        showToast(isEdit ? 'Transaction updated.' : 'Transaction recorded in PostgreSQL.');
        loadFinanceData();
      } catch (err) {
        alert(err.message || 'Error saving transaction.');
      } finally {
        if (saveTxBtn) saveTxBtn.disabled = false;
      }
    });
  }

  async function loadFinanceData() {
    try {
      if (financePeriodBadge) financePeriodBadge.textContent = 'Syncing...';
      const [overviewRes, txRes] = await Promise.all([
        fetch(`/api/finance/overview?userId=${currentUser.id}`),
        fetch(`/api/finance/transactions?userId=${currentUser.id}`),
      ]);

      const overviewData = await overviewRes.json();
      const txData = await txRes.json();

      if (!overviewData.success) throw new Error(overviewData.error || 'Failed to fetch finance overview.');

      if (financePeriodBadge) financePeriodBadge.textContent = overviewData.period || 'Monthly Ledger';

      // 1. Metric Cards
      const income = overviewData.totalIncomePaise / 100;
      const expense = overviewData.totalExpensePaise / 100;
      const netSavings = overviewData.netSavingsPaise / 100;
      const rate = overviewData.savingsRatePercent;

      if (finIncomeTotal) finIncomeTotal.textContent = `₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      if (finExpenseTotal) finExpenseTotal.textContent = `₹${expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      if (finSavingsTotal) {
        finSavingsTotal.textContent = `₹${netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        finSavingsTotal.style.color = netSavings >= 0 ? '#38bdf8' : '#f87171';
      }
      if (finSavingsBadge) {
        finSavingsBadge.textContent = netSavings >= 0 ? 'Surplus' : 'Deficit';
        finSavingsBadge.className = `status-chip ${netSavings >= 0 ? 'success' : 'danger'}`;
      }
      if (finSavingsRate) finSavingsRate.textContent = `${rate.toFixed(1)}%`;
      if (finRateStatus) {
        finRateStatus.textContent = rate >= 30 ? 'Excellent (>30%)' : rate >= 20 ? 'Healthy (20-30%)' : 'Caution (<20%)';
        finRateStatus.className = `status-chip ${rate >= 20 ? 'success' : 'warning'}`;
      }
      if (finSavingsBar) {
        finSavingsBar.style.width = `${Math.min(Math.max(rate, 0), 100)}%`;
        finSavingsBar.style.backgroundColor = rate >= 20 ? '#34d399' : '#fbbf24';
      }

      // 2. Interactive SVG Donut Chart
      if (overviewData.expensesByCategory) {
        renderExpenseDonutChart(overviewData.expensesByCategory, expense);
      }

      // 3. Discretionary Alerts
      if (discretionaryAlertsList) {
        if (overviewData.discretionaryOutflows && overviewData.discretionaryOutflows.length > 0) {
          discretionaryAlertsList.innerHTML = overviewData.discretionaryOutflows.map((item) => `
            <div class="alert-item-box">
              <strong>${escapeHtml(item.category)}</strong>
              <div class="alert-amount">₹${(item.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <span>${item.percentOfTotalExpenses.toFixed(1)}% of total monthly outflows</span>
            </div>
          `).join('');
        } else {
          discretionaryAlertsList.innerHTML = `<div style="color: #34d399; font-size: 0.85rem; padding: 12px;">✅ No discretionary spending leaks detected. Your budget is disciplined!</div>`;
        }
      }

      // 4. Category Breakdown Bars
      if (categoryBarsList && overviewData.expensesByCategory) {
        categoryBarsList.innerHTML = overviewData.expensesByCategory.map((cat, idx) => {
          const color = DONUT_COLORS[idx % DONUT_COLORS.length];
          const amt = cat.amountPaise / 100;
          return `
            <div class="category-bar-row">
              <div class="category-bar-meta">
                <strong><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; margin-right:6px;"></span>${escapeHtml(cat.category)}</strong>
                <span>₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${cat.percentOfTotal.toFixed(1)}%)</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${Math.min(cat.percentOfTotal, 100)}%; background: ${color};"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // 5. Transactions Table
      if (txData.success && Array.isArray(txData.transactions)) {
        renderTransactionsTable(txData.transactions);
      }
    } catch (err) {
      console.error('Failed to load finance data', err);
    }
  }

  function renderExpenseDonutChart(expenses, totalExpenses) {
    if (!financePieChartContainer || !financePieLegend) return;

    if (!expenses || expenses.length === 0 || totalExpenses <= 0) {
      financePieChartContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No expense outflows recorded.</div>';
      financePieLegend.innerHTML = '';
      return;
    }

    const size = 240;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const segmentsSvg = expenses.map((cat, idx) => {
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const percent = (cat.amountPaise / 100) / totalExpenses;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += percent * circumference;

      return `
        <circle
          class="donut-segment"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${color}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          data-category="${escapeHtml(cat.category)}"
          data-amount="₹${(cat.amountPaise / 100).toLocaleString('en-IN')}"
          data-percent="${cat.percentOfTotal.toFixed(1)}%"
        ></circle>
      `;
    }).join('');

    financePieChartContainer.innerHTML = `
      <svg class="pie-donut-svg" viewBox="0 0 ${size} ${size}">
        ${segmentsSvg}
      </svg>
      <div class="donut-center-info">
        <span class="donut-center-label" id="donut-center-label">Total Outflows</span>
        <span class="donut-center-value" id="donut-center-val">₹${Math.round(totalExpenses).toLocaleString('en-IN')}</span>
        <span class="donut-center-sub" id="donut-center-sub">100% Budget</span>
      </div>
    `;

    // Interactive Donut Segment Hover
    const labelEl = document.getElementById('donut-center-label');
    const valEl = document.getElementById('donut-center-val');
    const subEl = document.getElementById('donut-center-sub');

    document.querySelectorAll('.donut-segment').forEach((seg) => {
      seg.addEventListener('mouseenter', () => {
        if (labelEl) labelEl.textContent = seg.getAttribute('data-category');
        if (valEl) valEl.textContent = seg.getAttribute('data-amount');
        if (subEl) subEl.textContent = `${seg.getAttribute('data-percent')} of Outflows`;
      });
      seg.addEventListener('mouseleave', () => {
        if (labelEl) labelEl.textContent = 'Total Outflows';
        if (valEl) valEl.textContent = `₹${Math.round(totalExpenses).toLocaleString('en-IN')}`;
        if (subEl) subEl.textContent = '100% Budget';
      });
    });

    // Render Legend
    financePieLegend.innerHTML = expenses.map((cat, idx) => {
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const amt = (cat.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
      return `
        <div class="legend-item">
          <div class="legend-left">
            <span class="legend-color-dot" style="background:${color}; color:${color};"></span>
            <span class="legend-name" title="${escapeHtml(cat.category)}">${escapeHtml(cat.category)}</span>
          </div>
          <div class="legend-right">
            <span class="legend-amount">₹${amt}</span>
            <span class="legend-pct">${cat.percentOfTotal.toFixed(1)}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTransactionsTable(transactions) {
    if (!financeTransactionsTbody) return;
    transactionsCache.clear();

    if (!transactions || transactions.length === 0) {
      financeTransactionsTbody.innerHTML = `<tr><td colspan="6" class="table-loading">No transactions recorded yet. Click "Add Transaction" above!</td></tr>`;
      if (txCountBadge) txCountBadge.textContent = '0 Entries';
      return;
    }

    if (txCountBadge) txCountBadge.textContent = `${transactions.length} Entries`;

    financeTransactionsTbody.innerHTML = transactions.map((t) => {
      transactionsCache.set(t.id, t);
      const isIncome = t.type === 'income';
      const amountRupees = (t.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
      const dateStr = t.date ? t.date.split('T')[0] : '';

      return `
        <tr>
          <td>${dateStr}</td>
          <td style="color: var(--text-main); font-weight: 500;">${escapeHtml(t.description)}</td>
          <td><span class="badge-pill">${escapeHtml(t.category)}</span></td>
          <td><span class="status-chip ${isIncome ? 'success' : 'danger'}">${isIncome ? 'Inflow' : 'Outflow'}</span></td>
          <td style="font-weight: 700; ${isIncome ? 'color: #34d399;' : 'color: #f87171;'}">${isIncome ? '+' : '-'}₹${amountRupees}</td>
          <td>
            <div class="table-action-group">
              <button class="edit-tx-btn" data-edit-id="${t.id}" title="Edit transaction">
                ✏️ Edit
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.edit-tx-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        openEditTxModal(id);
      });
    });
  }

  // ==========================================================================
  // FINANCIAL QUICK CALCULATORS (SIP, Loan EMI, 50/30/20 Budget Allocator)
  // ==========================================================================

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

  // 1. SIP Compounding
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

  // 3. 50/30/20 Budget Allocator
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

  // Ask AI prefill triggers
  const sipAskBtn = document.getElementById('sip-ask-ai-btn');
  if (sipAskBtn) {
    sipAskBtn.addEventListener('click', () => {
      const p = sipAmtSlider?.value || '10000';
      const r = sipRateSlider?.value || '12';
      const y = sipYearsSlider?.value || '15';
      if (calcModal) calcModal.style.display = 'none';
      switchView('view-chat');
      if (messageInput) {
        messageInput.value = `I am planning a SIP of ₹${parseInt(p, 10).toLocaleString('en-IN')}/month for ${y} years at an expected CAGR of ${r}%. Can you analyze which asset allocation (e.g., Large-cap index vs Flexi-cap) suits this horizon and how step-up SIP could boost my final wealth?`;
        messageInput.focus();
        handleChatSubmit();
      }
    });
  }

  const emiAskBtn = document.getElementById('emi-ask-ai-btn');
  if (emiAskBtn) {
    emiAskBtn.addEventListener('click', () => {
      const p = emiAmtSlider?.value || '4000000';
      const r = emiRateSlider?.value || '8.5';
      const y = emiYearsSlider?.value || '20';
      if (calcModal) calcModal.style.display = 'none';
      switchView('view-chat');
      if (messageInput) {
        messageInput.value = `I am considering a loan of ₹${parseInt(p, 10).toLocaleString('en-IN')} at ${r}% interest for ${y} years. What are the best strategies to prepay this loan faster and save interest?`;
        messageInput.focus();
        handleChatSubmit();
      }
    });
  }

  const budgetAskBtn = document.getElementById('budget-ask-ai-btn');
  if (budgetAskBtn) {
    budgetAskBtn.addEventListener('click', () => {
      const inc = budgetIncomeSlider?.value || '75000';
      if (calcModal) calcModal.style.display = 'none';
      switchView('view-chat');
      if (messageInput) {
        messageInput.value = `My monthly take-home income is ₹${parseInt(inc, 10).toLocaleString('en-IN')}. Based on the 50/30/20 rule, help me break down an actionable monthly budget covering rent, groceries, discretionary spending, emergency fund, and mutual funds.`;
        messageInput.focus();
        handleChatSubmit();
      }
    });
  }

  // Conversation Export as Markdown
  if (exportChatBtn) {
    exportChatBtn.addEventListener('click', () => {
      if (!messagesContainer) return;
      const envelopes = messagesContainer.querySelectorAll('.message-envelope');
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

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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

  function showToast(message) {
    const existing = document.getElementById('artha-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'artha-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #181a24;
      color: #fff;
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
