/**
 * MALAS ELECTRONICS — INQUIRIES & CONSULTATIONS CONTROLLER
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { authFetch } from '../services/api.js';
import { showToast, showConfirmModal, escapeHtml } from '../components/notifications.js';
import { updateNavBadge } from '../components/navigation.js';
import { switchTab } from '../router.js';
import { loadDashboardStats } from './dashboard.js';

function isInquiryRead(inq) {
  return inq && (inq.is_read === 1 || inq.is_read === true || inq.is_read === '1');
}

function updateDetailReadButton(isRead) {
  const btn = document.getElementById('inq-page-toggle-read-btn');
  const label = document.getElementById('inq-page-toggle-read-label');
  if (label) {
    label.textContent = isRead ? 'Mark as Unread' : 'Mark as Read';
  }
  if (btn) {
    btn.classList.toggle('is-unread-action', isRead);
    btn.title = isRead ? 'Move back to Unread inbox' : 'Mark inquiry as Read';
  }
}

export async function setInquiryReadState(id, markAsRead, showFeedback = true) {
  const targetVal = markAsRead ? 1 : 0;
  const inq = (state.inquiries || []).find(item => Number(item.id) === Number(id));
  if (inq) inq.is_read = targetVal;
  if (state.selectedInquiry && Number(state.selectedInquiry.id) === Number(id)) {
    state.selectedInquiry.is_read = targetVal;
    updateDetailReadButton(markAsRead);
  }

  try {
    const res = await authFetch(ENDPOINTS.inquiryDetail(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: targetVal })
    });
    const data = await res.json();
    if (data.success) {
      loadInquiries();
      loadDashboardStats();
      if (showFeedback) {
        showToast(
          markAsRead ? 'Inquiry marked as read.' : 'Inquiry marked as unread.',
          'info',
          markAsRead ? 'Read' : 'Unread'
        );
      }
    } else if (showFeedback) {
      showToast(data.error || 'Could not update read state.', 'error');
    }
  } catch (err) {
    if (showFeedback) showToast('Communication error updating read status.', 'error');
  }
}

export async function loadInquiries() {
  const inquiryFilter = document.getElementById('inquiry-filter');
  const inquiryReadFilter = document.getElementById('inquiry-read-filter');
  const inquirySearch = document.getElementById('inquiry-search');
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
  const badgeInquiries = document.getElementById('badge-inquiries-count');
  const statInquiries = document.getElementById('stat-inquiries');

  const status = inquiryFilter ? inquiryFilter.value : 'all';
  const readFilter = inquiryReadFilter ? inquiryReadFilter.value : 'all';
  const search = inquirySearch ? inquirySearch.value.trim() : '';

  if (inquiriesTableBody) {
    inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading client inquiries...</td></tr>`;
  }

  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (readFilter && readFilter !== 'all') params.append('read', readFilter);
    if (search) params.append('search', search);

    const res = await authFetch(ENDPOINTS.inquiries(params.toString()));
    const data = await res.json();

    if (data.success) {
      state.inquiries = data.inquiries || [];
      const unreadCount = data.unreadCount !== undefined
        ? parseInt(data.unreadCount, 10)
        : state.inquiries.filter(item => !isInquiryRead(item)).length;
      updateNavBadge(badgeInquiries, unreadCount);
      if (statInquiries && readFilter === 'all' && status === 'all' && !search) {
        statInquiries.textContent = state.inquiries.length;
      }
      renderInquiriesTable(data.inquiries);
    } else {
      if (inquiriesTableBody) {
        inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
      }
    }
  } catch (err) {
    if (inquiriesTableBody) {
      inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to reach inquiries service.</td></tr>`;
    }
  }
}

export function renderInquiriesTable(inquiries) {
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
  if (!inquiriesTableBody) return;

  if (!inquiries || inquiries.length === 0) {
    inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No client inquiries match the current filter.</td></tr>`;
    return;
  }

  inquiriesTableBody.innerHTML = inquiries.map((inq) => {
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const statusClass = inq.status || 'new';
    const statusLabel = (inq.status || 'new').replace('_', ' ');
    const read = isInquiryRead(inq);
    const nextReadState = !read;

    return `
      <tr data-id="${inq.id}" class="${read ? 'inq-row-read' : 'inq-row-unread'}">
        <td class="client-name-cell col-client" onclick="window.malasOpenInquiry(${inq.id})" style="cursor:pointer;">
          <div class="inq-client-wrap">
            <span class="inq-unread-dot ${read ? 'is-read' : ''}" title="${read ? 'Read' : 'Unread inquiry'}"></span>
            <strong class="inq-client-title">${escapeHtml(inq.client_name)}</strong>
          </div>
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
        <td class="col-action" style="text-align: right; white-space: nowrap;">
          <div class="inq-row-actions">
            <button type="button" class="btn-read-toggle ${read ? 'is-read' : 'is-unread'}" onclick="window.malasToggleInquiryRead(${inq.id}, ${nextReadState})" title="${read ? 'Mark as Unread' : 'Mark as Read'}" aria-label="${read ? 'Mark as Unread' : 'Mark as Read'}">
              ${read
                ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
              }
            </button>
            <button type="button" class="btn-table-action" onclick="window.malasOpenInquiry(${inq.id})">
              View &rarr;
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function openInquiry(id) {
  const inq = state.inquiries.find(item => Number(item.id) === Number(id));
  if (!inq) return;

  state.selectedInquiry = inq;
  const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const statusClass = inq.status || 'new';
  const statusLabel = (inq.status || 'new').replace('_', ' ').toUpperCase();

  // Auto-mark unread inquiry as read on open
  const wasRead = isInquiryRead(inq);
  updateDetailReadButton(true);
  if (!wasRead) {
    setInquiryReadState(inq.id, true, false);
  }

  const inqPageTag = document.getElementById('inq-page-tag');
  const inqPageClientName = document.getElementById('inq-page-client-name');
  const inqPageDate = document.getElementById('inq-page-date');
  const inquiryDetailStatusPill = document.getElementById('inquiry-detail-status-pill');
  const inqPageContactName = document.getElementById('inq-page-contact-name');
  const inqPageEmail = document.getElementById('inq-page-email');
  const inqPagePhone = document.getElementById('inq-page-phone');
  const inqPageSector = document.getElementById('inq-page-sector');
  const inqPageVenue = document.getElementById('inq-page-venue');
  const inqPageBudget = document.getElementById('inq-page-budget');
  const inqPageTimeline = document.getElementById('inq-page-timeline');
  const inqPageScope = document.getElementById('inq-page-scope');
  const inqPageStatusSelect = document.getElementById('inq-page-status-select');
  const inqPageCallBtn = document.getElementById('inq-page-call-btn');
  const inqPageMailBtn = document.getElementById('inq-page-mail-btn');
  const tabInquiryDetail = document.getElementById('tab-inquiry-detail');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageCurrentTitle = document.getElementById('page-current-title');

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
}

export async function handleSaveInquiryPageStatus() {
  if (!state.selectedInquiry) return;
  const inqPageStatusSelect = document.getElementById('inq-page-status-select');
  const inqPageSaveStatusBtn = document.getElementById('inq-page-save-status-btn');
  const inquiryDetailStatusPill = document.getElementById('inquiry-detail-status-pill');

  const newStatus = inqPageStatusSelect ? inqPageStatusSelect.value : 'new';
  const id = state.selectedInquiry.id;

  if (inqPageSaveStatusBtn) {
    inqPageSaveStatusBtn.disabled = true;
    inqPageSaveStatusBtn.textContent = 'Saving...';
  }

  try {
    const res = await authFetch(ENDPOINTS.inquiryDetail(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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

export async function handleDeleteInquiryPage() {
  if (!state.selectedInquiry) return;
  const id = state.selectedInquiry.id;
  const name = state.selectedInquiry.client_name || `Inquiry #${id}`;
  const ok = await showConfirmModal({
    title: `Are you sure you want to delete "${escapeHtml(name)}"?`,
    confirmText: 'Yes',
    cancelText: 'No',
    type: 'danger'
  });
  if (!ok) return;

  try {
    const res = await authFetch(ENDPOINTS.inquiryDetail(id), {
      method: 'DELETE'
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

export function initInquiriesPage() {
  window.malasOpenInquiry = openInquiry;
  window.malasToggleInquiryRead = (id, markAsRead) => setInquiryReadState(id, markAsRead, true);

  const inquirySearch = document.getElementById('inquiry-search');
  const inquiryFilter = document.getElementById('inquiry-filter');
  const inquiryReadFilter = document.getElementById('inquiry-read-filter');
  const refreshBtn = document.getElementById('refresh-btn');
  const inqPageSaveStatusBtn = document.getElementById('inq-page-save-status-btn');
  const inqPageToggleReadBtn = document.getElementById('inq-page-toggle-read-btn');
  const inqPageDeleteBtn = document.getElementById('inq-page-delete-btn');
  const inquiryBackBtn = document.getElementById('inquiry-back-btn');

  if (inquirySearch) {
    inquirySearch.addEventListener('input', () => loadInquiries());
  }
  if (inquiryFilter) {
    inquiryFilter.addEventListener('change', () => loadInquiries());
  }
  if (inquiryReadFilter) {
    inquiryReadFilter.addEventListener('change', () => loadInquiries());
  }
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadInquiries();
      loadDashboardStats();
      showToast('Inquiries refreshed.', 'info');
    });
  }
  if (inqPageSaveStatusBtn) {
    inqPageSaveStatusBtn.addEventListener('click', handleSaveInquiryPageStatus);
  }
  if (inqPageToggleReadBtn) {
    inqPageToggleReadBtn.addEventListener('click', () => {
      if (!state.selectedInquiry) return;
      const nextRead = !isInquiryRead(state.selectedInquiry);
      setInquiryReadState(state.selectedInquiry.id, nextRead, true);
    });
  }
  if (inqPageDeleteBtn) {
    inqPageDeleteBtn.addEventListener('click', handleDeleteInquiryPage);
  }
  if (inquiryBackBtn) {
    inquiryBackBtn.addEventListener('click', () => switchTab('inquiries'));
  }
}

