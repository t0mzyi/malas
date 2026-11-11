/**
 * MALAS ELECTRONICS — CLIENT-SIDE SPA ROUTER & NAVIGATION
 */

import { state } from './state.js';
import { isUserCeo } from './services/auth.js';

export const TAB_TITLES = {
  inquiries: 'Client Inquiries & RFPs',
  products: 'Stock Management',
  invoices: 'Invoice Generation',
  employees: 'Employees',
  login: 'Sign In'
};

export function resolveTabName(name) {
  if (!name) return 'inquiries';
  const clean = String(name).toLowerCase().trim().replace(/^[/#]+|[/#]+$/g, '');
  if (clean === 'login' || clean === 'signin') {
    return 'login';
  }
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

export function getTabFromUrl() {
  const hash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
  if (hash) {
    return resolveTabName(hash);
  }

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

export function switchTab(rawTabName, updateHistory = true) {
  let tabName = resolveTabName(rawTabName);
  const isCeo = isUserCeo(state.admin);
  if (tabName === 'employees' && !isCeo) {
    tabName = 'inquiries';
  }

  state.currentTab = tabName;

  const tabButtons = document.querySelectorAll('.sidebar-nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageCurrentTitle = document.getElementById('page-current-title');

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

  if (updateHistory && window.history && window.history.pushState) {
    const targetPath = getTargetPath(tabName);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabName }, '', targetPath);
    }
  }

  if (TAB_TITLES[tabName]) {
    document.title = `${TAB_TITLES[tabName]} — Malas Electronics Admin`;
  }

  // Trigger page-specific data load via custom event
  window.dispatchEvent(new CustomEvent('malas:tab-changed', { detail: { tab: tabName } }));
}

export function setupUrlRouting() {
  window.addEventListener('popstate', (e) => {
    const tab = (e.state && e.state.tab) || getTabFromUrl();
    switchTab(tab, false);
  });

  const tabButtons = document.querySelectorAll('.sidebar-nav-item');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab, true);
    });
  });
}

