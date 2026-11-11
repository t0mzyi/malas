/**
 * MALAS ELECTRONICS — ADMIN CONFIGURATION & ENDPOINTS
 */

export function getApiRoot() {
  if (typeof window !== 'undefined' && window.MALAS_API_BASE) {
    return window.MALAS_API_BASE.replace(/\/+$/, '');
  }
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('malas_admin_api_base') : null;
  if (stored) {
    return stored.replace(/\/+$/, '');
  }
  return '/api';
}

export const ENDPOINTS = {
  health: () => `${getApiRoot()}/dashboard/health`,
  stats: () => `${getApiRoot()}/dashboard/stats`,
  me: () => `${getApiRoot()}/auth/me`,
  login: () => `${getApiRoot()}/auth/login`,
  logout: () => `${getApiRoot()}/auth/logout`,
  inquiries: (query = '') => `${getApiRoot()}/inquiries${query ? '?' + query : ''}`,
  inquiryDetail: (id) => `${getApiRoot()}/inquiries/${id}`,
  products: (query = '') => `${getApiRoot()}/products${query ? '?' + query : ''}`,
  productDetail: (id) => `${getApiRoot()}/products/${id}`,
  productStock: (id) => `${getApiRoot()}/products/${id}/stock`,
  categories: () => `${getApiRoot()}/categories`,
  categoryDetail: (id) => `${getApiRoot()}/categories/${id}`,
  invoices: (query = '') => `${getApiRoot()}/invoices${query ? '?' + query : ''}`,
  invoiceDetail: (id) => `${getApiRoot()}/invoices/${id}`,
  employees: () => `${getApiRoot()}/employees`,
  employeeDetail: (id) => `${getApiRoot()}/employees/${id}`,
  upload: () => `${getApiRoot()}/upload`
};

