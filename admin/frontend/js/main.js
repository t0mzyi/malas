/**
 * MALAS ELECTRONICS LLC — ENTERPRISE ADMIN PORTAL
 * Modular ES6 Application Entrypoint
 */

import { state } from './state.js';
import { isTokenExpired, startSessionMonitoring, handleSessionTimeout, verifyCurrentSession } from './services/auth.js';
import { showLoginView, showDashboardView } from './components/navigation.js';
import { closeConfirmModal, showAlert, showToast } from './components/notifications.js';
import { setupUrlRouting, switchTab, getTabFromUrl } from './router.js';

import { initLoginPage } from './pages/login.js';
import { loadDashboardStats } from './pages/dashboard.js';
import { initInquiriesPage, loadInquiries } from './pages/inquiries.js';
import { initProductsPage, loadProducts } from './pages/products.js';
import { initInvoicesPage, loadInvoices } from './pages/invoices.js';
import { initEmployeesPage, loadEmployees } from './pages/employees.js';

async function bootstrap() {
  // 1. Initialize Page Handlers & Event Listeners
  initLoginPage();
  initInquiriesPage();
  initProductsPage();
  initInvoicesPage();
  initEmployeesPage();
  setupUrlRouting();

  // 2. Global Confirmation Modal Event Bindings
  const confirmCancelBtn = document.getElementById('confirm-modal-cancel-btn');
  const confirmActionBtn = document.getElementById('confirm-modal-action-btn');
  const confirmModalEl = document.getElementById('confirm-modal');

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', () => closeConfirmModal(false));
  }
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener('click', () => closeConfirmModal(true));
  }
  if (confirmModalEl) {
    confirmModalEl.addEventListener('click', (e) => {
      if (e.target === confirmModalEl) closeConfirmModal(false);
    });
  }

  // 3. Tab Navigation & Data Refresh Event Handlers
  window.addEventListener('malas:tab-changed', (e) => {
    const tab = (e.detail && e.detail.tab) || 'inquiries';
    if (tab === 'inquiries') loadInquiries();
    if (tab === 'products') loadProducts();
    if (tab === 'invoices') loadInvoices();
    if (tab === 'employees') loadEmployees();
    loadDashboardStats();
  });

  window.addEventListener('malas:login-success', () => {
    loadDashboardStats();
    const initialTab = getTabFromUrl();
    switchTab(initialTab, false);
  });

  // 4. Session Validation on Page Boot
  let timeoutMsg = null;
  try {
    timeoutMsg = sessionStorage.getItem('malas_session_timeout_msg');
    if (timeoutMsg) sessionStorage.removeItem('malas_session_timeout_msg');
  } catch (e) {}

  const now = Date.now();
  const lastActive = parseInt(localStorage.getItem('malas_last_active') || '0', 10);
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
  const isIdle = lastActive && (now - lastActive > IDLE_TIMEOUT_MS);
  const isExpired = state.token && isTokenExpired(state.token);

  if (state.token && (isIdle || isExpired)) {
    handleSessionTimeout(
      isIdle
        ? 'Your session timed out due to inactivity (15 minutes idle). Please sign in again.'
        : 'Your security session has expired. Please sign in again.'
    );
    return;
  }

  if (state.token) {
    startSessionMonitoring();
    showDashboardView();
    loadDashboardStats();
    let targetTab = getTabFromUrl();
    if (targetTab === 'login') targetTab = 'inquiries';
    switchTab(targetTab, true);
    await verifyCurrentSession();
  } else {
    showLoginView();
    if (window.history && window.history.replaceState && window.location.pathname !== '/login') {
      window.history.replaceState({ tab: 'login' }, '', '/login');
    }
    if (timeoutMsg) {
      showAlert(timeoutMsg, 'error');
      showToast(timeoutMsg, 'error');
    }
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

