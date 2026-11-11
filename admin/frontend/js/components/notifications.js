/**
 * MALAS ELECTRONICS — NOTIFICATIONS, MODALS & TOAST SYSTEM
 */

export function showAlert(msg, type = 'info') {
  const loginAlert = document.getElementById('login-alert');
  if (!loginAlert) return;
  loginAlert.textContent = msg;
  loginAlert.className = `alert-banner ${type}`;
  loginAlert.style.display = 'block';
}

export function showToast(msg, type = 'info', title = null) {
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

let confirmResolve = null;

export function showConfirmModal({
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

export function closeConfirmModal(result = false) {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'none';
  if (confirmResolve) {
    confirmResolve(result);
    confirmResolve = null;
  }
}

export function setBtnLoading(loading) {
  const loginSubmitBtn = document.getElementById('login-submit-btn');
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

export function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

