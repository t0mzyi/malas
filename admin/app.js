/**
 * MALAS ELECTRONICS LLC — ENTERPRISE ADMIN APP
 * Frontend Logic: Auth, Inquiries, Products Catalog, Categories & CEO Employee Management
 */

(function () {
  // Determine server environment
  const isNodeDev = (window.location.port === '5000' || window.location.origin.includes(':5000'));
  const apiRoot = isNodeDev ? '/api' : (window.location.pathname.includes('/admin') ? './api' : 'api');

  const ENDPOINTS = {
    health: isNodeDev ? `${apiRoot}/dashboard/health` : `${apiRoot}/dashboard.php?action=health`,
    stats: isNodeDev ? `${apiRoot}/dashboard/stats` : `${apiRoot}/dashboard.php?action=stats`,
    me: isNodeDev ? `${apiRoot}/auth/me` : `${apiRoot}/auth.php?action=me`,
    login: isNodeDev ? `${apiRoot}/auth/login` : `${apiRoot}/auth.php?action=login`,
    logout: isNodeDev ? `${apiRoot}/auth/logout` : `${apiRoot}/auth.php?action=logout`,
    inquiries: (query = '') => isNodeDev ? `${apiRoot}/inquiries${query ? '?' + query : ''}` : `${apiRoot}/inquiries.php${query ? '?' + query : ''}`,
    inquiryDetail: (id) => isNodeDev ? `${apiRoot}/inquiries/${id}` : `${apiRoot}/inquiries.php?id=${id}`,
    products: (query = '') => isNodeDev ? `${apiRoot}/products${query ? '?' + query : ''}` : `${apiRoot}/products.php${query ? '?' + query : ''}`,
    productDetail: (id) => isNodeDev ? `${apiRoot}/products/${id}` : `${apiRoot}/products.php?id=${id}`,
    categories: isNodeDev ? `${apiRoot}/categories` : `${apiRoot}/categories.php`,
    categoryDetail: (id) => isNodeDev ? `${apiRoot}/categories/${id}` : `${apiRoot}/categories.php?id=${id}`,
    employees: isNodeDev ? `${apiRoot}/employees` : `${apiRoot}/employees.php`,
    employeeDetail: (id) => isNodeDev ? `${apiRoot}/employees/${id}` : `${apiRoot}/employees.php?id=${id}`
  };

  // Application State
  const state = {
    token: localStorage.getItem('malas_admin_token') || null,
    admin: null,
    currentTab: 'inquiries',
    inquiries: [],
    products: [],
    categories: [],
    employees: [],
    selectedInquiry: null,
    selectedProduct: null,
    selectedCategory: null,
    dbHealth: { connected: false }
  };

  // Top Views & Login DOM Elements
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

  // Dashboard Header DOM Elements
  const logoutBtn = document.getElementById('logout-btn');
  const dashUserName = document.getElementById('dash-user-name');
  const dashUserRole = document.getElementById('dash-user-role');
  const userAvatarInitials = document.getElementById('user-avatar-initials');
  const dashDbVersion = document.getElementById('dash-db-version');

  // Metrics DOM Elements
  const statInquiries = document.getElementById('stat-inquiries');
  const statInquiriesSub = document.getElementById('stat-inquiries-sub');
  const statProducts = document.getElementById('stat-products');
  const statCategoriesCount = document.getElementById('stat-categories-count');
  const statEmployees = document.getElementById('stat-employees');
  const statRoleStatus = document.getElementById('stat-role-status');
  const statDbStatus = document.getElementById('stat-db-status');
  const statDbName = document.getElementById('stat-db-name');

  // Tabs DOM Elements
  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tabBtnEmployees = document.getElementById('tab-btn-employees');
  const badgeInquiries = document.getElementById('badge-inquiries-count');
  const badgeProducts = document.getElementById('badge-products-count');
  const badgeCategories = document.getElementById('badge-categories-count');

  // Inquiries DOM Elements
  const inquirySearch = document.getElementById('inquiry-search');
  const inquiryFilter = document.getElementById('inquiry-filter');
  const refreshBtn = document.getElementById('refresh-btn');
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
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

  // Products DOM Elements
  const productsGrid = document.getElementById('products-grid-container');
  const productSearch = document.getElementById('product-search');
  const productCategoryFilter = document.getElementById('product-category-filter');
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productModalTitle = document.getElementById('product-modal-title');
  const closeProductModalBtn = document.getElementById('close-product-modal-btn');
  const cancelProductBtn = document.getElementById('cancel-product-btn');
  const productForm = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productCategorySelect = document.getElementById('product-category');
  const productModelInput = document.getElementById('product-model');
  const productTaglineInput = document.getElementById('product-tagline');
  const productImageInput = document.getElementById('product-image');
  const productStatusSelect = document.getElementById('product-status');
  const productSpecsInput = document.getElementById('product-specs');
  const productDescInput = document.getElementById('product-desc');

  // Categories DOM Elements
  const categoriesGrid = document.getElementById('categories-grid-container');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const categoryModal = document.getElementById('category-modal');
  const categoryModalTitle = document.getElementById('category-modal-title');
  const closeCategoryModalBtn = document.getElementById('close-category-modal-btn');
  const cancelCategoryBtn = document.getElementById('cancel-category-btn');
  const categoryForm = document.getElementById('category-form');
  const categoryIdInput = document.getElementById('category-id');
  const categoryNameInput = document.getElementById('category-name');
  const categoryDescInput = document.getElementById('category-desc');

  // Employees DOM Elements (CEO Exclusive)
  const employeesTableBody = document.getElementById('employees-table-body');
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  const employeeModal = document.getElementById('employee-modal');
  const closeEmployeeModalBtn = document.getElementById('close-employee-modal-btn');
  const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
  const employeeForm = document.getElementById('employee-form');
  const empNameInput = document.getElementById('emp-name');
  const empUsernameInput = document.getElementById('emp-username');
  const empEmailInput = document.getElementById('emp-email');
  const empPasswordInput = document.getElementById('emp-password');
  const empRoleSelect = document.getElementById('emp-role');

  // Bootstrap Application
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

    // Navigation Tabs
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Inquiries Controls
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
        loadProducts();
        loadCategories();
        if (state.admin && (state.admin.role === 'ceo' || state.admin.role === 'super_admin')) {
          loadEmployees();
        }
      });
    }

    // Inquiry Modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeInquiryModal);
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeInquiryModal();
      });
    }
    if (saveStatusBtn) saveStatusBtn.addEventListener('click', handleSaveStatus);
    if (deleteInquiryBtn) deleteInquiryBtn.addEventListener('click', handleDeleteInquiry);

    // Products Controls & Modal
    if (productSearch) productSearch.addEventListener('input', debounce(loadProducts, 300));
    if (productCategoryFilter) productCategoryFilter.addEventListener('change', loadProducts);
    if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal());
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);
    if (productModal) {
      productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
      });
    }
    if (productForm) productForm.addEventListener('submit', handleSaveProduct);

    // Categories Controls & Modal
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openCategoryModal());
    if (closeCategoryModalBtn) closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
    if (cancelCategoryBtn) cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    if (categoryModal) {
      categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) closeCategoryModal();
      });
    }
    if (categoryForm) categoryForm.addEventListener('submit', handleSaveCategory);

    // Employees Controls & Modal (CEO only)
    if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    if (closeEmployeeModalBtn) closeEmployeeModalBtn.addEventListener('click', closeEmployeeModal);
    if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', closeEmployeeModal);
    if (employeeModal) {
      employeeModal.addEventListener('click', (e) => {
        if (e.target === employeeModal) closeEmployeeModal();
      });
    }
    if (employeeForm) employeeForm.addEventListener('submit', handleCreateEmployee);

    // Keyboard ESC to close any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeInquiryModal();
        closeProductModal();
        closeCategoryModal();
        closeEmployeeModal();
      }
    });
  }

  // ============================================================
  // TAB NAVIGATION
  // ============================================================
  function switchTab(tabName) {
    state.currentTab = tabName;

    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    tabPanels.forEach(panel => {
      panel.style.display = panel.id === `tab-${tabName}` ? 'block' : 'none';
    });

    if (tabName === 'inquiries') loadInquiries();
    if (tabName === 'products') loadProducts();
    if (tabName === 'categories') loadCategories();
    if (tabName === 'employees') loadEmployees();
  }

  // ============================================================
  // DATABASE TELEMETRY & SESSION VERIFICATION
  // ============================================================
  async function checkDatabaseHealth() {
    try {
      const res = await fetch(ENDPOINTS.health);
      const data = await res.json();
      state.dbHealth = data.database || {};

      if (dbHealthBadge && dbStatusText) {
        if (data.database && data.database.connected) {
          dbHealthBadge.className = 'db-telemetry-badge connected';
          dbStatusText.textContent = `MariaDB 10.6 Connected · DB: ${data.database.database}`;
        } else {
          dbHealthBadge.className = 'db-telemetry-badge error';
          dbStatusText.textContent = 'MariaDB service disconnected';
        }
      }
    } catch (err) {
      if (dbHealthBadge && dbStatusText) {
        dbHealthBadge.className = 'db-telemetry-badge error';
        dbStatusText.textContent = 'Backend server communication error';
      }
    }
  }

  async function verifyCurrentSession() {
    const token = state.token;
    if (!token) {
      showLoginView();
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.me, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.admin) {
        state.admin = data.admin;
        showDashboardView();
      } else {
        localStorage.removeItem('malas_admin_token');
        state.token = null;
        showLoginView();
      }
    } catch (e) {
      showLoginView();
    }
  }

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
      const res = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        state.token = data.token;
        state.admin = data.admin;
        localStorage.setItem('malas_admin_token', data.token);

        showAlert('Access Granted. Authenticating operational clearance...', 'success');
        setTimeout(() => {
          showDashboardView();
        }, 500);
      } else {
        showAlert(data.error || 'Authentication failed. Please verify credentials.', 'error');
      }
    } catch (err) {
      showAlert('Unable to reach authentication server.', 'error');
    } finally {
      setBtnLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(ENDPOINTS.logout, { method: 'POST' });
    } catch (e) {}

    localStorage.removeItem('malas_admin_token');
    state.token = null;
    state.admin = null;
    showLoginView();
  }

  function showLoginView() {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
  }

  function showDashboardView() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';

    const admin = state.admin || {};
    const isCeo = admin.role === 'ceo' || admin.role === 'super_admin';

    // Update Header Lockup
    dashUserName.textContent = admin.fullName || admin.username || 'Malas Operator';
    dashUserRole.textContent = isCeo ? 'Chief Executive Officer (CEO)' : 'Staff Engineer / Dispatch';
    userAvatarInitials.textContent = (admin.fullName || admin.username || 'MO').slice(0, 2).toUpperCase();

    // Show/Hide CEO Exclusive Employees Tab
    if (tabBtnEmployees) {
      tabBtnEmployees.style.display = isCeo ? 'inline-flex' : 'none';
    }

    // Load initial data
    loadCategories();
    loadDashboardStats();
    loadInquiries();
    loadProducts();
    if (isCeo) {
      loadEmployees();
    }
  }

  // ============================================================
  // STATS LOADER
  // ============================================================
  async function loadDashboardStats() {
    try {
      const res = await fetch(ENDPOINTS.stats, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        statInquiries.textContent = data.stats.total || 0;
        statInquiriesSub.textContent = `${data.stats.new || 0} Pending Initial Review`;
        if (badgeInquiries) badgeInquiries.textContent = data.stats.total || 0;

        if (data.db && data.db.connected) {
          dashDbVersion.textContent = `MariaDB ${String(data.db.version).split('-')[0] || '10.6'}`;
          statDbStatus.textContent = 'Online';
          statDbStatus.className = 'metric-value text-green';
          statDbName.textContent = data.db.database || 'malasele_db';
        }
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  // ============================================================
  // 1. INQUIRIES MANAGEMENT
  // ============================================================
  async function loadInquiries() {
    const status = inquiryFilter ? inquiryFilter.value : 'all';
    const search = inquirySearch ? inquirySearch.value.trim() : '';

    if (inquiriesTableBody) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading inquiries...</td></tr>`;
    }

    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(ENDPOINTS.inquiries(params.toString()), {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        state.inquiries = data.inquiries || [];
        if (badgeInquiries) badgeInquiries.textContent = state.inquiries.length;
        renderInquiriesTable(data.inquiries);
      } else {
        inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
      }
    } catch (err) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load inquiries.</td></tr>`;
    }
  }

  function renderInquiriesTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No client inquiries found matching criteria.</td></tr>`;
      return;
    }

    inquiriesTableBody.innerHTML = inquiries.map((inq) => {
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

  function closeInquiryModal() {
    if (detailModal) detailModal.style.display = 'none';
    state.selectedInquiry = null;
  }

  async function handleSaveStatus() {
    if (!state.selectedInquiry) return;
    const newStatus = modalStatusSelect.value;
    const id = state.selectedInquiry.id;

    saveStatusBtn.textContent = 'Saving...';

    try {
      const res = await fetch(ENDPOINTS.inquiryDetail(id), {
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
        closeInquiryModal();
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
      const res = await fetch(ENDPOINTS.inquiryDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        closeInquiryModal();
        loadDashboardStats();
        loadInquiries();
      } else {
        alert('Failed to delete inquiry: ' + data.error);
      }
    } catch (e) {
      alert('Error communicating with server.');
    }
  }

  // ============================================================
  // 2. PRODUCTS CATALOG (ANY STAFF CAN ADD / MANAGE)
  // ============================================================
  async function loadProducts() {
    const categoryId = productCategoryFilter ? productCategoryFilter.value : 'all';
    const search = productSearch ? productSearch.value.trim() : '';

    if (productsGrid) {
      productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Querying hardware catalog...</div>`;
    }

    try {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
      if (search) params.append('search', search);

      const res = await fetch(ENDPOINTS.products(params.toString()));
      const data = await res.json();

      if (data.success) {
        state.products = data.products || [];
        if (badgeProducts) badgeProducts.textContent = state.products.length;
        if (statProducts) statProducts.textContent = state.products.length;
        renderProductsGrid(data.products);
      }
    } catch (err) {
      if (productsGrid) {
        productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--status-red); padding: 40px;">Failed to load catalog products.</div>`;
      }
    }
  }

  function renderProductsGrid(products) {
    if (!productsGrid) return;

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
          No hardware products found matching your search. Click <strong>"+ Add Product"</strong> to register new equipment.
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = products.map(prod => {
      const img = prod.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
      const statusClass = prod.status === 'active' ? 'active' : 'draft';
      const statusLabel = prod.status === 'active' ? 'Active' : 'Draft';

      return `
        <div class="product-card" data-id="${prod.id}">
          <div class="product-card-img-wrap">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(prod.name)}" class="product-card-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'">
            <span class="product-status-tag ${statusClass}">${statusLabel}</span>
          </div>

          <div class="product-card-body">
            <span class="product-cat-pill">${escapeHtml(prod.category_name || 'General AV Hardware')}</span>
            <h3 class="product-title">${escapeHtml(prod.name)}</h3>
            ${prod.model_number ? `<span class="product-model-code">SKU: ${escapeHtml(prod.model_number)}</span>` : ''}
            ${prod.tagline ? `<p class="product-tagline">${escapeHtml(prod.tagline)}</p>` : ''}
            
            ${prod.specifications ? `
              <div class="product-specs-box">
                ${escapeHtml(prod.specifications)}
              </div>
            ` : ''}

            <div class="product-card-footer">
              <span style="font-size: 0.72rem; color: var(--text-muted);">Added by: ${escapeHtml(prod.created_by || 'Staff')}</span>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-table-action" onclick="window.malasEditProduct(${prod.id})">Edit</button>
                <button type="button" class="btn-delete-danger" onclick="window.malasDeleteProduct(${prod.id})">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openProductModal(prod = null) {
    state.selectedProduct = prod;

    // Populate category dropdown in modal
    if (productCategorySelect) {
      productCategorySelect.innerHTML = state.categories.map(cat => `
        <option value="${cat.id}" ${prod && prod.category_id == cat.id ? 'selected' : ''}>${escapeHtml(cat.name)}</option>
      `).join('');
    }

    if (prod) {
      productModalTitle.textContent = 'Edit Hardware Product';
      productIdInput.value = prod.id;
      productNameInput.value = prod.name;
      productModelInput.value = prod.model_number || '';
      productTaglineInput.value = prod.tagline || '';
      productImageInput.value = prod.image_url || '';
      productStatusSelect.value = prod.status || 'active';
      productSpecsInput.value = prod.specifications || '';
      productDescInput.value = prod.description || '';
    } else {
      productModalTitle.textContent = 'Add Hardware Product';
      productForm.reset();
      productIdInput.value = '';
      productStatusSelect.value = 'active';
    }

    productModal.style.display = 'flex';
  }

  function closeProductModal() {
    if (productModal) productModal.style.display = 'none';
    state.selectedProduct = null;
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    const id = productIdInput.value;
    const payload = {
      name: productNameInput.value.trim(),
      category_id: productCategorySelect.value ? parseInt(productCategorySelect.value, 10) : null,
      model_number: productModelInput.value.trim(),
      tagline: productTaglineInput.value.trim(),
      image_url: productImageInput.value.trim(),
      status: productStatusSelect.value,
      specifications: productSpecsInput.value.trim(),
      description: productDescInput.value.trim()
    };

    if (!payload.name) {
      alert('Product name is required.');
      return;
    }

    try {
      const url = id ? ENDPOINTS.productDetail(id) : ENDPOINTS.products();
      const method = id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        closeProductModal();
        loadProducts();
        loadCategories(); // refresh product counts
      } else {
        alert('Could not save product: ' + data.error);
      }
    } catch (err) {
      alert('Communication failure while saving product.');
    }
  }

  window.malasEditProduct = function (id) {
    const prod = state.products.find(p => p.id === id);
    if (prod) openProductModal(prod);
  };

  window.malasDeleteProduct = async function (id) {
    const prod = state.products.find(p => p.id === id);
    if (!prod) return;

    const ok = confirm(`Delete product "${prod.name}" permanently from catalog?`);
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.productDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadProducts();
        loadCategories();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Communication error.');
    }
  };

  // ============================================================
  // 3. CATEGORIES MANAGEMENT (ANY STAFF CAN ADD / MANAGE)
  // ============================================================
  async function loadCategories() {
    try {
      const res = await fetch(ENDPOINTS.categories);
      const data = await res.json();

      if (data.success) {
        state.categories = data.categories || [];
        if (badgeCategories) badgeCategories.textContent = state.categories.length;
        if (statCategoriesCount) statCategoriesCount.textContent = `${state.categories.length} AV Categories`;

        // Update product category filter dropdown
        if (productCategoryFilter) {
          const currentVal = productCategoryFilter.value;
          productCategoryFilter.innerHTML = `<option value="all">All Categories</option>` +
            state.categories.map(c => `<option value="${c.id}" ${c.id == currentVal ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
        }

        renderCategoriesGrid(state.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  function renderCategoriesGrid(categories) {
    if (!categoriesGrid) return;

    if (!categories || categories.length === 0) {
      categoriesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
          No categories created yet. Click <strong>"+ Add Category"</strong> to create a new AV classification.
        </div>
      `;
      return;
    }

    categoriesGrid.innerHTML = categories.map(cat => `
      <div class="category-card" data-id="${cat.id}">
        <div class="category-header">
          <h3 class="category-title">${escapeHtml(cat.name)}</h3>
          <span class="category-slug-badge">${escapeHtml(cat.slug)}</span>
        </div>
        <p class="category-desc">${escapeHtml(cat.description || 'No detailed scope notes provided.')}</p>
        <div class="category-footer">
          <span class="category-count-badge">${cat.product_count || 0} Registered Products</span>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-table-action" onclick="window.malasEditCategory(${cat.id})">Edit</button>
            <button type="button" class="btn-delete-danger" onclick="window.malasDeleteCategory(${cat.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openCategoryModal(cat = null) {
    state.selectedCategory = cat;
    if (cat) {
      categoryModalTitle.textContent = 'Edit AV Category';
      categoryIdInput.value = cat.id;
      categoryNameInput.value = cat.name;
      categoryDescInput.value = cat.description || '';
    } else {
      categoryModalTitle.textContent = 'Add AV Category';
      categoryForm.reset();
      categoryIdInput.value = '';
    }
    categoryModal.style.display = 'flex';
  }

  function closeCategoryModal() {
    if (categoryModal) categoryModal.style.display = 'none';
    state.selectedCategory = null;
  }

  async function handleSaveCategory(e) {
    e.preventDefault();
    const id = categoryIdInput.value;
    const name = categoryNameInput.value.trim();
    const description = categoryDescInput.value.trim();

    if (!name) {
      alert('Category name is required.');
      return;
    }

    try {
      const url = id ? ENDPOINTS.categoryDetail(id) : ENDPOINTS.categories;
      const method = id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();

      if (data.success) {
        closeCategoryModal();
        loadCategories();
      } else {
        alert('Could not save category: ' + data.error);
      }
    } catch (err) {
      alert('Communication failure while saving category.');
    }
  }

  window.malasEditCategory = function (id) {
    const cat = state.categories.find(c => c.id === id);
    if (cat) openCategoryModal(cat);
  };

  window.malasDeleteCategory = async function (id) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    const ok = confirm(`Delete category "${cat.name}"? Products under this category will have their category unassigned.`);
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.categoryDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadCategories();
        loadProducts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Communication error.');
    }
  };

  // ============================================================
  // 4. EMPLOYEES MANAGEMENT (STRICTLY CEO ACCESS ONLY)
  // ============================================================
  async function loadEmployees() {
    if (!state.admin || (state.admin.role !== 'ceo' && state.admin.role !== 'super_admin')) {
      return;
    }

    if (employeesTableBody) {
      employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading operations personnel...</td></tr>`;
    }

    try {
      const res = await fetch(ENDPOINTS.employees, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        state.employees = data.employees || [];
        if (statEmployees) statEmployees.textContent = state.employees.length;
        renderEmployeesTable(state.employees);
      } else {
        if (employeesTableBody) {
          employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Security restriction: ${data.error}</td></tr>`;
        }
      }
    } catch (err) {
      if (employeesTableBody) {
        employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load employee directory.</td></tr>`;
      }
    }
  }

  function renderEmployeesTable(employees) {
    if (!employeesTableBody) return;

    if (!employees || employees.length === 0) {
      employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No employee records found. Click "+ Add Employee" to onboard team members.</td></tr>`;
      return;
    }

    employeesTableBody.innerHTML = employees.map(emp => {
      const isCeo = emp.role === 'ceo' || emp.role === 'super_admin';
      const isSelf = state.admin && emp.id === state.admin.id;
      const initials = (emp.full_name || emp.username || 'EM').slice(0, 2).toUpperCase();
      const statusClass = emp.status === 'active' ? 'new' : 'archived';
      const roleBadge = isCeo
        ? `<span class="badge-role-ceo">CHIEF EXECUTIVE (CEO)</span>`
        : `<span class="badge-role-employee">STAFF ENGINEER</span>`;

      const lastLoginStr = emp.last_login
        ? new Date(emp.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        : 'Never';

      return `
        <tr data-id="${emp.id}">
          <td>
            <div class="user-avatar-cell">
              <div class="emp-avatar-circle">${escapeHtml(initials)}</div>
              <div>
                <strong style="color: var(--text-pure); font-size: 0.92rem;">${escapeHtml(emp.full_name || 'Staff Member')}</strong>
                ${isSelf ? '<span style="font-size: 0.7rem; color: var(--accent-bronze); margin-left: 6px;">(You)</span>' : ''}
              </div>
            </div>
          </td>
          <td>
            <code style="font-family: var(--font-mono); color: var(--accent-bronze-light);">${escapeHtml(emp.username)}</code>
          </td>
          <td>
            <a href="mailto:${escapeHtml(emp.email)}" style="color: var(--text-body); text-decoration: underline;">${escapeHtml(emp.email)}</a>
          </td>
          <td>
            ${roleBadge}
          </td>
          <td>
            <span class="status-pill ${statusClass}">${escapeHtml(emp.status)}</span>
          </td>
          <td style="color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-mono);">
            ${lastLoginStr}
          </td>
          <td style="text-align: right;">
            ${isSelf ? `
              <span style="color: var(--text-muted); font-size: 0.75rem;">Active Session</span>
            ` : `
              <button type="button" class="btn-table-action" onclick="window.malasToggleEmployeeStatus(${emp.id}, '${emp.status}')">
                ${emp.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button type="button" class="btn-delete-danger" onclick="window.malasDeleteEmployee(${emp.id}, '${escapeHtml(emp.username)}')">
                Delete
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  function openEmployeeModal() {
    employeeForm.reset();
    empRoleSelect.value = 'employee';
    employeeModal.style.display = 'flex';
  }

  function closeEmployeeModal() {
    if (employeeModal) employeeModal.style.display = 'none';
  }

  async function handleCreateEmployee(e) {
    e.preventDefault();
    const payload = {
      full_name: empNameInput.value.trim(),
      username: empUsernameInput.value.trim(),
      email: empEmailInput.value.trim(),
      password: empPasswordInput.value,
      role: empRoleSelect.value
    };

    if (!payload.full_name || !payload.username || !payload.email || !payload.password) {
      alert('All fields are mandatory to create an employee account.');
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.employees, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        closeEmployeeModal();
        loadEmployees();
      } else {
        alert('Could not onboard employee: ' + data.error);
      }
    } catch (err) {
      alert('Server communication error.');
    }
  }

  window.malasToggleEmployeeStatus = async function (id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirmAction = confirm(`Are you sure you want to change this account status to "${newStatus.toUpperCase()}"?`);
    if (!confirmAction) return;

    try {
      const res = await fetch(ENDPOINTS.employeeDetail(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success) {
        loadEmployees();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Server communication error.');
    }
  };

  window.malasDeleteEmployee = async function (id, username) {
    const ok = confirm(`Permanently delete employee account "${username}"?`);
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.employeeDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        loadEmployees();
      } else {
        alert('Failed to delete employee: ' + data.error);
      }
    } catch (e) {
      alert('Communication failure.');
    }
  };

  // ============================================================
  // GENERAL HELPERS
  // ============================================================
  function showAlert(msg, type = 'error') {
    loginAlert.textContent = msg;
    loginAlert.className = `alert-banner ${type}`;
    loginAlert.style.display = 'block';
  }

  function hideAlert() {
    loginAlert.style.display = 'none';
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
