/**
 * MALAS ELECTRONICS LLC — ENTERPRISE ADMIN APP
 * Frontend Logic, Authentication & Inquiries Management
 */

(function () {
  // API base URL: empty when served on port 5000, or http://localhost:5000 when running standalone
  const API_BASE = (window.location.port === '5000' || window.location.origin.includes(':5000'))
    ? ''
    : 'http://localhost:5000';

  // Application State
  const state = {
    token: localStorage.getItem('malas_admin_token') || null,
    admin: null,
    inquiries: [],
    selectedInquiry: null,
    dbHealth: { connected: false }
  };

  // DOM Elements
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const loginAlert = document.getElementById('login-alert');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const dbHealthBadge = document.getElementById('db-health-badge');
  const dbStatusText = document.getElementById('db-status-text');

  // Dashboard DOM Elements
  const logoutBtn = document.getElementById('logout-btn');
  const dashUserName = document.getElementById('dash-user-name');
  const dashUserRole = document.getElementById('dash-user-role');
  const userAvatarInitials = document.getElementById('user-avatar-initials');
  const dashDbVersion = document.getElementById('dash-db-version');
  const statTotal = document.getElementById('stat-total');
  const statNew = document.getElementById('stat-new');
  const statReview = document.getElementById('stat-review');
  const statDbStatus = document.getElementById('stat-db-status');
  const statDbName = document.getElementById('stat-db-name');
  const inquirySearch = document.getElementById('inquiry-search');
  const inquiryFilter = document.getElementById('inquiry-filter');
  const refreshBtn = document.getElementById('refresh-btn');
  const tableBody = document.getElementById('inquiries-table-body');

  // Modal DOM Elements
  const detailModal = document.getElementById('detail-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTag = document.getElementById('modal-tag');
  const modalClientName = document.getElementById('modal-client-name');
  const modalEmail = document.getElementById('modal-email');
  const modalPhone = document.getElementById('modal-phone');
  const modalSector = document.getElementById('modal-sector');
  const modalTimeline = document.getElementById('modal-timeline');
  const modalScope = document.getElementById('modal-scope');
  const modalStatusSelect = document.getElementById('modal-status-select');
  const saveStatusBtn = document.getElementById('save-status-btn');
  const deleteInquiryBtn = document.getElementById('delete-inquiry-btn');
  const modalCallLink = document.getElementById('modal-call-link');
  const modalMailLink = document.getElementById('modal-mail-link');

  // Initialize
  init();

  async function init() {
    setupEventListeners();
    await checkDatabaseHealth();
    await verifyCurrentSession();
  }

  function setupEventListeners() {
    // Password toggle
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePwdBtn.textContent = isPassword ? '🔒' : '👁️';
      });
    }

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Table Controls
    if (inquirySearch) {
      inquirySearch.addEventListener('input', debounce(loadInquiries, 300));
    }
    if (inquiryFilter) {
      inquiryFilter.addEventListener('change', loadInquiries);
    }
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadDashboardStats();
        loadInquiries();
      });
    }

    // Modal Events
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
      });
    }
    if (saveStatusBtn) {
      saveStatusBtn.addEventListener('click', handleSaveStatus);
    }
    if (deleteInquiryBtn) {
      deleteInquiryBtn.addEventListener('click', handleDeleteInquiry);
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detailModal.style.display !== 'none') {
        closeModal();
      }
    });
  }

  /**
   * Check MariaDB 10.6 connection health and update indicator
   */
  async function checkDatabaseHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/health`);
      const data = await res.json();
      state.dbHealth = data.database || {};

      if (data.database && data.database.connected) {
        dbHealthBadge.className = 'db-telemetry-badge connected';
        dbStatusText.textContent = `MariaDB 10.6 Connected · DB: ${data.database.database}`;
      } else {
        dbHealthBadge.className = 'db-telemetry-badge error';
        dbStatusText.textContent = data.database && data.database.code === 'ER_ACCESS_DENIED_ERROR'
          ? 'MariaDB: Add DB_PASSWORD in admin/.env'
          : 'MariaDB: Service not running on :3306';
      }
    } catch (err) {
      dbHealthBadge.className = 'db-telemetry-badge error';
      dbStatusText.textContent = 'Backend server communication error';
    }
  }

  /**
   * Verify existing JWT session on page load
   */
  async function verifyCurrentSession() {
    const token = state.token;
    if (!token) {
      showLoginView();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.admin) {
        state.admin = data.admin;
        showDashboardView();
      } else {
        // Token expired
        localStorage.removeItem('malas_admin_token');
        state.token = null;
        showLoginView();
      }
    } catch (e) {
      showLoginView();
    }
  }

  /**
   * Handle Login Authentication
   */
  async function handleLogin(e) {
    e.preventDefault();
    hideAlert();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showAlert('Please enter both username/email and password.', 'error');
      return;
    }

    setBtnLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        state.token = data.token;
        state.admin = data.admin;
        localStorage.setItem('malas_admin_token', data.token);

        showAlert('Access Granted. Loading dispatch dashboard...', 'success');
        setTimeout(() => {
          showDashboardView();
        }, 600);
      } else {
        showAlert(data.error || 'Authentication failed. Please verify credentials.', 'error');
      }
    } catch (err) {
      showAlert('Unable to reach authentication server. Verify admin server is running.', 'error');
    } finally {
      setBtnLoading(false);
    }
  }

  /**
   * Handle Logout
   */
  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch (e) {}

    localStorage.removeItem('malas_admin_token');
    state.token = null;
    state.admin = null;
    showLoginView();
  }

  function showLoginView() {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
    checkDatabaseHealth();
  }

  function showDashboardView() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'flex';

    if (state.admin) {
      dashUserName.textContent = state.admin.full_name || state.admin.username;
      dashUserRole.textContent = state.admin.role === 'super_admin' ? 'Chief Systems Administrator' : 'Operations Editor';
      const initials = (state.admin.full_name || state.admin.username).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      userAvatarInitials.textContent = initials || 'AD';
    }

    loadDashboardStats();
    loadInquiries();
  }

  /**
   * Load summary stats
   */
  async function loadDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        statTotal.textContent = data.stats.total;
        statNew.textContent = data.stats.new;
        statReview.textContent = data.stats.inReview;

        if (data.db && data.db.connected) {
          dashDbVersion.textContent = `MariaDB ${data.db.version.split('-')[0] || '10.6'}`;
          statDbStatus.textContent = 'Active';
          statDbStatus.className = 'metric-value text-green';
          statDbName.textContent = data.db.database;
        } else {
          statDbStatus.textContent = 'Notice';
          statDbStatus.className = 'metric-value text-accent';
          statDbName.textContent = 'Set DB_PASSWORD';
        }
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  /**
   * Load inquiries table
   */
  async function loadInquiries() {
    const status = inquiryFilter.value;
    const search = inquirySearch.value.trim();

    tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Querying MariaDB database...</td></tr>`;

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/api/inquiries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        state.inquiries = data.inquiries;
        renderInquiriesTable(data.inquiries);
      } else {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
      }
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load inquiries from server.</td></tr>`;
    }
  }

  function renderInquiriesTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No inquiries found matching criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = inquiries.map((inq) => {
      const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const statusClass = inq.status || 'new';
      const statusLabel = (inq.status || 'new').replace('_', ' ');

      return `
        <tr data-id="${inq.id}">
          <td class="client-name-cell">
            ${escapeHtml(inq.client_name)}
          </td>
          <td>
            <div class="contact-sub-cell">
              <span class="contact-email">${escapeHtml(inq.email)}</span>
              ${inq.phone ? `<span class="contact-phone">${escapeHtml(inq.phone)}</span>` : ''}
            </div>
          </td>
          <td>
            <span style="color:var(--accent-bronze); font-weight:600;">${escapeHtml(inq.sector || 'Commercial')}</span>
          </td>
          <td>
            ${escapeHtml(inq.venue_type || 'Custom AV Engineering')}
          </td>
          <td>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </td>
          <td style="color:var(--text-muted); font-size:0.8rem; font-family:var(--font-mono);">
            ${dateStr}
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-table-action" onclick="window.malasOpenDetail(${inq.id})">
              Review
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Detail Modal Functions
   */
  window.malasOpenDetail = function (id) {
    const inq = state.inquiries.find(item => item.id === id);
    if (!inq) return;

    state.selectedInquiry = inq;
    modalTag.textContent = `INQUIRY REF: #ME-${String(inq.id).padStart(4, '0')}`;
    modalClientName.textContent = inq.client_name;
    modalEmail.textContent = inq.email;
    modalEmail.href = `mailto:${inq.email}?subject=Malas%20Electronics%20AV%20Consultation`;
    modalPhone.textContent = inq.phone || 'Not provided';
    modalPhone.href = inq.phone ? `tel:${inq.phone.replace(/\s+/g, '')}` : '#';
    modalSector.textContent = inq.sector || 'Commercial';
    modalTimeline.textContent = inq.timeline || 'Immediate / Unspecified';
    modalScope.textContent = inq.scope_notes || 'No custom notes provided by client.';
    modalStatusSelect.value = inq.status || 'new';

    modalCallLink.href = inq.phone ? `tel:${inq.phone.replace(/\s+/g, '')}` : '#';
    modalCallLink.style.display = inq.phone ? 'inline-flex' : 'none';
    modalMailLink.href = `mailto:${inq.email}?subject=Malas%20Electronics%20Scope%20Consultation`;

    detailModal.style.display = 'flex';
  };

  function closeModal() {
    detailModal.style.display = 'none';
    state.selectedInquiry = null;
  }

  async function handleSaveStatus() {
    if (!state.selectedInquiry) return;
    const newStatus = modalStatusSelect.value;
    const id = state.selectedInquiry.id;

    saveStatusBtn.textContent = 'Saving...';

    try {
      const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success) {
        state.selectedInquiry.status = newStatus;
        loadDashboardStats();
        loadInquiries();
        closeModal();
      } else {
        alert('Could not update status: ' + data.error);
      }
    } catch (e) {
      alert('Communication failure while updating status.');
    } finally {
      saveStatusBtn.textContent = 'Save Status';
    }
  }

  async function handleDeleteInquiry() {
    if (!state.selectedInquiry) return;
    const confirmDelete = confirm(`Are you sure you want to delete inquiry for "${state.selectedInquiry.client_name}"? This action is permanent.`);
    if (!confirmDelete) return;

    const id = state.selectedInquiry.id;
    try {
      const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        closeModal();
        loadDashboardStats();
        loadInquiries();
      } else {
        alert('Failed to delete inquiry: ' + data.error);
      }
    } catch (e) {
      alert('Error communicating with server.');
    }
  }

  // Helpers
  function showAlert(msg, type = 'error') {
    loginAlert.textContent = msg;
    loginAlert.className = `alert-banner ${type}`;
    loginAlert.style.display = 'block';
  }

  function hideAlert() {
    loginAlert.style.display = 'none';
    loginAlert.textContent = '';
  }

  function setBtnLoading(isLoading) {
    const textSpan = loginSubmitBtn.querySelector('.btn-text');
    const spinnerSpan = loginSubmitBtn.querySelector('.btn-spinner');

    loginSubmitBtn.disabled = isLoading;
    if (isLoading) {
      textSpan.style.display = 'none';
      spinnerSpan.style.display = 'inline-block';
    } else {
      textSpan.style.display = 'inline-block';
      spinnerSpan.style.display = 'none';
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
