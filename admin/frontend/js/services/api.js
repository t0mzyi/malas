/**
 * MALAS ELECTRONICS — AUTHENTICATED API SERVICE
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { isTokenExpired, handleSessionTimeout, recordUserActivity } from './auth.js';

export async function authFetch(url, options = {}) {
  if (!state.token || isTokenExpired(state.token)) {
    handleSessionTimeout('Your security session has expired. Please sign in again.');
    throw new Error('Session expired.');
  }

  const opts = Object.assign({}, options);
  opts.headers = Object.assign({}, opts.headers || {});

  if (!opts.headers['Authorization']) {
    opts.headers['Authorization'] = `Bearer ${state.token}`;
  }

  recordUserActivity();

  const res = await fetch(url, opts);

  // If server returns HTTP 401 Unauthorized, automatically log out
  if (res.status === 401) {
    console.warn('[Session Security] Server returned HTTP 401 Unauthorized on:', url);
    handleSessionTimeout('Your session has timed out or expired. Please sign in again.');
    throw new Error('Session unauthorized.');
  }

  return res;
}

export async function uploadImageToCloudinary(imageData) {
  const res = await authFetch(ENDPOINTS.upload(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData })
  });
  return res.json();
}

