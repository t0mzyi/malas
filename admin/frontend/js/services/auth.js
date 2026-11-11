/**
 * MALAS ELECTRONICS — AUTHENTICATION & SESSION SECURITY GUARD
 */

import { state, setToken, setAdmin, clearSession } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { showAlert, showToast, setBtnLoading } from '../components/notifications.js';
import { showLoginView, showDashboardView, updateHeaderProfile, closeAllModals } from '../components/navigation.js';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15-minute inactivity limit
let sessionCheckInterval = null;
let lastActivityUpdate = 0;
let isLoggingOut = false;

export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  return (Date.now() / 1000) >= payload.exp;
}

export function recordUserActivity() {
  const now = Date.now();
  if (now - lastActivityUpdate > 5000) {
    lastActivityUpdate = now;
    try {
      localStorage.setItem('malas_last_active', now.toString());
    } catch (e) {}
  }
}

export function checkSessionLiveness() {
  if (!state.token || isLoggingOut) return;

  const now = Date.now();
  const lastActive = parseInt(localStorage.getItem('malas_last_active') || '0', 10);

  // 1. Idle timeout (15 min inactivity)
  if (lastActive && (now - lastActive > IDLE_TIMEOUT_MS)) {
    handleSessionTimeout('Your session timed out due to inactivity (15 minutes idle). Please sign in again.');
    return;
  }

  // 2. Token expired
  if (isTokenExpired(state.token)) {
    handleSessionTimeout('Your security session has expired. Please sign in again.');
    return;
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    checkSessionLiveness();
  }
}

function onWindowFocus() {
  checkSessionLiveness();
}

export function startSessionMonitoring() {
  stopSessionMonitoring();
  recordUserActivity();

  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  activityEvents.forEach((evt) => {
    window.addEventListener(evt, recordUserActivity, { passive: true });
  });

  sessionCheckInterval = setInterval(checkSessionLiveness, 10000);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', onWindowFocus);
}

export function stopSessionMonitoring() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  activityEvents.forEach((evt) => {
    window.removeEventListener(evt, recordUserActivity);
  });
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('focus', onWindowFocus);
}

export function handleSessionTimeout(reason = 'Your session has timed out. Please sign in to continue.') {
  if (isLoggingOut) return;
  isLoggingOut = true;

  console.warn('[Session Security] Auto-logout triggered:', reason);
  stopSessionMonitoring();
  clearSession();
  closeAllModals();
  showLoginView();

  if (window.history && window.history.pushState && window.location.pathname !== '/login') {
    window.history.pushState({ tab: 'login' }, '', '/login');
  }

  const passwordInput = document.getElementById('password');
  if (passwordInput) passwordInput.value = '';

  showAlert(reason, 'error');
  showToast(reason, 'error');

  setTimeout(() => {
    isLoggingOut = false;
  }, 500);
}

export async function handleLogin(username, password) {
  if (!username || !password) {
    showAlert('Please enter both username/email and password.', 'error');
    return;
  }

  setBtnLoading(true);

  try {
    const res = await fetch(ENDPOINTS.login(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Server returned HTTP ${res.status}. Check API and database connection.`);
    }

    if (res.ok && data && data.success) {
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('malas_last_active', Date.now().toString());

      startSessionMonitoring();
      document.documentElement.classList.add('is-authenticated');

      showAlert('Access Granted. Authenticating operational clearance...', 'success');
      setTimeout(() => {
        showDashboardView();
        window.dispatchEvent(new CustomEvent('malas:login-success'));
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

export async function handleLogout(notifyServer = true) {
  stopSessionMonitoring();
  if (notifyServer) {
    try {
      await fetch(ENDPOINTS.logout(), { method: 'POST' });
    } catch (e) {}
  }

  clearSession();
  closeAllModals();
  showLoginView();

  if (window.history && window.history.pushState && window.location.pathname !== '/login') {
    window.history.pushState({ tab: 'login' }, '', '/login');
  }
}

export async function verifyCurrentSession() {
  const token = state.token;
  if (!token) {
    showLoginView();
    return;
  }

  if (isTokenExpired(token)) {
    handleSessionTimeout('Your security session has expired. Please sign in again.');
    return;
  }

  try {
    const res = await fetch(ENDPOINTS.me(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      handleSessionTimeout('Your session has expired. Please sign in to continue.');
      return;
    }

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.admin) {
        setAdmin(data.admin);
        updateHeaderProfile(data.admin);
      }
    }
  } catch (e) {
    console.warn('Background session check notice:', e);
  }
}

export function isUserCeo(admin) {
  const usr = admin || state.admin || {};
  const role = (usr.role || '').toString().toLowerCase().trim();
  const uname = (usr.username || '').toString().toLowerCase().trim();
  const email = (usr.email || '').toString().toLowerCase().trim();
  return (
    role === 'ceo' ||
    role === 'super_admin' ||
    role === 'admin' ||
    uname === 'ceo@malaselectronics.ae' ||
    uname === 'ceo@malaselectronics.co' ||
    email === 'ceo@malaselectronics.ae' ||
    email === 'ceo@malaselectronics.co' ||
    uname === 'admin'
  );
}

