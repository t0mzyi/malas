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

export async function loadInquiries() {
  const inquiryFilter = document.getElementById('inquiry-filter');
  const inquirySearch = document.getElementById('inquiry-search');
  const inquiriesTableBody = document.getElementById('inquiries-table-body');
  const badgeInquiries = document.getElementById('badge-inquiries-count');
  const statInquiries = document.getElementById('stat-inquiries');

  const status = inquiryFilter ? inquiryFilter.value : 'all';
  const search = inquirySearch ? inquirySearch.value.trim() : '';

  if (inquiriesTableBody) {
    inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading client inquiries...</td></tr>`;
  }

  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const res = await authFetch(ENDPOINTS.inquiries(params.toString()));
    const data = await res.json();

    if (data.success) {
      state.inquiries = data.inquiries || [];
      updateNavBadge(badgeInquiries, state.inquiries.length);
      if (statInquiries) statInquiries.textContent = state.inquiries.length;
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
    inquiriesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No client inquiries received yet. Submissions from the website consultation form will appear here in real-time.</td></tr>`;
    return;
  }

  inquiriesTableBody.innerHTML = inquiries.map((inq) => {
    const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const statusClass = inq.status || 'new';
    const statusLabel = (inq.status || 'new').replace('_', ' ');

    return `
      <tr data-id="${inq.id}">
        <td class="client-name-cell col-client">
          <strong style="color:var(--text-pure); display:block; line-height:1.3;">${escapeHtml(inq.client_name)}</strong>
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
        <td class="col-action" style="text-align: right;">
          <button type="button" class="btn-table-action" onclick="window.malasOpenInquiry(${inq.id})">
            View &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

export function openInquiry(id) {
  const inq = state.inquiries.find(item => item.id === id);
  if (!inq) return;

  state.selectedInquiry = inq;
  const dateStr = inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const statusClass = inq.status || 'new';
  const statusLabel = (inq.status || 'new').replace('_', ' ').toUpperCase();

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

  const inquirySearch = document.getElementById('inquiry-search');
  const inquiryFilter = document.getElementById('inquiry-filter');
  const refreshBtn = document.getElementById('refresh-btn');
  const inqPageSaveStatusBtn = document.getElementById('inq-page-save-status-btn');
  const inqPageDeleteBtn = document.getElementById('inq-page-delete-btn');
  const inquiryBackBtn = document.getElementById('inquiry-back-btn');

  if (inquirySearch) {
    inquirySearch.addEventListener('input', () => loadInquiries());
  }
  if (inquiryFilter) {
    inquiryFilter.addEventListener('change', () => loadInquiries());
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
  if (inqPageDeleteBtn) {
    inqPageDeleteBtn.addEventListener('click', handleDeleteInquiryPage);
  }
  if (inquiryBackBtn) {
    inquiryBackBtn.addEventListener('click', () => switchTab('inquiries'));
  }
}

