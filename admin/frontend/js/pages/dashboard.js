/**
 * MALAS ELECTRONICS — DASHBOARD METRICS & TELEMETRY CONTROLLER
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { authFetch } from '../services/api.js';
import { updateNavBadge } from '../components/navigation.js';

export async function loadDashboardStats() {
  const statInquiries = document.getElementById('stat-inquiries');
  const statProducts = document.getElementById('stat-products');
  const statInvoices = document.getElementById('stat-invoices');
  const statEmployees = document.getElementById('stat-employees');

  const badgeInquiries = document.getElementById('badge-inquiries-count');
  const badgeProducts = document.getElementById('badge-products-count');
  const badgeInvoices = document.getElementById('badge-invoices-count');
  const badgeEmployees = document.getElementById('badge-employees-count');

  try {
    const res = await authFetch(ENDPOINTS.stats());
    const data = await res.json();

    if (data.success) {
      const stats = data.stats || {};

      // 1. Inquiries (Show unread count on nav badge, total count on metric card)
      const inqCount = stats.total !== undefined ? stats.total : (state.inquiries ? state.inquiries.length : 0);
      const unreadInqCount = stats.unreadInquiries !== undefined ? stats.unreadInquiries : inqCount;
      if (statInquiries) statInquiries.textContent = inqCount;
      updateNavBadge(badgeInquiries, unreadInqCount);

      // 2. Products
      const prodCount = stats.products !== undefined ? stats.products : (state.products ? state.products.length : 0);
      if (statProducts) statProducts.textContent = prodCount;
      updateNavBadge(badgeProducts, prodCount);

      // 3. Invoices / Quotes
      const invCount = stats.invoices !== undefined ? stats.invoices : (state.invoices ? state.invoices.length : 0);
      if (statInvoices) statInvoices.textContent = invCount;
      updateNavBadge(badgeInvoices, invCount);

      // 4. Employees (CEO)
      const empCount = stats.employees !== undefined ? stats.employees : (state.employees ? state.employees.length : 0);
      if (statEmployees) statEmployees.textContent = empCount;
      updateNavBadge(badgeEmployees, empCount);

      state.stats = stats;
    }
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

