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

  // --- DOM Elements: Authentication & User Profile ---
  const headerLoginBtn = document.getElementById('header-login-btn');
  const headerUserBadge = document.getElementById('header-user-badge');
  const headerAvatar = document.getElementById('header-avatar');
  const headerName = document.getElementById('header-name');
  const sidebarGuestCard = document.getElementById('sidebar-guest-card');
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserEmail = document.getElementById('sidebar-user-email');
  const sidebarLoginTrigger = document.getElementById('sidebar-login-trigger');
  const sidebarSignoutBtn = document.getElementById('sidebar-signout-btn');

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

  // --- User & Session State ---
  let currentUser = {
    id: 1,
    name: 'Rohan Sharma',
    email: 'rohan.sharma@arthafin.ai',
    avatar_url: '',
    is_authenticated: false,
  };

  function getActiveUserId() {
    return currentUser.id || 1;
  }

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

    // Hydrate existing user session if token is saved
    await hydrateAuthSession();

    // 1. Load Past Conversation Sessions from PostgreSQL into Sidebar Locks
    await loadChatSessions();

    // 2. Pre-load Transaction Categories for Modal
    loadCategories();
  }

  // ==========================================================================
  // AUTHENTICATION LOGIC (Pinterest-Style Dynamic Email + Real Google OAuth)
  // ==========================================================================
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

  function updateUserUIState(isLoggedIn) {
    if (isLoggedIn) {
      if (headerLoginBtn) headerLoginBtn.style.display = 'none';
      if (headerUserBadge) headerUserBadge.style.display = 'flex';
      if (headerAvatar) headerAvatar.textContent = (currentUser.name || 'U')[0].toUpperCase();
      if (headerName) headerName.textContent = currentUser.name || 'User';

      if (sidebarGuestCard) sidebarGuestCard.style.display = 'none';
      if (sidebarUserCard) sidebarUserCard.style.display = 'flex';
      if (sidebarUserAvatar) sidebarUserAvatar.textContent = (currentUser.name || 'U')[0].toUpperCase();
      if (sidebarUserName) sidebarUserName.textContent = currentUser.name || 'User';
      if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email || '';
    } else {
      if (headerLoginBtn) headerLoginBtn.style.display = 'flex';
      if (headerUserBadge) headerUserBadge.style.display = 'none';

      if (sidebarGuestCard) sidebarGuestCard.style.display = 'flex';
      if (sidebarUserCard) sidebarUserCard.style.display = 'none';
    }
  }

  async function hydrateAuthSession() {
    const token = localStorage.getItem('arthafin_token');
    if (!token) {
      updateUserUIState(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        currentUser = {
          ...data.user,
          is_authenticated: true,
        };
        updateUserUIState(true);
      } else {
        localStorage.removeItem('arthafin_token');
        updateUserUIState(false);
      }
    } catch {
      updateUserUIState(false);
    }
  }

  // Password visibility toggle
  document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🔒';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Password strength meter
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
      else if (score === 2) passwordStrengthBar.style.backgroundColor = '#f59e0b';
      else if (score === 3) passwordStrengthBar.style.backgroundColor = '#38bdf8';
      else passwordStrengthBar.style.backgroundColor = '#34d399';
    });
  }

  // Real Google OAuth Button: Direct Authorization via accounts.google.com
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
        window.location.href = '/api/auth/google/start';
        return;
      }

      const pollTimer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          const token = localStorage.getItem('arthafin_token');
          if (token && !currentUser.is_authenticated) {
            await hydrateAuthSession();
            closeAuthModal();
            await loadChatSessions();
            if (activeView === 'view-finance') loadFinanceData();
          }
        }
      }, 500);
    });
  }

  // Listen for Google Auth callback message from popup
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      const { token, user } = event.data;
      if (token && user) {
        localStorage.setItem('arthafin_token', token);
        currentUser = { ...user, is_authenticated: true };
        updateUserUIState(true);
        closeAuthModal();
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      }
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
          if (loginEmailDisplay) loginEmailDisplay.textContent = email;
          if (authLoginPassword) authLoginPassword.value = '';
          goToAuthStep('login');
          setTimeout(() => authLoginPassword?.focus(), 100);
        } else {
          if (registerEmailDisplay) registerEmailDisplay.textContent = email;
          if (authRegisterPassword) authRegisterPassword.value = '';
          if (authRegisterConfirm) authRegisterConfirm.value = '';
          goToAuthStep('register');
          setTimeout(() => authRegisterPassword?.focus(), 100);
        }
      } catch {
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
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      } catch (err) {
        setAuthError(err.message || 'Login failed.');
      } finally {
        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
      }
    });
  }

  // Step 2B: Register New User
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
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create account.');
        }

        localStorage.setItem('arthafin_token', data.token);
        currentUser = { ...data.user, is_authenticated: true };
        updateUserUIState(true);
        closeAuthModal();
        await loadChatSessions();
        if (activeView === 'view-finance') loadFinanceData();
      } catch (err) {
        setAuthError(err.message || 'Registration failed.');
      } finally {
        if (registerSubmitBtn) registerSubmitBtn.disabled = false;
      }
    });
  }

  // Back to Email Navigation
  if (editEmailBtn) editEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (loginBackToEmailBtn) loginBackToEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (editRegisterEmailBtn) editRegisterEmailBtn.addEventListener('click', () => goToAuthStep('email'));
  if (registerBackToEmailBtn) registerBackToEmailBtn.addEventListener('click', () => goToAuthStep('email'));

  // Auth Modal Triggers
  if (headerLoginBtn) headerLoginBtn.addEventListener('click', openAuthModal);
  if (sidebarLoginTrigger) sidebarLoginTrigger.addEventListener('click', openAuthModal);
  if (authModalClose) authModalClose.addEventListener('click', closeAuthModal);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Sign out Trigger
  if (sidebarSignoutBtn) {
    sidebarSignoutBtn.addEventListener('click', () => {
      localStorage.removeItem('arthafin_token');
      currentUser = {
        id: 1,
        name: 'Guest User',
        email: 'guest@arthafin.ai',
        avatar_url: '',
        is_authenticated: false,
      };
      updateUserUIState(false);
      openAuthModal();
    });
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
      const res = await fetch(`/api/chat/sessions/${getActiveUserId()}`);
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
      await fetch(`/api/chat/history/${getActiveUserId()}`, { method: 'DELETE' });
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
          user_id: getActiveUserId(),
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
            user_id: getActiveUserId(),
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
      const res = await fetch(`/api/finance/ledger/${getActiveUserId()}`);
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
});
