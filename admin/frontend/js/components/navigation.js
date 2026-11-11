/**
 * MALAS ELECTRONICS — NAVIGATION & VIEW SWITCHING COMPONENTS
 */

import { state } from '../state.js';
import { isUserCeo } from '../services/auth.js';

export function showLoginView() {
  document.documentElement.classList.remove('is-authenticated');
  document.body.classList.remove('is-authenticated');

  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');

  if (loginView) {
    loginView.style.removeProperty('display');
    loginView.style.display = 'flex';
  }
  if (dashboardView) {
    dashboardView.style.setProperty('display', 'none', 'important');
  }
}

export function showDashboardView() {
  document.documentElement.classList.add('is-authenticated');
  document.body.classList.add('is-authenticated');

  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');

  if (loginView) loginView.style.display = 'none';
  if (dashboardView) {
    dashboardView.style.removeProperty('display');
    dashboardView.style.display = 'flex';
  }

  const activePanel = document.querySelector('.tab-panel.active');
  if (!activePanel) {
    const inquiriesPanel = document.getElementById('tab-inquiries');
    if (inquiriesPanel) {
      inquiriesPanel.classList.add('active');
      inquiriesPanel.style.display = 'block';
    }
    const inqNav = document.querySelector('.sidebar-nav-item[data-tab="inquiries"]');
    if (inqNav) inqNav.classList.add('active');
  }

  updateHeaderProfile(state.admin);
}

export function updateHeaderProfile(admin) {
  const dashUserName = document.getElementById('header-user-name') || document.getElementById('dash-user-name');
  const dashUserRole = document.getElementById('header-user-role') || document.getElementById('dash-user-role');
  const userAvatarInitials = document.getElementById('header-user-avatar') || document.getElementById('user-avatar-initials');
  const tabBtnEmployees = document.getElementById('tab-btn-employees');
  const metricCardEmployees = document.getElementById('metric-card-employees');
  const dashPortalModeLabel = document.getElementById('dash-portal-mode-label');

  const usr = admin || state.admin || {};
  const isCeo = isUserCeo(usr);
  const name = usr.fullName || usr.full_name || usr.username || 'Malas Administrator';
  const role = (usr.role || 'Administrator').toUpperCase();

  if (dashUserName) dashUserName.textContent = name;
  if (dashUserRole) dashUserRole.textContent = isCeo ? 'CHIEF EXECUTIVE OFFICER' : role;

  if (userAvatarInitials) {
    const parts = name.trim().split(/\s+/);
    let initials = 'ME';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
    userAvatarInitials.textContent = initials;
  }

  if (tabBtnEmployees) {
    tabBtnEmployees.style.display = isCeo ? 'flex' : 'none';
  }
  if (metricCardEmployees) {
    metricCardEmployees.style.display = isCeo ? 'flex' : 'none';
  }
  if (dashPortalModeLabel) {
    dashPortalModeLabel.textContent = isCeo ? 'EXECUTIVE CEO DISPATCH' : 'OPERATIONS PORTAL';
  }
}

export function updateNavBadge(badgeEl, count) {
  if (!badgeEl) return;
  const num = parseInt(count || '0', 10);
  if (num > 0) {
    badgeEl.textContent = num > 99 ? '99+' : num;
    badgeEl.style.display = 'inline-flex';
  } else {
    badgeEl.style.display = 'none';
  }
}

export function closeAllModals() {
  const modals = [
    document.getElementById('employee-modal'),
    document.getElementById('detail-modal'),
    document.getElementById('product-modal'),
    document.getElementById('invoice-cart-modal'),
    document.getElementById('invoice-view-modal'),
    document.getElementById('stock-modal'),
    document.getElementById('confirm-modal')
  ];

  modals.forEach((m) => {
    if (m) {
      m.classList.remove('active');
      m.style.display = 'none';
    }
  });

  const tabInquiryDetail = document.getElementById('tab-inquiry-detail');
  if (tabInquiryDetail) {
    tabInquiryDetail.style.display = 'none';
    tabInquiryDetail.classList.remove('active');
  }

  const tabEmployeeDetail = document.getElementById('tab-employee-detail');
  if (tabEmployeeDetail) {
    tabEmployeeDetail.style.display = 'none';
    tabEmployeeDetail.classList.remove('active');
  }
}

