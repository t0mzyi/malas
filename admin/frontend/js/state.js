/**
 * MALAS ELECTRONICS — CENTRAL APPLICATION STATE
 */

const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('malas_admin_token') : null;
let savedAdmin = null;

try {
  const rawAdmin = typeof localStorage !== 'undefined' ? localStorage.getItem('malas_admin_user') : null;
  if (rawAdmin) savedAdmin = JSON.parse(rawAdmin);
} catch (e) {}

export const state = {
  token: savedToken,
  admin: savedAdmin || (savedToken ? { fullName: 'Administrator', username: 'admin', role: 'admin' } : null),
  currentTab: 'inquiries',
  stats: null,
  inquiries: [],
  products: [],
  categories: [],
  invoices: [],
  employees: [],
  cart: [],
  selectedInquiry: null,
  selectedProduct: null,
  selectedCategory: null,
  activeInvoiceForView: null,
  editingInvoiceId: null,
  editingInvoiceNumber: null
};

export function setToken(token) {
  state.token = token;
  if (token) {
    try { localStorage.setItem('malas_admin_token', token); } catch (e) {}
  } else {
    try { localStorage.removeItem('malas_admin_token'); } catch (e) {}
  }
}

export function setAdmin(adminData) {
  state.admin = adminData;
  if (adminData) {
    try { localStorage.setItem('malas_admin_user', JSON.stringify(adminData)); } catch (e) {}
  } else {
    try { localStorage.removeItem('malas_admin_user'); } catch (e) {}
  }
}

export function clearSession() {
  state.token = null;
  state.admin = null;
  state.cart = [];
  state.selectedInquiry = null;
  state.selectedProduct = null;
  state.selectedCategory = null;
  state.activeInvoiceForView = null;
  state.editingInvoiceId = null;
  state.editingInvoiceNumber = null;
  try {
    localStorage.removeItem('malas_admin_token');
    localStorage.removeItem('malas_admin_user');
    localStorage.removeItem('malas_last_active');
    sessionStorage.clear();
  } catch (e) {}
}

