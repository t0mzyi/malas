/**
 * MALAS ELECTRONICS LLC — ENTERPRISE OPERATIONS & DISPATCH PORTAL
 * Streamlined Client Logic: Inquiries Dispatch, Hardware Catalog, Stock Control,
 * Quoting & Invoicing Engine, and AV Disciplines Management
 */

(function () {
  'use strict';

  // Determine API base URL dynamically (Express dev on 5000 / Vite on 3000 / Native PHP on Apache/cPanel/DirectAdmin)
  const isNodeDev = (
    window.location.port === '5000' ||
    window.location.port === '3000' ||
    window.location.origin.includes(':5000') ||
    window.location.origin.includes(':3000')
  );
  const apiRoot = isNodeDev ? '/api' : './api';

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
    productStock: (id) => isNodeDev ? `${apiRoot}/products/${id}/stock` : `${apiRoot}/products.php?action=stock&id=${id}`,
    categories: isNodeDev ? `${apiRoot}/categories` : `${apiRoot}/categories.php`,
    categoryDetail: (id) => isNodeDev ? `${apiRoot}/categories/${id}` : `${apiRoot}/categories.php?id=${id}`,
    invoices: (query = '') => isNodeDev ? `${apiRoot}/invoices${query ? '?' + query : ''}` : `${apiRoot}/invoices.php${query ? '?' + query : ''}`,
    invoiceDetail: (id) => isNodeDev ? `${apiRoot}/invoices/${id}` : `${apiRoot}/invoices.php?id=${id}`,
    employees: isNodeDev ? `${apiRoot}/employees` : `${apiRoot}/employees.php`,
    employeeDetail: (id) => isNodeDev ? `${apiRoot}/employees/${id}` : `${apiRoot}/employees.php?id=${id}`,
    upload: isNodeDev ? `${apiRoot}/upload` : `${apiRoot}/upload.php`
  };

  // Restore stored session immediately from localStorage
  const savedToken = localStorage.getItem('malas_admin_token') || null;
  let savedAdmin = null;
  try {
    const rawAdmin = localStorage.getItem('malas_admin_user');
    if (rawAdmin) savedAdmin = JSON.parse(rawAdmin);
  } catch (e) {}

  // Application State
  const state = {
    token: savedToken,
    admin: savedAdmin || (savedToken ? { fullName: 'Administrator', username: 'admin', role: 'admin' } : null),
    currentTab: 'inquiries',
    inquiries: [],
    products: [],
    categories: [],
    invoices: [],
    employees: [],
    cart: [], // items: { id, name, model_number, price, stock, quantity, image_url }
    selectedInquiry: null,
    selectedProduct: null,
    selectedCategory: null,
    activeInvoiceForView: null,
    editingInvoiceId: null,
    editingInvoiceNumber: null
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

  // Dashboard Header & Navigation DOM Elements
  const logoutBtn = document.getElementById('logout-btn');
  const dashUserName = document.getElementById('header-user-name') || document.getElementById('dash-user-name');
  const dashUserRole = document.getElementById('header-user-role') || document.getElementById('dash-user-role');
  const userAvatarInitials = document.getElementById('header-user-avatar') || document.getElementById('user-avatar-initials');
  const pageCurrentTitle = document.getElementById('page-current-title');

  // Metrics DOM Elements
  const statInquiries = document.getElementById('stat-inquiries');
  const statProducts = document.getElementById('stat-products');
  const statInvoices = document.getElementById('stat-invoices');
  const statEmployees = document.getElementById('stat-employees');

  // Navigation DOM Elements
  const tabButtons = document.querySelectorAll('.sidebar-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const badgeInquiries = document.getElementById('badge-inquiries-count');
  const badgeProducts = document.getElementById('badge-products-count');
  const badgeInvoices = document.getElementById('badge-invoices-count');
  const badgeEmployees = document.getElementById('badge-employees-count');
  const tabBtnEmployees = document.getElementById('tab-btn-employees');
  const metricCardEmployees = document.getElementById('metric-card-employees');
  const dashPortalModeLabel = document.getElementById('dash-portal-mode-label');

  // Employees DOM Elements
  const employeesTableBody = document.getElementById('employees-table-body');
  const employeeSearch = document.getElementById('employee-search');
  const employeeStatusFilter = document.getElementById('employee-status-filter');
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  const employeeModal = document.getElementById('employee-modal');
  const employeeModalTitle = document.getElementById('employee-modal-title');
  const closeEmployeeModalBtn = document.getElementById('close-employee-modal-btn');
  const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
  const employeeForm = document.getElementById('employee-form');
  const employeeIdInput = document.getElementById('employee-id');
  const employeeNameInput = document.getElementById('employee-name');
  const employeeEmailInput = document.getElementById('employee-email');
  const employeeUsernameInput = document.getElementById('employee-username');
  const employeePasswordInput = document.getElementById('employee-password');
  const employeeRoleSelect = document.getElementById('employee-role');

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

  // Inquiry Detail Subpage Elements
  const tabInquiryDetail = document.getElementById('tab-inquiry-detail');
  const inquiryBackBtn = document.getElementById('inquiry-back-btn');
  const inquiryDetailStatusPill = document.getElementById('inquiry-detail-status-pill');
  const inqPageTag = document.getElementById('inq-page-tag');
  const inqPageClientName = document.getElementById('inq-page-client-name');
  const inqPageDate = document.getElementById('inq-page-date');
  const inqPageCallBtn = document.getElementById('inq-page-call-btn');
  const inqPageMailBtn = document.getElementById('inq-page-mail-btn');
  const inqPageContactName = document.getElementById('inq-page-contact-name');
  const inqPageEmail = document.getElementById('inq-page-email');
  const inqPagePhone = document.getElementById('inq-page-phone');
  const inqPageSector = document.getElementById('inq-page-sector');
  const inqPageVenue = document.getElementById('inq-page-venue');
  const inqPageBudget = document.getElementById('inq-page-budget');
  const inqPageTimeline = document.getElementById('inq-page-timeline');
  const inqPageScope = document.getElementById('inq-page-scope');
  const inqPageStatusSelect = document.getElementById('inq-page-status-select');
  const inqPageSaveStatusBtn = document.getElementById('inq-page-save-status-btn');
  const inqPageDeleteBtn = document.getElementById('inq-page-delete-btn');

  // Employee Detail Subpage Elements
  const tabEmployeeDetail = document.getElementById('tab-employee-detail');
  const employeeBackBtn = document.getElementById('employee-back-btn');
  const employeeDetailStatusPill = document.getElementById('employee-detail-status-pill');
  const empPageAvatar = document.getElementById('emp-page-avatar');
  const empPageName = document.getElementById('emp-page-name');
  const empPageRoleLabel = document.getElementById('emp-page-role-label');
  const empPageUsername = document.getElementById('emp-page-username');
  const empPageMailBtn = document.getElementById('emp-page-mail-btn');
  const empPageFullname = document.getElementById('emp-page-fullname');
  const empPageLoginUser = document.getElementById('emp-page-login-user');
  const empPageEmail = document.getElementById('emp-page-email');
  const empPageRoleText = document.getElementById('emp-page-role-text');
  const empPageStatusText = document.getElementById('emp-page-status-text');
  const empPageCreatedAt = document.getElementById('emp-page-created-at');
  const empPageLastLogin = document.getElementById('emp-page-last-login');
  const empPageId = document.getElementById('emp-page-id');
  const empPageToggleBlockBtn = document.getElementById('emp-page-toggle-block-btn');
  const empPageBlockHint = document.getElementById('emp-page-block-hint');
  const empPageDeleteBtn = document.getElementById('emp-page-delete-btn');

  // Products DOM Elements
  const productsGrid = document.getElementById('products-grid-container');
  const productSearch = document.getElementById('product-search');
  const productStockFilter = document.getElementById('product-stock-filter');
  const productSortSelect = document.getElementById('product-sort-select');
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productModalTitle = document.getElementById('product-modal-title');
  const closeProductModalBtn = document.getElementById('close-product-modal-btn');
  const cancelProductBtn = document.getElementById('cancel-product-btn');
  const deleteModalProductBtn = document.getElementById('delete-modal-product-btn');
  const saveProductBtn = document.getElementById('save-product-btn');
  const productForm = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productTaglineInput = document.getElementById('product-tagline');
  const productPriceInput = document.getElementById('product-price');
  const productStockInput = document.getElementById('product-stock');
  const productImageInput = document.getElementById('product-image');

  // Cloudinary Dropzone DOM Elements
  const imageUploadDropzone = document.getElementById('image-upload-dropzone');
  const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
  const dropzoneUploadingState = document.getElementById('dropzone-uploading-state');
  const dropzonePreviewState = document.getElementById('dropzone-preview-state');
  const btnTriggerFile = document.getElementById('btn-trigger-file');
  const btnReplaceImg = document.getElementById('btn-replace-img');
  const removeImgBtn = document.getElementById('remove-img-btn');
  const cloudinaryFileInput = document.getElementById('cloudinary-file-input');
  const cloudinaryImgPreview = document.getElementById('cloudinary-img-preview');

  // Direct URL Fallback Elements
  const btnToggleUrlInput = document.getElementById('btn-toggle-url-input');
  const directUrlInputContainer = document.getElementById('direct-url-input-container');
  const productImageNewUrlInput = document.getElementById('product-image-url-input');


  // Cart & Quotations DOM Elements
  const newInvoiceTabBtn = document.getElementById('new-invoice-from-tab-btn');
  const openCartBtn = document.getElementById('open-cart-btn');
  const cartItemCount = document.getElementById('cart-item-count');
  const invoiceCartModal = document.getElementById('invoice-cart-modal');
  const closeCartModalBtn = document.getElementById('close-cart-modal-btn');
  const cartContinueShoppingBtn = document.getElementById('cart-continue-shopping-btn');
  const cartItemsTbody = document.getElementById('cart-items-tbody') || document.getElementById('cart-table-body');
  const cartItemDistinctCount = document.getElementById('cart-item-distinct-count');
  const finalizeInvoiceForm = document.getElementById('finalize-invoice-form') || document.getElementById('invoice-finalize-form');
  const cartClientName = document.getElementById('cart-client-name');
  const cartClientEmail = document.getElementById('cart-client-email');
  const cartClientPhone = document.getElementById('cart-client-phone');
  const cartProjectName = document.getElementById('cart-project-name');
  const cartDiscountInput = document.getElementById('cart-discount-input');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryVat = document.getElementById('summary-vat');
  const summaryGrandTotal = document.getElementById('summary-grand-total');
  const cartClearAllBtn = document.getElementById('cart-clear-all-btn');
  const invoiceProductSearchInput = document.getElementById('invoice-product-search-input');
  const invoiceProductPickerVal = document.getElementById('invoice-product-picker-val');
  const invoiceSearchResultsDropdown = document.getElementById('invoice-search-results-dropdown');
  const invoiceSearchClearBtn = document.getElementById('invoice-search-clear-btn');
  const invoicePickerQty = document.getElementById('invoice-picker-qty');
  const invoicePickerQtyDec = document.getElementById('invoice-picker-qty-dec');
  const invoicePickerQtyInc = document.getElementById('invoice-picker-qty-inc');
  const invoiceAddItemBtn = document.getElementById('invoice-add-item-btn');

  // Invoices Management Tab DOM Elements
  const invoicesTableBody = document.getElementById('invoices-table-body');
  const invoiceSearch = document.getElementById('invoice-search');
  const invoiceViewModal = document.getElementById('invoice-view-modal');
  const closeInvoiceViewBtn = document.getElementById('close-invoice-view-btn');
  const exportExcelBtn = document.getElementById('export-excel-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const printInvoiceBtn = document.getElementById('print-invoice-btn');
  const viewModalNumber = document.getElementById('view-modal-number');
  const viewModalStatus = document.getElementById('view-modal-status');
  const printInvNum = document.getElementById('print-inv-num');
  const printInvDate = document.getElementById('print-inv-date');
  const printInvAuthor = document.getElementById('print-inv-author');
  const printClientName = document.getElementById('print-client-name');
  const printClientEmail = document.getElementById('print-client-email');
  const printClientPhone = document.getElementById('print-client-phone');
  const printProjectName = document.getElementById('print-project-name');
  const printItemsTbody = document.getElementById('print-items-tbody');
  const printSubtotal = document.getElementById('print-subtotal');
  const printDiscount = document.getElementById('print-discount');
  const printTaxable = document.getElementById('print-taxable');
  const printVat = document.getElementById('print-vat');
  const printTotal = document.getElementById('print-total');

  // Quick Stock Adjustment Modal DOM Elements
  const stockModal = document.getElementById('stock-modal');
  const closeStockModalBtn = document.getElementById('close-stock-modal-btn');
  const cancelStockModalBtn = document.getElementById('cancel-stock-modal-btn');
  const stockForm = document.getElementById('stock-form');
  const stockAdjustProductId = document.getElementById('stock-adjust-product-id');
  const stockAdjustProductName = document.getElementById('stock-adjust-product-name');
  const stockAdjustSku = document.getElementById('stock-adjust-sku');
  const stockAdjustQty = document.getElementById('stock-adjust-qty');
  const stockQtyDec = document.getElementById('stock-qty-dec');
  const stockQtyInc = document.getElementById('stock-qty-inc');


  // ============================================================
  // BOOTSTRAP APPLICATION
  // ============================================================
  init();

  async function init() {
    setupEventListeners();
    setupUrlRoutingListener();
    if (state.token) {
      document.documentElement.classList.add('is-authenticated');
      showDashboardView();
    } else {
      document.documentElement.classList.remove('is-authenticated');
      showLoginView();
    }
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

    // Universal Confirmation Modal Handlers
    const confirmModalEl = document.getElementById('confirm-modal');
    const confirmActionBtn = document.getElementById('confirm-modal-action-btn');
    const confirmCancelBtn = document.getElementById('confirm-modal-cancel-btn');

    if (confirmActionBtn) confirmActionBtn.addEventListener('click', () => closeConfirmModal(true));
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => closeConfirmModal(false));
    if (confirmModalEl) {
      confirmModalEl.addEventListener('click', (e) => {
        if (e.target === confirmModalEl) closeConfirmModal(false);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const cModal = document.getElementById('confirm-modal');
        if (cModal && cModal.style.display === 'flex') {
          closeConfirmModal(false);
        }
      }
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
        loadInvoices();
        populateCategoryDropdown();
        if (state.admin && (state.admin.role === 'ceo' || state.admin.role === 'super_admin' || state.admin.role === 'admin')) {
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
    if (saveStatusBtn) saveStatusBtn.addEventListener('click', handleSaveInquiryStatus);
    if (deleteInquiryBtn) deleteInquiryBtn.addEventListener('click', handleDeleteInquiry);

    // Inquiry Subpage Controls
    if (inquiryBackBtn) inquiryBackBtn.addEventListener('click', () => switchTab('inquiries'));
    if (inqPageSaveStatusBtn) inqPageSaveStatusBtn.addEventListener('click', handleSaveInquiryPageStatus);
    if (inqPageDeleteBtn) inqPageDeleteBtn.addEventListener('click', handleDeleteInquiryPage);

    // Employee Subpage Controls
    if (employeeBackBtn) employeeBackBtn.addEventListener('click', () => switchTab('employees'));
    if (empPageToggleBlockBtn) empPageToggleBlockBtn.addEventListener('click', handleToggleBlockFromSubpage);
    if (empPageDeleteBtn) empPageDeleteBtn.addEventListener('click', handleDeleteEmployeeFromSubpage);

    // Products Controls & Modal
    if (productSearch) {
      productSearch.addEventListener('input', debounce(filterProductsLocal, 250));
    }
    if (productStockFilter) {
      productStockFilter.addEventListener('change', filterProductsLocal);
    }
    if (productSortSelect) {
      productSortSelect.addEventListener('change', filterProductsLocal);
    }
    if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal());
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);
    if (productModal) {
      productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
      });
    }
    if (productForm) productForm.addEventListener('submit', handleSaveProduct);

    if (productPriceInput) {
      productPriceInput.addEventListener('focus', function () {
        if (this.value === '0' || this.value === '0.00' || this.value === '0.0') {
          this.value = '';
        } else {
          this.select();
        }
      });
      productPriceInput.addEventListener('click', function () {
        if (this.value === '0' || this.value === '0.00' || this.value === '0.0') {
          this.value = '';
        }
      });
    }

    if (productStockInput) {
      productStockInput.addEventListener('focus', function () {
        this.select();
      });
    }

    if (deleteModalProductBtn) {
      deleteModalProductBtn.addEventListener('click', () => {
        const id = productIdInput ? productIdInput.value : null;
        const name = productNameInput ? productNameInput.value : 'this product';
        if (id) {
          window.malasDeleteProduct(parseInt(id, 10), name);
        }
      });
    }

    // Cloudinary Dropzone Drag & Drop & Click Events
    if (imageUploadDropzone) {
      imageUploadDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btn-replace-img') || e.target.closest('#btn-trigger-file') || e.target.closest('.dropzone-empty')) {
          if (cloudinaryFileInput) cloudinaryFileInput.click();
        }
      });

      imageUploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadDropzone.classList.add('is-dragover');
      });

      imageUploadDropzone.addEventListener('dragleave', () => {
        imageUploadDropzone.classList.remove('is-dragover');
      });

      imageUploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadDropzone.classList.remove('is-dragover');
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          processImageUploadFile(files[0]);
        }
      });
    }

    if (btnTriggerFile) {
      btnTriggerFile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cloudinaryFileInput) cloudinaryFileInput.click();
      });
    }

    if (btnReplaceImg) {
      btnReplaceImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cloudinaryFileInput) cloudinaryFileInput.click();
      });
    }

    if (cloudinaryFileInput) {
      cloudinaryFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) processImageUploadFile(file);
      });
    }

    if (removeImgBtn) {
      removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetDropzoneToEmpty();
      });
    }

    if (btnToggleUrlInput) {
      btnToggleUrlInput.addEventListener('click', () => {
        if (!directUrlInputContainer) return;
        const isHidden = directUrlInputContainer.style.display === 'none';
        directUrlInputContainer.style.display = isHidden ? 'block' : 'none';
        btnToggleUrlInput.textContent = isHidden ? '▲ Hide URL input' : '🔗 Or paste an existing image URL';
      });
    }

    if (productImageNewUrlInput) {
      productImageNewUrlInput.addEventListener('input', () => {
        const url = productImageNewUrlInput.value.trim();
        if (url) {
          setDropzonePreview(url);
        } else {
          resetDropzoneToEmpty();
        }
      });
    }


    // Invoice Creation Modal
    if (newInvoiceTabBtn) {
      newInvoiceTabBtn.addEventListener('click', () => {
        resetInvoiceModalMode();
        openCartModal();
      });
    }
    if (openCartBtn) {
      openCartBtn.addEventListener('click', () => {
        resetInvoiceModalMode();
        openCartModal();
      });
    }
    if (closeCartModalBtn) closeCartModalBtn.addEventListener('click', closeCartModal);
    if (cartContinueShoppingBtn) cartContinueShoppingBtn.addEventListener('click', closeCartModal);
    if (invoiceCartModal) {
      invoiceCartModal.addEventListener('click', (e) => {
        if (e.target === invoiceCartModal) closeCartModal();
      });
    }
    if (cartDiscountInput) {
      cartDiscountInput.addEventListener('input', updateCartSummary);
    }
    if (finalizeInvoiceForm) {
      finalizeInvoiceForm.addEventListener('submit', handleFinalizeInvoice);
    }
    if (cartClearAllBtn) {
      cartClearAllBtn.addEventListener('click', () => {
        if (!state.cart || state.cart.length === 0) return;
        state.cart = [];
        updateCartBadge();
        renderCart();
        showToast('All products removed from invoice.', 'info', 'Invoice Cleared');
      });
    }
    if (invoiceAddItemBtn) {
      invoiceAddItemBtn.addEventListener('click', handleAddProductToInvoice);
    }
    if (invoicePickerQty) {
      invoicePickerQty.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddProductToInvoice();
        }
      });
    }
    if (invoicePickerQtyDec) {
      invoicePickerQtyDec.addEventListener('click', (e) => {
        e.preventDefault();
        const input = invoicePickerQty || document.getElementById('invoice-picker-qty');
        if (input) {
          const val = parseInt(input.value, 10) || 1;
          input.value = Math.max(1, val - 1);
        }
      });
    }
    if (invoicePickerQtyInc) {
      invoicePickerQtyInc.addEventListener('click', (e) => {
        e.preventDefault();
        const input = invoicePickerQty || document.getElementById('invoice-picker-qty');
        if (input) {
          const val = parseInt(input.value, 10) || 1;
          const hiddenVal = invoiceProductPickerVal || document.getElementById('invoice-product-picker-val');
          const pId = parseInt(hiddenVal ? hiddenVal.value : 0, 10);
          const prod = pId ? state.products.find(p => p.id === pId) : null;
          const maxStock = prod ? parseInt(prod.stock || 9999, 10) : 9999;
          if (val >= maxStock) {
            showToast(`Maximum available inventory for this item is ${maxStock}.`, 'warning', 'Stock Limit');
            return;
          }
          input.value = val + 1;
        }
      });
    }

    // Invoice Searchable Product Picker Listeners
    if (invoiceProductSearchInput) {
      invoiceProductSearchInput.addEventListener('focus', () => {
        filterAndRenderInvoiceSearchResults(invoiceProductSearchInput.value);
      });
      invoiceProductSearchInput.addEventListener('input', () => {
        const val = invoiceProductSearchInput.value.trim();
        if (invoiceSearchClearBtn) invoiceSearchClearBtn.style.display = val ? 'block' : 'none';
        if (invoiceProductPickerVal) invoiceProductPickerVal.value = '';
        filterAndRenderInvoiceSearchResults(val);
      });
      invoiceProductSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const dropdown = invoiceSearchResultsDropdown || document.getElementById('invoice-search-results-dropdown');
          const firstInStock = dropdown ? dropdown.querySelector('.invoice-search-item:not(.item-out-of-stock)') : null;
          if (invoiceProductPickerVal && !invoiceProductPickerVal.value && firstInStock) {
            const pId = parseInt(firstInStock.getAttribute('data-product-id'), 10);
            window.malasSelectInvoiceProduct(pId);
          } else {
            handleAddProductToInvoice();
          }
        } else if (e.key === 'Escape') {
          closeInvoiceSearchDropdown();
        }
      });
    }

    if (invoiceSearchClearBtn) {
      invoiceSearchClearBtn.addEventListener('click', clearInvoiceProductSelection);
    }

    document.addEventListener('click', (e) => {
      const wrap = document.querySelector('.invoice-search-picker-wrap');
      if (wrap && !wrap.contains(e.target)) {
        closeInvoiceSearchDropdown();
      }
    });

    // Invoice Viewer Modal
    const editInvoiceFromViewBtn = document.getElementById('edit-invoice-from-view-btn');
    if (editInvoiceFromViewBtn) {
      editInvoiceFromViewBtn.addEventListener('click', () => {
        if (!state.activeInvoiceForView) return;
        const invId = state.activeInvoiceForView.id;
        closeInvoiceViewModal();
        window.malasEditInvoice(invId);
      });
    }
    if (closeInvoiceViewBtn) closeInvoiceViewBtn.addEventListener('click', closeInvoiceViewModal);
    if (invoiceViewModal) {
      invoiceViewModal.addEventListener('click', (e) => {
        if (e.target === invoiceViewModal) closeInvoiceViewModal();
      });
    }
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', handleExportExcel);
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', handleExportPdf);
    if (printInvoiceBtn) {
      printInvoiceBtn.addEventListener('click', () => {
        const origTitle = document.title;
        document.title = ' ';
        window.print();
        setTimeout(() => {
          document.title = origTitle;
        }, 1000);
      });
    }

    // Invoices Search
    if (invoiceSearch) {
      invoiceSearch.addEventListener('input', debounce(loadInvoices, 300));
    }

    // Quick Stock Adjustment Modal
    if (closeStockModalBtn) closeStockModalBtn.addEventListener('click', closeStockModal);
    if (cancelStockModalBtn) cancelStockModalBtn.addEventListener('click', closeStockModal);
    if (stockQtyDec) {
      stockQtyDec.addEventListener('click', () => {
        const val = parseInt(stockAdjustQty.value, 10) || 0;
        if (val > 0) stockAdjustQty.value = val - 1;
      });
    }
    if (stockQtyInc) {
      stockQtyInc.addEventListener('click', () => {
        const val = parseInt(stockAdjustQty.value, 10) || 0;
        stockAdjustQty.value = val + 1;
      });
    }
    if (stockForm) stockForm.addEventListener('submit', handleSaveQuickStock);
    if (stockModal) {
      stockModal.addEventListener('click', (e) => {
        if (e.target === stockModal) closeStockModal();
      });
    }

    // Employees Controls & Modal (CEO)
    if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    if (closeEmployeeModalBtn) closeEmployeeModalBtn.addEventListener('click', closeEmployeeModal);
    if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', closeEmployeeModal);
    if (employeeModal) {
      employeeModal.addEventListener('click', (e) => {
        if (e.target === employeeModal) closeEmployeeModal();
      });
    }
    if (employeeForm) employeeForm.addEventListener('submit', handleSaveEmployee);
    if (employeeSearch) {
      employeeSearch.addEventListener('input', debounce(filterEmployeesLocal, 250));
    }
    if (employeeStatusFilter) {
      employeeStatusFilter.addEventListener('change', filterEmployeesLocal);
    }

    // Keyboard ESC to close any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeInquiryModal();
        closeProductModal();
        closeCartModal();
        closeInvoiceViewModal();
        closeStockModal();
        closeEmployeeModal();
      }
    });
  }

  // ============================================================
  // TAB NAVIGATION & URL ROUTING
  // ============================================================
  const TAB_TITLES = {
    inquiries: 'Client Inquiries & RFPs',
    products: 'Stock Management',
    invoices: 'Invoice Generation',
    employees: 'Employees'
  };

  function resolveTabName(name) {
    if (!name) return 'inquiries';
    const clean = String(name).toLowerCase().trim().replace(/^[/#]+|[/#]+$/g, '');
    if (['products', 'prodcuts', 'product', 'hardware', 'catalog', 'inventory'].includes(clean)) {
      return 'products';
    }
    if (['inquiries', 'inquiry', 'rfp', 'rfps', 'messages'].includes(clean)) {
      return 'inquiries';
    }
    if (['invoices', 'invoice', 'quotes', 'quotation', 'quotations'].includes(clean)) {
      return 'invoices';
    }
    if (['employees', 'employee', 'staff', 'team'].includes(clean)) {
      return 'employees';
    }
    return 'inquiries';
  }

  function getTabFromUrl() {
    // 1. Check hash first (e.g. #products, #prodcuts)
    const hash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
    if (hash) {
      return resolveTabName(hash);
    }

    // 2. Check path segments (e.g. /products, /admin/products)
    const pathname = window.location.pathname || '';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      if (last !== 'index.html' && last !== 'index.php') {
        return resolveTabName(last);
      }
      if (segments.length > 1) {
        return resolveTabName(segments[segments.length - 2]);
      }
    }

    return 'inquiries';
  }

  function getTargetPath(tabName) {
    const pathname = window.location.pathname || '';
    if (pathname.includes('/admin')) {
      return `/admin/${tabName}`;
    }
    return `/${tabName}`;
  }

  function switchTab(rawTabName, updateHistory = true) {
    let tabName = resolveTabName(rawTabName);
    const isCeo = isUserCeo(state.admin);
    if (tabName === 'employees' && !isCeo) {
      tabName = 'inquiries';
    }

    state.currentTab = tabName;

    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    tabPanels.forEach(panel => {
      const isTarget = panel.id === `tab-${tabName}`;
      panel.classList.toggle('active', isTarget);
      panel.style.display = isTarget ? 'block' : 'none';
    });

    if (pageCurrentTitle && TAB_TITLES[tabName]) {
      pageCurrentTitle.textContent = TAB_TITLES[tabName];
    }

    // Synchronize browser address bar with current page
    if (updateHistory && window.history && window.history.pushState) {
      const targetPath = getTargetPath(tabName);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab: tabName }, '', targetPath);
      }
    }

    if (TAB_TITLES[tabName]) {
      document.title = `${TAB_TITLES[tabName]} — Malas Electronics Admin`;
    }

    if (tabName === 'inquiries') loadInquiries();
    if (tabName === 'products') loadProducts();
    if (tabName === 'invoices') loadInvoices();
    if (tabName === 'employees') loadEmployees();
  }

  function setupUrlRoutingListener() {
    window.addEventListener('popstate', (e) => {
      const tab = (e.state && e.state.tab) || getTabFromUrl();
      if (tab) {
        switchTab(tab, false);
      }
    });
  }

  // ============================================================
  // SESSION VERIFICATION & AUTHENTICATION
  // ============================================================
  async function verifyCurrentSession() {
    const token = state.token;
    if (!token) {
      document.documentElement.classList.remove('is-authenticated');
      showLoginView();
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.me, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If server explicitly rejects with 401 Unauthorized, reset and prompt login
      if (res.status === 401) {
        console.warn('Session expired or invalidated by server (401).');
        handleLogout(false);
        showAlert('Your session expired. Please sign in to continue.', 'error');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          state.admin = data.admin;
          try {
            localStorage.setItem('malas_admin_user', JSON.stringify(data.admin));
          } catch (e) {}
          updateHeaderProfile(data.admin);
          if (isUserCeo(data.admin) && state.currentTab === 'employees') {
            loadEmployees();
          }
        }
      }
    } catch (e) {
      // Network offline, timeout, or local dev: retain session, DO NOT log out!
      console.warn('Background session check notice:', e);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
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

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned HTTP ${res.status}. Check api/ folder and database connection.`);
      }

      if (res.ok && data && data.success) {
        state.token = data.token;
        state.admin = data.admin;
        localStorage.setItem('malas_admin_token', data.token);
        if (data.admin) {
          try {
            localStorage.setItem('malas_admin_user', JSON.stringify(data.admin));
          } catch (e) {}
        }
        document.documentElement.classList.add('is-authenticated');

        showAlert('Access Granted. Authenticating operational clearance...', 'success');
        setTimeout(() => {
          showDashboardView();
        }, 200);
      } else {
        showAlert((data && data.error) ? data.error : `Authentication failed (HTTP ${res.status}).`, 'error');
      }
    } catch (err) {
      showAlert(err.message || 'Unable to reach authentication server.', 'error');
    } finally {
      setBtnLoading(false);
    }
  }

  async function handleLogout(notifyServer = true) {
    if (notifyServer) {
      try {
        await fetch(ENDPOINTS.logout, { method: 'POST' });
      } catch (e) {}
    }

    localStorage.removeItem('malas_admin_token');
    localStorage.removeItem('malas_admin_user');
    document.documentElement.classList.remove('is-authenticated');
    state.token = null;
    state.admin = null;
    showLoginView();
  }

  function showLoginView() {
    document.documentElement.classList.remove('is-authenticated');
    document.body.classList.remove('is-authenticated');
    if (loginView) {
      loginView.style.removeProperty('display');
      loginView.style.display = 'flex';
    }
    if (dashboardView) {
      dashboardView.style.setProperty('display', 'none', 'important');
    }
  }

  function isUserCeo(admin) {
    const usr = admin || state.admin || {};
    const role = (usr.role || '').toString().toLowerCase().trim();
    const uname = (usr.username || '').toString().toLowerCase().trim();
    const email = (usr.email || '').toString().toLowerCase().trim();
    return (
      role === 'ceo' ||
      role === 'super_admin' ||
      role === 'admin' ||
      role === 'administrator' ||
      uname === 'ceo' ||
      uname === 'admin' ||
      uname === 'ceo@malaselectronics.ae' ||
      email === 'ceo@malaselectronics.ae' ||
      email === 'admin@malaselectronics.com'
    );
  }

  function updateHeaderProfile(admin) {
    const usr = admin || state.admin || {};
    const isCeo = isUserCeo(usr);

    if (dashUserName) dashUserName.textContent = usr.fullName || usr.username || (isCeo ? 'Chief Executive Officer' : 'Field Engineer');
    if (dashUserRole) dashUserRole.textContent = isCeo ? 'Chief Executive Officer' : 'Operations & Field Staff';
    if (dashPortalModeLabel) dashPortalModeLabel.textContent = isCeo ? 'CHIEF EXECUTIVE SUITE · DUBAI HQ' : 'STAFF & OPERATIONS PORTAL';
    if (userAvatarInitials) {
      const name = usr.fullName || usr.username || (isCeo ? 'CEO' : 'ST');
      userAvatarInitials.textContent = name.slice(0, 2).toUpperCase();
    }

    // Toggle CEO-only elements
    document.querySelectorAll('.ceo-only-el').forEach(el => {
      el.style.display = isCeo ? '' : 'none';
    });
    if (tabBtnEmployees) {
      if (isCeo) {
        tabBtnEmployees.classList.remove('is-hidden');
        tabBtnEmployees.style.removeProperty('display');
        tabBtnEmployees.style.display = 'flex';
      } else {
        tabBtnEmployees.classList.add('is-hidden');
        tabBtnEmployees.style.setProperty('display', 'none', 'important');
      }
    }
  }

  function showDashboardView() {
    document.documentElement.classList.add('is-authenticated');
    document.body.classList.add('is-authenticated');
    if (loginView) loginView.style.display = 'none';
    if (dashboardView) {
      dashboardView.style.removeProperty('display');
      dashboardView.style.display = 'flex';
    }

    updateHeaderProfile(state.admin);

    const isCeo = isUserCeo(state.admin);

    // Load initial data
    populateCategoryDropdown();
    loadDashboardStats();
    loadInquiries();
    loadProducts();
    loadInvoices();
    if (isCeo) {
      loadEmployees();
    }

    // Resolve initial active tab from current URL (e.g. /products, /inquiries, /invoices, /employees)
    let initialTab = getTabFromUrl();
    if (initialTab === 'employees' && !isCeo) {
      initialTab = 'inquiries';
    }
    switchTab(initialTab, false);

    // If loaded on root or index.html, update address bar cleanly to the current tab
    if (window.history && window.history.replaceState) {
      const curPath = (window.location.pathname || '').replace(/\/$/, '');
      if (curPath === '' || curPath === '/' || curPath.endsWith('/index.html') || curPath.endsWith('/index.php')) {
        window.history.replaceState({ tab: initialTab }, '', getTargetPath(initialTab));
      }
    }
  }

  // ============================================================
  // STATS LOADER (4 Core Clean Metrics)
  // ============================================================
  function updateNavBadge(badgeEl, count) {
    if (!badgeEl) return;
    const num = parseInt(count, 10) || 0;
    badgeEl.textContent = num;
    badgeEl.setAttribute('data-count', num);
    if (num <= 0) {
      badgeEl.style.display = 'none';
    } else {
      badgeEl.style.display = 'flex';
    }
  }

  async function loadDashboardStats() {
    try {
      const res = await fetch(ENDPOINTS.stats, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        const stats = data.stats || {};

        // 1. Total Inquiries
        const inqCount = stats.total !== undefined ? stats.total : (state.inquiries ? state.inquiries.length : 0);
        if (statInquiries) statInquiries.textContent = inqCount;
        updateNavBadge(badgeInquiries, inqCount);

        // 2. Total Products
        const prodCount = stats.products !== undefined ? stats.products : (state.products ? state.products.length : 0);
        if (statProducts) statProducts.textContent = prodCount;
        updateNavBadge(badgeProducts, prodCount);

        // 3. Quotes Generated
        const invCount = stats.invoices !== undefined ? stats.invoices : (state.invoices ? state.invoices.length : 0);
        if (statInvoices) statInvoices.textContent = invCount;
        updateNavBadge(badgeInvoices, invCount);

        // 4. Employees Total (CEO)
        const empCount = stats.employees !== undefined ? stats.employees : (state.employees ? state.employees.length : 0);
        if (statEmployees) statEmployees.textContent = empCount;
        updateNavBadge(badgeEmployees, empCount);
      }
    } catch (err) {
      console.error('Stats load error:', err);
    }
  }

  // ============================================================
  // 1. INQUIRIES MANAGEMENT
  // ============================================================
  async function loadInquiries() {
    const status = inquiryFilter ? inquiryFilter.value : 'all';
    const search = inquirySearch ? inquirySearch.value.trim() : '';

    if (inquiriesTableBody) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading client inquiries...</td></tr>`;
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
        updateNavBadge(badgeInquiries, state.inquiries.length);
        if (statInquiries) statInquiries.textContent = state.inquiries.length;
        renderInquiriesTable(data.inquiries);
      } else {
        inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
      }
    } catch (err) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to reach inquiries service.</td></tr>`;
    }
  }

  function renderInquiriesTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No client inquiries received yet. Submissions from the website consultation form will appear here in real-time.</td></tr>`;
      return;
    }

    inquiriesTableBody.innerHTML = inquiries.map((inq) => {
      const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const statusClass = inq.status || 'new';
      const statusLabel = (inq.status || 'new').replace('_', ' ');

      return `
        <tr data-id="${inq.id}">
          <td class="client-name-cell col-client">
            <strong style="color:var(--text-pure); display:block; line-height:1.3;">${escapeHtml(inq.client_name)}</strong>
          </td>
          <td class="hide-on-mobile">
            <a href="mailto:${escapeHtml(inq.email)}" class="contact-link">${escapeHtml(inq.email)}</a>
            ${inq.phone ? `<br><a href="tel:${escapeHtml(inq.phone)}" class="contact-link text-muted font-mono" style="font-size:0.75rem;">${escapeHtml(inq.phone)}</a>` : ''}
          </td>
          <td class="hide-on-mobile">
            <span class="sector-tag">${escapeHtml(inq.sector || 'Commercial')}</span>
            ${inq.venue_type ? `<br><span class="text-muted" style="font-size:0.75rem;">${escapeHtml(inq.venue_type)}</span>` : ''}
          </td>
          <td class="hide-on-mobile">
            <span class="font-mono text-accent" style="font-size:0.85rem;">${escapeHtml(inq.estimated_budget || 'TBD')}</span>
          </td>
          <td class="hide-on-mobile">
            <span class="status-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
          </td>
          <td class="date-cell col-date">${dateStr}</td>
          <td class="col-action" style="text-align: right;">
            <button type="button" class="btn-table-action" onclick="window.malasOpenInquiry(${inq.id})">
              View &rarr;
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.malasOpenInquiry = function (id) {
    const inq = state.inquiries.find(item => item.id === id);
    if (!inq) return;

    state.selectedInquiry = inq;
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const statusClass = inq.status || 'new';
    const statusLabel = (inq.status || 'new').replace('_', ' ').toUpperCase();

    // Populate Dedicated Full Subpage
    if (inqPageTag) inqPageTag.textContent = `INQUIRY REF #${inq.id}`;
    if (inqPageClientName) inqPageClientName.textContent = inq.client_name;
    if (inqPageDate) inqPageDate.textContent = `Received: ${dateStr}`;

    if (inquiryDetailStatusPill) {
      inquiryDetailStatusPill.className = `status-pill ${statusClass}`;
      inquiryDetailStatusPill.textContent = statusLabel;
    }

    if (inqPageContactName) inqPageContactName.textContent = inq.client_name;
    if (inqPageEmail) {
      inqPageEmail.textContent = inq.email;
      inqPageEmail.href = `mailto:${inq.email}`;
    }
    if (inqPagePhone) {
      inqPagePhone.textContent = inq.phone || 'No direct phone provided';
      inqPagePhone.href = inq.phone ? `tel:${inq.phone.replace(/\s+/g, '')}` : '#';
    }
    if (inqPageSector) inqPageSector.textContent = inq.sector || 'Commercial';
    if (inqPageVenue) inqPageVenue.textContent = inq.venue_type || 'Unspecified';
    if (inqPageBudget) inqPageBudget.textContent = inq.estimated_budget || 'Unspecified';
    if (inqPageTimeline) inqPageTimeline.textContent = inq.timeline || 'Flexible';
    if (inqPageScope) inqPageScope.textContent = inq.scope_notes || 'No additional scope notes provided by client.';
    if (inqPageStatusSelect) inqPageStatusSelect.value = inq.status || 'new';

    if (inqPageCallBtn) {
      inqPageCallBtn.href = inq.phone ? `tel:${inq.phone.replace(/\s+/g, '')}` : '#';
      inqPageCallBtn.style.display = inq.phone ? 'inline-flex' : 'none';
    }
    if (inqPageMailBtn) {
      inqPageMailBtn.href = `mailto:${inq.email}?subject=Malas%20Electronics%20AV%20Consultation%20(Ref%20%23${inq.id})&body=Dear%20${encodeURIComponent(inq.client_name)},%0A%0AThank%20you%20for%20contacting%20Malas%20Electronics%20regarding%20your%20audiovisual%20requirements.`;
    }

    // Switch View to the dedicated full page view
    tabPanels.forEach(panel => {
      panel.style.display = 'none';
      panel.classList.remove('active');
    });

    if (tabInquiryDetail) {
      tabInquiryDetail.style.display = 'block';
      tabInquiryDetail.classList.add('active');
    }
    if (pageCurrentTitle) {
      pageCurrentTitle.textContent = `Inquiry Details · Ref #${inq.id}`;
    }

    const mainScroll = document.querySelector('.dash-main-scroll');
    if (mainScroll) mainScroll.scrollTop = 0;
  };

  async function handleSaveInquiryPageStatus() {
    if (!state.selectedInquiry) return;
    const newStatus = inqPageStatusSelect ? inqPageStatusSelect.value : 'new';
    const id = state.selectedInquiry.id;

    if (inqPageSaveStatusBtn) {
      inqPageSaveStatusBtn.disabled = true;
      inqPageSaveStatusBtn.textContent = 'Saving...';
    }

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
        if (inquiryDetailStatusPill) {
          inquiryDetailStatusPill.className = `status-pill ${newStatus}`;
          inquiryDetailStatusPill.textContent = newStatus.replace('_', ' ').toUpperCase();
        }
        loadInquiries();
        loadDashboardStats();
        showToast(`Inquiry status updated to ${newStatus.replace('_', ' ')}.`, 'success', 'Status Saved');
      } else {
        showToast(data.error || 'Could not update status', 'error');
      }
    } catch (err) {
      showToast('Communication error updating inquiry status.', 'error');
    } finally {
      if (inqPageSaveStatusBtn) {
        inqPageSaveStatusBtn.disabled = false;
        inqPageSaveStatusBtn.textContent = 'Save Status';
      }
    }
  }

  async function handleDeleteInquiryPage() {
    if (!state.selectedInquiry) return;
    const id = state.selectedInquiry.id;
    const name = state.selectedInquiry.client_name || `Inquiry #${id}`;
    const ok = await showConfirmModal({
      title: `Are you sure you want to delete this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.inquiryDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Inquiry #${id} deleted successfully.`, 'success', 'Inquiry Removed');
        switchTab('inquiries');
        loadInquiries();
        loadDashboardStats();
      } else {
        showToast(data.error || 'Could not delete inquiry', 'error');
      }
    } catch (err) {
      showToast('Communication error deleting inquiry.', 'error');
    }
  }

  function closeInquiryModal() {
    if (detailModal) detailModal.style.display = 'none';
    state.selectedInquiry = null;
  }

  async function handleSaveInquiryStatus() {
    if (!state.selectedInquiry) return;
    const newStatus = modalStatusSelect ? modalStatusSelect.value : 'new';
    const id = state.selectedInquiry.id;

    if (saveStatusBtn) {
      saveStatusBtn.disabled = true;
      saveStatusBtn.textContent = 'Saving...';
    }

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
        closeInquiryModal();
        loadInquiries();
        loadDashboardStats();
        showToast(`Inquiry status updated to ${newStatus.replace('_', ' ')}.`, 'success', 'Status Saved');
      } else {
        showToast(data.error || 'Could not update status', 'error');
      }
    } catch (err) {
      showToast('Communication error updating inquiry status.', 'error');
    } finally {
      if (saveStatusBtn) {
        saveStatusBtn.disabled = false;
        saveStatusBtn.textContent = 'Save Status';
      }
    }
  }

  async function handleDeleteInquiry() {
    if (!state.selectedInquiry) return;
    const id = state.selectedInquiry.id;
    const name = state.selectedInquiry.client_name || `Inquiry #${id}`;
    const ok = await showConfirmModal({
      title: `Are you sure you want to delete this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.inquiryDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Inquiry #${id} deleted successfully.`, 'success', 'Inquiry Removed');
        closeInquiryModal();
        loadInquiries();
        loadDashboardStats();
      } else {
        showToast(data.error || 'Could not delete inquiry', 'error');
      }
    } catch (err) {
      showToast('Communication error deleting inquiry.', 'error');
    }
  }

  // ============================================================
  // 2. HARDWARE PRODUCTS CATALOG & INVENTORY
  // ============================================================
  async function loadProducts() {
    if (productsGrid) {
      productsGrid.innerHTML = `<div class="empty-state">Loading hardware catalog...</div>`;
    }

    try {
      const res = await fetch(ENDPOINTS.products(), {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        state.products = data.products || [];
        updateNavBadge(badgeProducts, state.products.length);
        if (statProducts) statProducts.textContent = state.products.length;
        renderProductsGrid(state.products);
      } else {
        productsGrid.innerHTML = `<div class="empty-state" style="color:var(--status-red);">${data.error}</div>`;
      }
    } catch (err) {
      productsGrid.innerHTML = `<div class="empty-state">Failed to load hardware catalog.</div>`;
    }
  }

  function filterProductsLocal() {
    const term = (productSearch ? productSearch.value : '').toLowerCase().trim();
    const stockFilter = (productStockFilter ? productStockFilter.value : 'all');
    const sortBy = (productSortSelect ? productSortSelect.value : 'newest');

    let filtered = state.products;

    if (term) {
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.tagline && p.tagline.toLowerCase().includes(term))
      );
    }

    if (stockFilter === 'in_stock') {
      filtered = filtered.filter(p => parseInt(p.stock || 0, 10) > 5);
    } else if (stockFilter === 'low_stock') {
      filtered = filtered.filter(p => {
        const s = parseInt(p.stock || 0, 10);
        return s >= 1 && s <= 5;
      });
    } else if (stockFilter === 'out_of_stock') {
      filtered = filtered.filter(p => parseInt(p.stock || 0, 10) <= 0);
    }

    // Apply Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'price_asc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === 'price_desc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      if (sortBy === 'stock_desc') return (parseInt(b.stock, 10) || 0) - (parseInt(a.stock, 10) || 0);
      if (sortBy === 'stock_asc') return (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0);
      return (b.id || 0) - (a.id || 0); // Default newest
    });

    renderProductsGrid(filtered);
  }

  function renderProductsGrid(products) {
    if (!productsGrid) return;

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 12px; opacity: 0.7;">📦</div>
          <h4 style="color: #F8FAFC; margin-bottom: 6px; font-size: 1.15rem;">No Hardware Products Found</h4>
          <p style="color: #94A3B8; font-size: 0.86rem; max-width: 440px; margin: 0 auto 20px;">
            No items match your active search or stock criteria. Click below to add new equipment to the catalog.
          </p>
          <button type="button" class="btn-primary-action btn-sm" onclick="window.malasOpenAddProductModal()" style="margin: 0 auto;">
            + Add First Hardware Item
          </button>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = products.map(p => {
      const priceFormatted = parseFloat(p.price || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const stock = parseInt(p.stock !== undefined && p.stock !== null ? p.stock : 0, 10);
      const isOutOfStock = stock <= 0;
      const stockBadgeClass = isOutOfStock ? 'stock-badge-out' : (stock <= 5 ? 'stock-badge-low' : 'stock-badge-ok');
      const stockLabel = isOutOfStock ? 'Out of stocks' : (stock <= 5 ? `Low stocks (${stock})` : `${stock} in stocks`);
      const hasImage = Boolean(p.image_url && p.image_url.trim());

      return `
        <div class="product-card product-card-immersive" data-id="${p.id}">
          <div class="product-immersive-media">
            ${hasImage ? `
              <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" class="product-immersive-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
            ` : ''}
            <div class="product-placeholder-icon-wrap" style="${hasImage ? 'display:none;' : 'display:flex;'}">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span class="product-placeholder-label">Hardware Item</span>
            </div>
          </div>

          <div class="product-top-bar">
            <span class="product-stock-pill ${stockBadgeClass}" onclick="window.malasOpenStockModal(${p.id})" title="Click to adjust inventory stock" style="cursor: pointer;">
              <span class="stock-dot"></span>
              ${stockLabel}
            </span>
          </div>

          <div class="product-immersive-overlay">
            <div class="product-immersive-meta">
              <h3 class="product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
              ${p.tagline ? `<p class="product-tagline" title="${escapeHtml(p.tagline)}">${escapeHtml(p.tagline)}</p>` : ''}
            </div>

            <div class="product-price-display">
              <span class="product-price-val font-mono"><small>AED</small> ${priceFormatted}</span>
            </div>

            <div class="product-card-footer">
              <button type="button" class="btn-product-edit" onclick="window.malasEditProduct(${p.id})" title="Edit Product Specs & Price">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn-product-delete" onclick="window.malasDeleteProduct(${p.id}, '${escapeHtml(p.name)}')" title="Delete Product">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.malasOpenAddProductModal = function () {
    openProductModal(null);
  };

  function openProductModal(prod = null) {
    if (productForm) productForm.reset();
    resetDropzoneToEmpty();
    if (directUrlInputContainer) directUrlInputContainer.style.display = 'none';
    if (btnToggleUrlInput) btnToggleUrlInput.textContent = '🔗 Or paste an existing image URL';

    if (prod) {
      if (productModalTitle) productModalTitle.textContent = 'Edit Hardware Product';
      if (productIdInput) productIdInput.value = prod.id;
      if (productNameInput) productNameInput.value = prod.name || '';
      if (productTaglineInput) productTaglineInput.value = prod.tagline || '';
      if (productPriceInput) productPriceInput.value = (prod.price !== undefined && prod.price !== null && prod.price > 0) ? prod.price : '';
      if (productStockInput) productStockInput.value = prod.stock !== undefined ? prod.stock : 10;
      
      if (prod.image_url) {
        setDropzonePreview(prod.image_url);
      }

      if (deleteModalProductBtn) deleteModalProductBtn.style.display = 'inline-block';
    } else {
      if (productModalTitle) productModalTitle.textContent = 'Add Hardware Product';
      if (productIdInput) productIdInput.value = '';
      if (productNameInput) productNameInput.value = '';
      if (productTaglineInput) productTaglineInput.value = '';
      if (productPriceInput) productPriceInput.value = '';
      if (productStockInput) productStockInput.value = '10';

      if (deleteModalProductBtn) deleteModalProductBtn.style.display = 'none';
    }

    if (productModal) productModal.style.display = 'flex';
  }

  window.malasEditProduct = function (id) {
    const prod = state.products.find(p => p.id === id);
    if (prod) openProductModal(prod);
  };

  function closeProductModal() {
    if (productModal) productModal.style.display = 'none';
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    const id = productIdInput ? productIdInput.value : '';
    const isEdit = Boolean(id);

    const payload = {
      name: productNameInput.value.trim(),
      tagline: productTaglineInput ? productTaglineInput.value.trim() : '',
      price: (productPriceInput && productPriceInput.value.trim() !== '') ? parseFloat(productPriceInput.value) : 0,
      stock: parseInt(productStockInput.value, 10) || 0,
      image_url: productImageInput ? productImageInput.value.trim() : '',
      status: 'active'
    };

    if (!payload.name) {
      showToast('Product Name is required.', 'warning');
      return;
    }

    const endpoint = isEdit ? ENDPOINTS.productDetail(id) : ENDPOINTS.products();
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method: method,
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
        loadDashboardStats();
        showToast(`Product "${payload.name}" saved successfully.`, 'success', 'Catalog Updated');
      } else {
        showToast(data.error || 'Could not save product', 'error');
      }
    } catch (err) {
      showToast('Communication error saving product.', 'error');
    }
  }

  window.malasDeleteProduct = async function (id, name = 'this product') {
    const confirmed = await showConfirmModal({
      title: `Are you sure you want to delete this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await fetch(ENDPOINTS.productDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Product "${name}" deleted from catalog.`, 'success', 'Item Deleted');
        closeProductModal();
        loadProducts();
        loadDashboardStats();
      } else {
        showToast(data.error || 'Could not delete product', 'error');
      }
    } catch (err) {
      showToast('Communication error deleting product.', 'error');
    }
  };

  async function processImageUploadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF).', 'warning');
      return;
    }

    // Set uploading state UI
    if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
    if (dropzonePreviewState) dropzonePreviewState.style.display = 'none';
    if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'flex';

    if (saveProductBtn) {
      saveProductBtn.disabled = true;
      saveProductBtn.textContent = 'Uploading Image...';
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;

      try {
        const res = await fetch(ENDPOINTS.upload, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`
          },
          body: JSON.stringify({ image: base64Data })
        });
        const data = await res.json();

        if (data.success && data.url) {
          setDropzonePreview(data.url);
          showToast('Image uploaded successfully.', 'success', 'Image Uploaded');
        } else {
          console.warn('Upload notice:', data.error);
          setDropzonePreview(base64Data);
          showToast('Image attached.', 'info');
        }
      } catch (err) {
        console.warn('Network issue during upload, using local preview:', err);
        setDropzonePreview(base64Data);
      } finally {
        if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
        if (saveProductBtn) {
          saveProductBtn.disabled = false;
          saveProductBtn.textContent = 'Save Product';
        }
      }
    };

    reader.onerror = () => {
      resetDropzoneToEmpty();
      if (saveProductBtn) {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'Save Product';
      }
      showToast('Could not read the selected image file.', 'error');
    };

    reader.readAsDataURL(file);
  }

  function setDropzonePreview(url) {
    if (productImageInput) productImageInput.value = url;
    if (productImageNewUrlInput) productImageNewUrlInput.value = url.startsWith('data:') ? '' : url;
    if (cloudinaryImgPreview) cloudinaryImgPreview.src = url;

    if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
    if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
    if (dropzonePreviewState) dropzonePreviewState.style.display = 'flex';
  }

  function resetDropzoneToEmpty() {
    if (productImageInput) productImageInput.value = '';
    if (productImageNewUrlInput) productImageNewUrlInput.value = '';
    if (cloudinaryFileInput) cloudinaryFileInput.value = '';
    if (cloudinaryImgPreview) cloudinaryImgPreview.src = '';

    if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
    if (dropzonePreviewState) dropzonePreviewState.style.display = 'none';
    if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'flex';
  }


  // Quick Stock Adjustment
  window.malasOpenStockModal = function (id) {
    const prod = state.products.find(p => p.id === id);
    if (!prod) return;

    stockAdjustProductId.value = prod.id;
    stockAdjustProductName.textContent = prod.name;
    stockAdjustSku.textContent = prod.model_number || 'No SKU';
    stockAdjustQty.value = prod.stock !== undefined ? prod.stock : 0;
    stockModal.style.display = 'flex';
  };

  function closeStockModal() {
    stockModal.style.display = 'none';
  }

  async function handleSaveQuickStock(e) {
    e.preventDefault();
    const id = stockAdjustProductId.value;
    const stock = parseInt(stockAdjustQty.value, 10);

    try {
      const res = await fetch(ENDPOINTS.productStock(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ stock: stock })
      });
      const data = await res.json();

      if (data.success) {
        closeStockModal();
        loadProducts();
        showToast(`Stock updated to ${stock} units.`, 'success', 'Inventory Adjusted');
      } else {
        showToast(data.error || 'Could not update inventory stock', 'error');
      }
    } catch (err) {
      showToast('Communication error updating stock.', 'error');
    }
  }

  // ============================================================
  // 3. INVOICE CART & QUOTATIONS WORKFLOW
  // ============================================================
  window.malasAddToCart = function (productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    const availableStock = prod.stock !== undefined && prod.stock !== null ? parseInt(prod.stock, 10) : 0;
    if (availableStock <= 0) {
      showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
      return;
    }

    const existing = state.cart.find(item => item.id === prod.id);
    if (existing) {
      if (existing.quantity >= availableStock) {
        showToast(`Cannot add more units. Available inventory for "${prod.name}" is ${availableStock}.`, 'warning', 'Stock Limit');
        return;
      }
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: prod.id,
        name: prod.name,
        model_number: prod.model_number || '',
        price: parseFloat(prod.price) || 0,
        stock: availableStock,
        quantity: 1,
        image_url: prod.image_url || ''
      });
    }

    updateCartBadge();
    openCartModal();
  };

  function updateCartBadge() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartItemCount) cartItemCount.textContent = totalItems;
  }

  function openCartModal() {
    clearInvoiceProductSelection();
    renderCart();
    invoiceCartModal.style.display = 'flex';
  }

  function closeCartModal() {
    closeInvoiceSearchDropdown();
    invoiceCartModal.style.display = 'none';
  }

  function closeInvoiceSearchDropdown() {
    const dropdown = invoiceSearchResultsDropdown || document.getElementById('invoice-search-results-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }

  function clearInvoiceProductSelection() {
    const input = invoiceProductSearchInput || document.getElementById('invoice-product-search-input');
    const hiddenVal = invoiceProductPickerVal || document.getElementById('invoice-product-picker-val');
    const clearBtn = invoiceSearchClearBtn || document.getElementById('invoice-search-clear-btn');
    if (input) input.value = '';
    if (hiddenVal) hiddenVal.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    closeInvoiceSearchDropdown();
  }

  function selectProductForInvoice(prod) {
    if (!prod) return;
    const availableStock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
    if (availableStock <= 0) {
      showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
      return;
    }

    const input = invoiceProductSearchInput || document.getElementById('invoice-product-search-input');
    const hiddenVal = invoiceProductPickerVal || document.getElementById('invoice-product-picker-val');
    const clearBtn = invoiceSearchClearBtn || document.getElementById('invoice-search-clear-btn');
    const qtyInput = invoicePickerQty || document.getElementById('invoice-picker-qty');

    if (hiddenVal) hiddenVal.value = prod.id;
    if (input) input.value = prod.name;
    if (clearBtn) clearBtn.style.display = 'block';
    closeInvoiceSearchDropdown();

    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }

  window.malasSelectInvoiceProduct = function (productId) {
    const prod = state.products.find(p => p.id === productId);
    if (prod) selectProductForInvoice(prod);
  };

  function filterAndRenderInvoiceSearchResults(query = '') {
    const dropdown = invoiceSearchResultsDropdown || document.getElementById('invoice-search-results-dropdown');
    if (!dropdown) return;

    const term = (query || '').toLowerCase().trim();
    let matches = state.products || [];

    if (term) {
      matches = matches.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.model_number && p.model_number.toLowerCase().includes(term)) ||
        (p.tagline && p.tagline.toLowerCase().includes(term)) ||
        (p.category_name && p.category_name.toLowerCase().includes(term))
      );
    }

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="invoice-search-empty">No equipment matches "${escapeHtml(term || '')}"</div>`;
      dropdown.style.display = 'block';
      return;
    }

    // Sort: in-stock first, then alphabetically
    const sorted = [...matches].sort((a, b) => {
      const stockA = parseInt(a.stock || 0, 10);
      const stockB = parseInt(b.stock || 0, 10);
      if (stockA <= 0 && stockB > 0) return 1;
      if (stockA > 0 && stockB <= 0) return -1;
      return (a.name || '').localeCompare(b.name || '');
    });

    dropdown.innerHTML = sorted.map((prod, idx) => {
      const stock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
      const price = parseFloat(prod.price || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const isOut = stock <= 0;
      const isLow = stock > 0 && stock <= 5;
      const stockClass = isOut ? 'stock-out' : (isLow ? 'stock-low' : 'stock-ok');
      const stockLabel = isOut ? 'Out of stock' : (isLow ? `${stock} left (Low)` : `${stock} available`);

      const thumb = prod.image_url && prod.image_url.trim()
        ? `<img src="${escapeHtml(prod.image_url)}" class="invoice-search-item-thumb" alt="${escapeHtml(prod.name)}">`
        : `<div class="invoice-search-item-thumb">📦</div>`;

      return `
        <div class="invoice-search-item ${isOut ? 'item-out-of-stock' : ''}" 
             data-product-id="${prod.id}" 
             data-index="${idx}"
             onclick="window.malasSelectInvoiceProduct(${prod.id})">
          <div class="invoice-search-item-left">
            ${thumb}
            <div class="invoice-search-item-info">
              <span class="invoice-search-item-name">${escapeHtml(prod.name)}</span>
              <span class="invoice-search-item-model">${escapeHtml(prod.model_number || 'AV Hardware')}</span>
            </div>
          </div>
          <div class="invoice-search-item-right">
            <span class="invoice-search-item-price">AED ${price}</span>
            <span class="invoice-search-item-stock ${stockClass}">${stockLabel}</span>
          </div>
        </div>
      `;
    }).join('');

    dropdown.style.display = 'block';
  }

  function handleAddProductToInvoice() {
    const hiddenVal = invoiceProductPickerVal || document.getElementById('invoice-product-picker-val');
    const searchInput = invoiceProductSearchInput || document.getElementById('invoice-product-search-input');
    const qtyInput = invoicePickerQty || document.getElementById('invoice-picker-qty');

    let productId = parseInt(hiddenVal ? hiddenVal.value : 0, 10);

    // If no ID is explicitly selected from dropdown, check what the user typed in search input
    if (!productId && searchInput && searchInput.value.trim()) {
      const term = searchInput.value.trim().toLowerCase();
      // Try exact name match
      let matched = state.products.find(p => p.name && p.name.toLowerCase() === term);
      // If no exact match, find first available in-stock item matching query
      if (!matched) {
        matched = state.products.find(p =>
          parseInt(p.stock || 0, 10) > 0 &&
          ((p.name && p.name.toLowerCase().includes(term)) ||
           (p.model_number && p.model_number.toLowerCase().includes(term)))
        );
      }
      if (matched) {
        productId = matched.id;
      }
    }

    if (!productId) {
      showToast('Please search and select a hardware product first.', 'warning', 'No Product Selected');
      if (searchInput) {
        searchInput.focus();
        filterAndRenderInvoiceSearchResults(searchInput.value);
      }
      return;
    }

    const prod = state.products.find(p => p.id === productId);
    if (!prod) {
      showToast('Product not found in active catalog.', 'error');
      return;
    }

    const availableStock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
    if (availableStock <= 0) {
      showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
      return;
    }

    const qtyToAdd = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
    const existing = state.cart.find(item => item.id === prod.id);

    if (existing) {
      if (existing.quantity + qtyToAdd > availableStock) {
        showToast(`Cannot add ${qtyToAdd} more units. Invoice already has ${existing.quantity}, max available is ${availableStock}.`, 'warning', 'Stock Limit');
        return;
      }
      existing.quantity += qtyToAdd;
      showToast(`Updated "${prod.name}" quantity to ${existing.quantity}.`, 'success', 'Product Updated');
    } else {
      if (qtyToAdd > availableStock) {
        showToast(`Requested quantity (${qtyToAdd}) exceeds available stock (${availableStock}).`, 'warning', 'Stock Limit');
        return;
      }
      state.cart.push({
        id: prod.id,
        name: prod.name,
        model_number: prod.model_number || '',
        price: parseFloat(prod.price) || 0,
        stock: availableStock,
        quantity: qtyToAdd,
        image_url: prod.image_url || ''
      });
      showToast(`Added ${qtyToAdd}x "${prod.name}" to invoice.`, 'success', 'Product Added');
    }

    // Reset picker inputs
    clearInvoiceProductSelection();
    if (qtyInput) qtyInput.value = '1';

    updateCartBadge();
    renderCart();
  }

  function renderCart() {
    if (cartItemDistinctCount) cartItemDistinctCount.textContent = state.cart.length;

    const tbody = cartItemsTbody || document.getElementById('cart-table-body') || document.getElementById('cart-items-tbody');
    if (!tbody) return;

    if (state.cart.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No products added to invoice yet. Select a product above to add to this invoice.</td></tr>`;
      updateCartSummary();
      return;
    }

    tbody.innerHTML = state.cart.map((item, index) => {
      const lineTotal = item.price * item.quantity;
      return `
        <tr>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            ${item.model_number ? `<br><span class="font-mono text-muted" style="font-size:0.75rem;">${escapeHtml(item.model_number)}</span>` : ''}
          </td>
          <td class="font-mono" style="text-align: right;">
            AED ${item.price.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </td>
          <td style="text-align: center;">
            <div class="cart-qty-controls">
              <button type="button" class="btn-qty" onclick="window.malasChangeCartQty(${index}, -1)">-</button>
              <span class="font-mono" style="min-width:24px; display:inline-block; font-weight:700;">${item.quantity}</span>
              <button type="button" class="btn-qty" onclick="window.malasChangeCartQty(${index}, 1)">+</button>
            </div>
          </td>
          <td class="font-mono text-accent" style="text-align: right; font-weight:700;">
            AED ${lineTotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn-remove-cart" onclick="window.malasRemoveFromCart(${index})" title="Remove item">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    updateCartSummary();
  }

  window.malasChangeCartQty = function (index, delta) {
    const item = state.cart[index];
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      state.cart.splice(index, 1);
    } else if (newQty > item.stock) {
      showToast(`Cannot add more than ${item.stock} available units.`, 'warning', 'Stock Limit');
      return;
    } else {
      item.quantity = newQty;
    }

    updateCartBadge();
    renderCart();
  };

  window.malasRemoveFromCart = function (index) {
    state.cart.splice(index, 1);
    updateCartBadge();
    renderCart();
  };

  function updateCartSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(cartDiscountInput ? cartDiscountInput.value : 0) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const vat = taxable * 0.05;
    const total = taxable + vat;

    if (summarySubtotal) summarySubtotal.textContent = `AED ${subtotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (summaryDiscount) summaryDiscount.textContent = `- AED ${discount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (summaryVat) summaryVat.textContent = `AED ${vat.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (summaryGrandTotal) summaryGrandTotal.textContent = `AED ${total.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  }

  async function handleFinalizeInvoice(e) {
    e.preventDefault();

    if (state.cart.length === 0) {
      showToast('Please select at least one hardware product for the invoice.', 'warning');
      return;
    }

    const clientName = cartClientName.value.trim();
    if (!clientName) {
      showToast('Client Name is required.', 'warning');
      return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(cartDiscountInput ? cartDiscountInput.value : 0) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const vatAmount = taxable * 0.05;
    const totalAmount = taxable + vatAmount;

    const invoicePayload = {
      client_name: clientName,
      client_email: cartClientEmail ? cartClientEmail.value.trim() : '',
      client_phone: cartClientPhone ? cartClientPhone.value.trim() : '',
      project_name: (cartProjectName && cartProjectName.value ? cartProjectName.value.trim() : '') || 'Commercial AV Procurement',
      items: state.cart,
      subtotal: subtotal,
      vat_rate: 5.0,
      vat_amount: vatAmount,
      discount: discount,
      total_amount: totalAmount
    };

    const isEditing = Boolean(state.editingInvoiceId);
    const targetUrl = isEditing ? ENDPOINTS.invoiceDetail(state.editingInvoiceId) : ENDPOINTS.invoices();
    const httpMethod = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(targetUrl, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify(invoicePayload)
      });
      const data = await res.json();

      if (data.success) {
        state.cart = [];
        updateCartBadge();
        closeCartModal();
        finalizeInvoiceForm.reset();
        resetInvoiceModalMode();

        // Refresh live stats & products inventory
        loadDashboardStats();
        loadProducts();
        loadInvoices();

        const toastMsg = isEditing ? 'Invoice successfully updated.' : 'Official quotation invoice generated and stored.';
        showToast(toastMsg, 'success', isEditing ? 'Invoice Saved' : 'Invoice Finalized');

        // Open newly created or updated invoice for inspection
        if (data.invoice) {
          openInvoiceViewModal(data.invoice);
        } else {
          switchTab('invoices');
        }
      } else {
        showToast(data.error || 'Could not process invoice', 'error');
      }
    } catch (err) {
      showToast('Communication error processing invoice.', 'error');
    }
  }

  // ============================================================
  // 4. INVOICES LIST & EXPORT ENGINE
  // ============================================================
  async function loadInvoices() {
    if (!invoicesTableBody) return;

    const search = invoiceSearch ? invoiceSearch.value.trim() : '';

    invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading quotations and invoices...</td></tr>`;

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(ENDPOINTS.invoices(params.toString()), {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        state.invoices = data.invoices || [];
        updateNavBadge(badgeInvoices, state.invoices.length);
        if (statInvoices) statInvoices.textContent = state.invoices.length;
        renderInvoicesTable(state.invoices);
      } else {
        invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">${data.error}</td></tr>`;
      }
    } catch (err) {
      invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load invoices.</td></tr>`;
    }
  }

  function resetInvoiceModalMode() {
    state.editingInvoiceId = null;
    state.editingInvoiceNumber = null;
    const modalTitle = document.getElementById('invoice-modal-title');
    if (modalTitle) modalTitle.textContent = 'Create Commercial Invoice';
    const btnText = document.getElementById('finalize-btn-text');
    if (btnText) btnText.textContent = 'Finalize & Issue Invoice';
  }

  function renderInvoicesTable(invoices) {
    if (!invoices || invoices.length === 0) {
      invoicesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No quotations or invoices generated yet. Click "Create Invoice" above to issue one.</td></tr>`;
      return;
    }

    invoicesTableBody.innerHTML = invoices.map(inv => {
      const dateStr = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const totalFormatted = parseFloat(inv.total_amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 });
      const clientName = inv.client_name || 'Valued Client';
      const projName = inv.project_name || 'Bespoke AV Installation';
      const invNum = inv.invoice_number || `INV-${inv.id}`;

      return `
        <tr data-id="${inv.id}" class="invoice-row-card">
          <td class="col-inv-client">
            <strong class="inv-client-heading">${escapeHtml(clientName)}</strong>
          </td>
          <td class="col-inv-date date-cell">${dateStr}</td>
          <td class="col-inv-num font-mono text-accent font-bold">${escapeHtml(invNum)}</td>
          <td class="col-inv-proj text-muted">${escapeHtml(projName)}</td>
          <td class="col-inv-total font-mono font-bold">AED ${totalFormatted}</td>
          <td class="col-inv-action">
            <div class="inv-action-btn-group">
              <button type="button" class="btn-edit-inv" onclick="window.malasEditInvoice(${inv.id})">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn-view-inv" onclick="window.malasViewInvoice(${inv.id})">
                <span>View</span>
                <span class="action-arr">&rarr;</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.malasEditInvoice = function (id) {
    const inv = state.invoices.find(item => item.id === id);
    if (!inv) return;

    state.editingInvoiceId = inv.id;
    state.editingInvoiceNumber = inv.invoice_number;

    let items = [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); } catch (e) {}
    } else if (Array.isArray(inv.items)) {
      items = inv.items;
    }

    state.cart = items.map(it => {
      const prod = state.products.find(p => p.id === it.id);
      const stock = prod ? parseInt(prod.stock || 999, 10) : (it.stock || 999);
      return {
        id: it.id,
        name: it.name || 'Hardware Asset',
        model_number: it.model_number || '',
        price: parseFloat(it.price) || 0,
        stock: Math.max(stock, parseInt(it.quantity, 10) || 1),
        quantity: parseInt(it.quantity, 10) || 1,
        image_url: it.image_url || ''
      };
    });

    if (cartClientName) cartClientName.value = inv.client_name || '';
    if (cartClientEmail) cartClientEmail.value = inv.client_email || '';
    if (cartClientPhone) cartClientPhone.value = inv.client_phone || '';

    const modalTitle = document.getElementById('invoice-modal-title');
    if (modalTitle) modalTitle.textContent = `Edit Invoice (${inv.invoice_number})`;

    const btnText = document.getElementById('finalize-btn-text');
    if (btnText) btnText.textContent = 'Save & Update Invoice';

    if (invoiceViewModal) invoiceViewModal.style.display = 'none';

    updateCartBadge();
    openCartModal();
  };

  window.malasViewInvoice = function (id) {
    const inv = state.invoices.find(item => item.id === id);
    if (inv) openInvoiceViewModal(inv);
  };

  function openInvoiceViewModal(inv) {
    state.activeInvoiceForView = inv;

    if (viewModalNumber) viewModalNumber.textContent = 'TAX INVOICE';

    if (printInvNum) printInvNum.textContent = inv.invoice_number || '';
    if (printInvDate) printInvDate.textContent = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');
    if (printInvAuthor) printInvAuthor.textContent = inv.created_by || 'Operations Dispatch';

    if (printClientName) printClientName.textContent = inv.client_name || 'Valued Client';
    if (printClientEmail) printClientEmail.textContent = inv.client_email || '';
    if (printClientPhone) printClientPhone.textContent = inv.client_phone || '';
    if (printProjectName) printProjectName.textContent = inv.project_name || '';

    let items = [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); } catch (e) {}
    } else if (Array.isArray(inv.items)) {
      items = inv.items;
    }

    if (printItemsTbody) {
      printItemsTbody.innerHTML = items.map((item, idx) => {
        const unit = parseFloat(item.price || 0);
        const qty = parseInt(item.quantity || 1, 10);
        const line = unit * qty;
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>
              <strong>${escapeHtml(item.name || 'Hardware Asset')}</strong>
            </td>
            <td class="font-mono" style="text-align:right;">AED ${unit.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
            <td class="font-mono" style="text-align:center;">${qty}</td>
            <td class="font-mono" style="text-align:right; font-weight:700;">AED ${line.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }).join('');
    }

    const sub = parseFloat(inv.subtotal || 0);
    const disc = parseFloat(inv.discount || 0);
    const tax = Math.max(0, sub - disc);
    const vat = parseFloat(inv.vat_amount || 0);
    const tot = parseFloat(inv.total_amount || 0);

    if (printSubtotal) printSubtotal.textContent = `AED ${sub.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (printDiscount) printDiscount.textContent = `- AED ${disc.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (printTaxable) printTaxable.textContent = `AED ${tax.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (printVat) printVat.textContent = `AED ${vat.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
    if (printTotal) printTotal.textContent = `AED ${tot.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;

    invoiceViewModal.style.display = 'flex';
  }

  function closeInvoiceViewModal() {
    invoiceViewModal.style.display = 'none';
    state.activeInvoiceForView = null;
  }

  function handleExportExcel() {
    if (!state.activeInvoiceForView) return;
    const inv = state.activeInvoiceForView;

    let items = [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); } catch (e) {}
    } else if (Array.isArray(inv.items)) {
      items = inv.items;
    }

    const excelRows = [
      ['MALAS ELECTRONICS LLC — OFFICIAL COMMERCIAL QUOTATION'],
      ['Tax Registration No (TRN):', '100482910300003'],
      ['Invoice Number:', inv.invoice_number],
      ['Date:', inv.created_at || new Date().toISOString()],
      ['Client Name:', inv.client_name],
      ['Client Email:', inv.client_email || ''],
      ['Project:', inv.project_name || ''],
      [],
      ['#', 'Item Description', 'Unit Price (AED)', 'Quantity', 'Line Total (AED)']
    ];

    items.forEach((it, i) => {
      const u = parseFloat(it.price || 0);
      const q = parseInt(it.quantity || 1, 10);
      excelRows.push([i + 1, it.name, u, q, u * q]);
    });

    excelRows.push([]);
    excelRows.push(['', '', 'Subtotal:', parseFloat(inv.subtotal || 0)]);
    excelRows.push(['', '', 'Discount:', parseFloat(inv.discount || 0)]);
    excelRows.push(['', '', 'UAE VAT (5%):', parseFloat(inv.vat_amount || 0)]);
    excelRows.push(['', '', 'Grand Total (AED):', parseFloat(inv.total_amount || 0)]);

    if (window.XLSX) {
      const ws = window.XLSX.utils.aoa_to_sheet(excelRows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
      window.XLSX.writeFile(wb, `${inv.invoice_number}_Malas_Electronics.xlsx`);
    } else {
      showToast('Excel export engine is initializing. Please try again in a moment.', 'info');
    }
  }

  function handleExportPdf() {
    const element = document.getElementById('invoice-printable-template');
    if (!element) return;

    const invNum = state.activeInvoiceForView ? state.activeInvoiceForView.invoice_number : 'Invoice';

    if (window.html2pdf) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${invNum}_Malas_Electronics.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  }

  // ============================================================
  // PRODUCT CATEGORY SELECTOR HELPER
  // ============================================================
  async function populateCategoryDropdown() {
    if (!productCategorySelect && !productCategoryFilter) return;
    try {
      const res = await fetch(ENDPOINTS.categories, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success && data.categories) {
        state.categories = data.categories;
        if (productCategorySelect) {
          productCategorySelect.innerHTML = `<option value="">Select Category...</option>` +
            state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        }
        if (productCategoryFilter) {
          const curr = productCategoryFilter.value;
          productCategoryFilter.innerHTML = `<option value="all">All Categories</option>` +
            state.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
          productCategoryFilter.value = curr || 'all';
        }
      }
    } catch (err) {
      console.warn('Could not populate categories dropdown:', err);
    }
  }

  // ============================================================
  // 6. EMPLOYEES ROSTER & OPERATIONS STAFF (CEO ONLY)
  // ============================================================
  async function loadEmployees() {
    const isCeo = isUserCeo(state.admin);
    if (!isCeo) return;
    if (!employeesTableBody) return;

    employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading staff directory...</td></tr>`;

    try {
      const res = await fetch(ENDPOINTS.employees, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        // Strictly exclude CEO and Admins from the staff roster list
        state.employees = (data.employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');
        const empCount = state.employees.length;
        updateNavBadge(badgeEmployees, empCount);
        if (statEmployees) statEmployees.textContent = empCount;
        filterEmployeesLocal();
      } else {
        employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
      }
    } catch (err) {
      employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to reach employees service.</td></tr>`;
    }
  }

  function filterEmployeesLocal() {
    const query = (employeeSearch ? employeeSearch.value.trim().toLowerCase() : '');
    const status = (employeeStatusFilter ? employeeStatusFilter.value : 'all');

    let filtered = (state.employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');

    if (status !== 'all') {
      filtered = filtered.filter(emp => emp.status === status);
    }

    if (query) {
      filtered = filtered.filter(emp => {
        const name = (emp.full_name || '').toLowerCase();
        const email = (emp.email || '').toLowerCase();
        const username = (emp.username || '').toLowerCase();
        const role = (emp.role || '').toLowerCase();
        return name.includes(query) || email.includes(query) || username.includes(query) || role.includes(query);
      });
    }

    renderEmployeesTable(filtered);
  }

  function renderEmployeesTable(employees) {
    if (!employeesTableBody) return;

    // Filter out any CEO / admin accounts explicitly
    const list = (employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');

    if (list.length === 0) {
      employeesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No staff members found. Click "+ Onboard Employee" to add team credentials.</td></tr>`;
      return;
    }

    employeesTableBody.innerHTML = list.map(emp => {
      const lastActive = emp.last_login ? new Date(emp.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
      const isSuspended = emp.status === 'suspended';

      let roleLabel = 'Field Engineer';
      if (emp.role === 'technician') roleLabel = 'AV Systems Technician';
      else if (emp.role === 'specialist') roleLabel = 'Acoustics & Lighting Specialist';
      else if (emp.role === 'sales') roleLabel = 'Sales & Accounts Consultant';
      else if (emp.role === 'employee') roleLabel = 'Field Engineer';

      const initials = (emp.full_name || emp.username || 'ST').slice(0, 2).toUpperCase();

      return `
        <tr data-id="${emp.id}">
          <td class="client-name-cell col-emp-name">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="user-avatar" style="width:28px; height:28px; font-size:0.7rem; flex-shrink:0;">${escapeHtml(initials)}</span>
              <div style="min-width:0;">
                <strong style="color:var(--text-pure); display:block; line-height:1.2; word-break:break-word;">${escapeHtml(emp.full_name || emp.username)}</strong>
                ${isSuspended ? `<span class="status-pill archived" style="font-size:0.56rem; padding:1px 5px; margin-top:2px; display:inline-block;">BLOCKED</span>` : ''}
              </div>
            </div>
          </td>
          <td class="hide-on-mobile">
            <a href="mailto:${escapeHtml(emp.email)}" class="contact-link font-mono" style="font-size:0.85rem;">${escapeHtml(emp.email)}</a>
          </td>
          <td class="hide-on-mobile">
            <span class="font-mono text-muted" style="font-size:0.85rem;">${escapeHtml(emp.username)}</span>
          </td>
          <td class="hide-on-mobile">
            <span class="status-pill in_review">${escapeHtml(roleLabel)}</span>
          </td>
          <td class="hide-on-mobile">
            <span class="status-pill ${isSuspended ? 'archived' : 'new'}">${isSuspended ? 'Suspended' : 'Active'}</span>
          </td>
          <td class="hide-on-mobile date-cell">${lastActive}</td>
          <td class="col-emp-actions" style="text-align: right; white-space: nowrap;">
            <button type="button" class="btn-table-action ${isSuspended ? 'btn-unblock' : 'btn-block'}" onclick="window.malasToggleEmployeeBlock(${emp.id}, ${!isSuspended}, '${escapeHtml(emp.full_name || emp.username)}')">
              ${isSuspended ? 'Unblock' : 'Block'}
            </button>
            <button type="button" class="btn-table-action" onclick="window.malasOpenEmployee(${emp.id})">
              View &rarr;
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openEmployeeModal() {
    if (!employeeForm) return;
    employeeForm.reset();
    if (employeeIdInput) employeeIdInput.value = '';
    if (employeeModalTitle) employeeModalTitle.textContent = 'Onboard New Employee';
    if (employeeModal) employeeModal.style.display = 'flex';
  }

  function closeEmployeeModal() {
    if (employeeModal) employeeModal.style.display = 'none';
  }

  async function handleSaveEmployee(e) {
    e.preventDefault();
    const id = employeeIdInput ? employeeIdInput.value : '';
    const name = employeeNameInput.value.trim();
    const email = employeeEmailInput.value.trim().toLowerCase();
    const username = (employeeUsernameInput.value.trim() || email.split('@')[0]);
    const password = employeePasswordInput.value;
    const role = (employeeRoleSelect && employeeRoleSelect.value) ? employeeRoleSelect.value : 'employee';

    if (!name || !email || !password) {
      showToast('Name, Corporate Email, and Initial Password are required.', 'warning');
      return;
    }

    const payload = {
      full_name: name,
      email: email,
      username: username,
      password: password,
      role: role
    };

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
        loadDashboardStats();
        showToast(`Employee account for "${name}" registered successfully.`, 'success', 'Staff Onboarded');
      } else {
        showToast(data.error || 'Could not save employee', 'error');
      }
    } catch (err) {
      showToast('Communication error saving employee account.', 'error');
    }
  }

  window.malasDeleteEmployee = async function (id, name) {
    const ok = await showConfirmModal({
      title: `Are you sure you want to delete this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.employeeDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Employee "${name}" removed from system.`, 'success', 'Account Deleted');
        loadEmployees();
        loadDashboardStats();
      } else {
        showToast(data.error || 'Could not delete employee', 'error');
      }
    } catch (err) {
      showToast('Communication error deleting employee account.', 'error');
    }
  };

  window.malasToggleEmployeeBlock = async function (id, shouldBlock, name) {
    const ok = await showConfirmModal({
      title: shouldBlock
        ? `Are you sure you want to block this "${escapeHtml(name)}"?`
        : `Are you sure you want to unblock this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: shouldBlock ? 'warning' : 'primary'
    });
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.employeeDetail(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ status: shouldBlock ? 'suspended' : 'active' })
      });
      const data = await res.json();

      if (data.success) {
        // Update local employee state if found
        const emp = (state.employees || []).find(e => e.id === id);
        if (emp) {
          emp.status = shouldBlock ? 'suspended' : 'active';
        }
        if (state.selectedEmployee && state.selectedEmployee.id === id) {
          state.selectedEmployee.status = shouldBlock ? 'suspended' : 'active';
          updateEmployeeSubpageView(state.selectedEmployee);
        }

        showToast(`Employee "${name}" is now ${shouldBlock ? 'suspended' : 'active'}.`, 'success', 'Status Updated');
        loadEmployees();
        loadDashboardStats();
      } else {
        showToast(data.error || `Could not ${actionLabel.toLowerCase()} employee`, 'error');
      }
    } catch (err) {
      showToast('Communication error updating employee access status.', 'error');
    }
  };

  // Backwards compatibility alias
  window.malasToggleEmployeeStatus = function (id, newStatus) {
    const emp = (state.employees || []).find(e => e.id === id);
    const name = emp ? (emp.full_name || emp.username) : 'Employee';
    window.malasToggleEmployeeBlock(id, newStatus === 'suspended', name);
  };

  function updateEmployeeSubpageView(emp) {
    if (!emp) return;
    const isSuspended = emp.status === 'suspended';
    const initials = (emp.full_name || emp.username || 'ST').slice(0, 2).toUpperCase();

    let roleLabel = 'Field Engineer';
    if (emp.role === 'technician') roleLabel = 'AV Systems Technician';
    else if (emp.role === 'specialist') roleLabel = 'Acoustics & Lighting Specialist';
    else if (emp.role === 'sales') roleLabel = 'Sales & Accounts Consultant';
    else if (emp.role === 'employee') roleLabel = 'Field Engineer';

    if (employeeDetailStatusPill) {
      employeeDetailStatusPill.className = `status-pill ${isSuspended ? 'archived' : 'new'}`;
      employeeDetailStatusPill.textContent = isSuspended ? 'BLOCKED / SUSPENDED' : 'ACTIVE';
    }

    if (empPageAvatar) empPageAvatar.textContent = initials;
    if (empPageName) empPageName.textContent = emp.full_name || emp.username;
    if (empPageRoleLabel) empPageRoleLabel.textContent = roleLabel;
    if (empPageUsername) empPageUsername.textContent = `@${emp.username}`;
    if (empPageMailBtn) empPageMailBtn.href = `mailto:${emp.email}`;

    if (empPageFullname) empPageFullname.textContent = emp.full_name || '—';
    if (empPageLoginUser) empPageLoginUser.textContent = emp.username;
    if (empPageEmail) {
      empPageEmail.textContent = emp.email;
      empPageEmail.href = `mailto:${emp.email}`;
    }
    if (empPageRoleText) empPageRoleText.textContent = roleLabel;
    if (empPageStatusText) empPageStatusText.textContent = isSuspended ? 'Suspended (Access Blocked)' : 'Active (Access Granted)';

    const createdStr = emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    if (empPageCreatedAt) empPageCreatedAt.textContent = createdStr;

    const lastActiveStr = emp.last_login ? new Date(emp.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
    if (empPageLastLogin) empPageLastLogin.textContent = lastActiveStr;

    if (empPageId) empPageId.textContent = `#${emp.id}`;

    if (empPageToggleBlockBtn) {
      empPageToggleBlockBtn.textContent = isSuspended ? 'Unblock Employee Access' : 'Block Employee Access';
      empPageToggleBlockBtn.className = `btn-primary-action btn-block-toggle ${isSuspended ? 'is-suspended' : ''}`;
    }
    if (empPageBlockHint) {
      empPageBlockHint.textContent = isSuspended 
        ? 'Account is currently suspended. Click above to restore login access.'
        : 'Suspended staff are immediately prevented from logging into the portal.';
    }
  }

  window.malasOpenEmployee = function (id) {
    const emp = (state.employees || []).find(item => item.id === id);
    if (!emp) return;

    state.selectedEmployee = emp;
    updateEmployeeSubpageView(emp);

    // Switch View to subpage
    tabPanels.forEach(panel => {
      panel.style.display = 'none';
      panel.classList.remove('active');
    });

    if (tabEmployeeDetail) {
      tabEmployeeDetail.style.display = 'block';
      tabEmployeeDetail.classList.add('active');
    }
    if (pageCurrentTitle) {
      pageCurrentTitle.textContent = `Staff Member · ${emp.full_name || emp.username}`;
    }

    const mainScroll = document.querySelector('.dash-main-scroll');
    if (mainScroll) mainScroll.scrollTop = 0;
  };

  function handleToggleBlockFromSubpage() {
    if (!state.selectedEmployee) return;
    const isCurrentlySuspended = state.selectedEmployee.status === 'suspended';
    window.malasToggleEmployeeBlock(state.selectedEmployee.id, !isCurrentlySuspended, state.selectedEmployee.full_name || state.selectedEmployee.username);
  }

  async function handleDeleteEmployeeFromSubpage() {
    if (!state.selectedEmployee) return;
    const id = state.selectedEmployee.id;
    const name = state.selectedEmployee.full_name || state.selectedEmployee.username || 'this employee';
    const ok = await showConfirmModal({
      title: `Are you sure you want to delete this "${escapeHtml(name)}"?`,
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'danger'
    });
    if (!ok) return;

    try {
      const res = await fetch(ENDPOINTS.employeeDetail(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Employee "${name}" removed from system.`, 'success', 'Account Deleted');
        switchTab('employees');
        loadEmployees();
        loadDashboardStats();
      } else {
        showToast(data.error || 'Could not delete employee', 'error');
      }
    } catch (err) {
      showToast('Communication error deleting employee.', 'error');
    }
  }

  // ============================================================
  // UTILITIES & LUXURY MODAL / TOAST SYSTEM
  // ============================================================
  function showAlert(msg, type = 'info') {
    if (!loginAlert) return;
    loginAlert.textContent = msg;
    loginAlert.className = `alert-banner ${type}`;
    loginAlert.style.display = 'block';
  }

  // Toast Notification System
  function showToast(msg, type = 'info', title = null) {
    const container = document.getElementById('app-toast-container');
    if (!container) {
      console.log(`[Toast ${type}]`, msg);
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = '';
    let defaultTitle = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      defaultTitle = 'Success';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      defaultTitle = 'Action Error';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      defaultTitle = 'Attention';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      defaultTitle = 'Notification';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">
        <span class="toast-title">${escapeHtml(title || defaultTitle)}</span>
        <span class="toast-msg">${escapeHtml(msg)}</span>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 250);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    container.appendChild(toast);

    setTimeout(dismiss, 4200);
  }

  // Universal Confirmation Modal
  let confirmResolve = null;

  function showConfirmModal({
    title = 'Are you sure you want to proceed?',
    message = '',
    confirmText = 'Yes',
    cancelText = 'No',
    type = 'danger'
  } = {}) {
    return new Promise((resolve) => {
      confirmResolve = resolve;

      const modal = document.getElementById('confirm-modal');
      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-message');
      const confirmBtn = document.getElementById('confirm-modal-action-btn');
      const cancelBtn = document.getElementById('confirm-modal-cancel-btn');

      if (!modal) {
        resolve(window.confirm(title.replace(/<[^>]*>?/gm, '')));
        return;
      }

      if (titleEl) titleEl.innerHTML = title;
      if (msgEl) {
        if (message) {
          msgEl.innerHTML = message;
          msgEl.style.display = 'block';
        } else {
          msgEl.innerHTML = '';
          msgEl.style.display = 'none';
        }
      }

      if (confirmBtn) {
        confirmBtn.textContent = confirmText;
        if (type === 'danger') {
          confirmBtn.className = 'btn-delete-danger btn-confirm-action';
          confirmBtn.style.background = '#DC2626';
          confirmBtn.style.borderColor = '#EF4444';
          confirmBtn.style.color = '#FFFFFF';
        } else if (type === 'warning') {
          confirmBtn.className = 'btn-primary-action btn-confirm-action';
          confirmBtn.style.background = '#D97706';
          confirmBtn.style.borderColor = '#F59E0B';
          confirmBtn.style.color = '#FFFFFF';
        } else {
          confirmBtn.className = 'btn-primary-action btn-confirm-action';
          confirmBtn.style.background = '#C89B68';
          confirmBtn.style.borderColor = '#DFB784';
          confirmBtn.style.color = '#000000';
        }
      }

      if (cancelBtn) {
        cancelBtn.textContent = cancelText;
      }

      modal.style.display = 'flex';
      if (cancelBtn) cancelBtn.focus();
    });
  }

  function closeConfirmModal(result = false) {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';
    if (confirmResolve) {
      confirmResolve(result);
      confirmResolve = null;
    }
  }

  function setBtnLoading(loading) {
    if (!loginSubmitBtn) return;
    const textSpan = loginSubmitBtn.querySelector('.btn-text');
    const spinnerSpan = loginSubmitBtn.querySelector('.btn-spinner');

    if (loading) {
      loginSubmitBtn.disabled = true;
      if (textSpan) textSpan.style.display = 'none';
      if (spinnerSpan) spinnerSpan.style.display = 'inline-block';
    } else {
      loginSubmitBtn.disabled = false;
      if (textSpan) textSpan.style.display = 'inline-block';
      if (spinnerSpan) spinnerSpan.style.display = 'none';
    }
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
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

})();
