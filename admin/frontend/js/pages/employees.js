/**
 * MALAS ELECTRONICS — STAFF ROSTER & PERSONNEL CONTROLLER (CEO ONLY)
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { authFetch } from '../services/api.js';
import { isUserCeo } from '../services/auth.js';
import { showToast, showConfirmModal, escapeHtml } from '../components/notifications.js';
import { updateNavBadge } from '../components/navigation.js';
import { switchTab } from '../router.js';
import { loadDashboardStats } from './dashboard.js';

export async function loadEmployees() {
  const isCeo = isUserCeo(state.admin);
  if (!isCeo) return;

  const employeesTableBody = document.getElementById('employees-table-body');
  const badgeEmployees = document.getElementById('badge-employees-count');
  const statEmployees = document.getElementById('stat-employees');

  if (!employeesTableBody) return;
  employeesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Loading staff directory...</td></tr>`;

  try {
    const res = await authFetch(ENDPOINTS.employees());
    const data = await res.json();

    if (data.success) {
      state.employees = (data.employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');
      const empCount = state.employees.length;
      updateNavBadge(badgeEmployees, empCount);
      if (statEmployees) statEmployees.textContent = empCount;
      filterEmployeesLocal();
    } else {
      employeesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state" style="color:var(--status-red);">Error: ${data.error}</td></tr>`;
    }
  } catch (err) {
    employeesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Failed to reach employees service.</td></tr>`;
  }
}

export function filterEmployeesLocal() {
  const employeeSearch = document.getElementById('employee-search');
  const employeeStatusFilter = document.getElementById('employee-status-filter');

  const query = (employeeSearch ? employeeSearch.value.trim().toLowerCase() : '');
  const status = (employeeStatusFilter ? employeeStatusFilter.value : 'all');

  let filtered = (state.employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');

  if (status !== 'all') {
    filtered = filtered.filter(emp => emp.status === status);
  }

  if (query) {
    filtered = filtered.filter(emp => {
      const name = (emp.full_name || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const username = (emp.username || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();
      return name.includes(query) || email.includes(query) || username.includes(query) || role.includes(query);
    });
  }

  renderEmployeesTable(filtered);
}

export function renderEmployeesTable(employees) {
  const employeesTableBody = document.getElementById('employees-table-body');
  if (!employeesTableBody) return;

  const list = (employees || []).filter(emp => emp.role !== 'ceo' && emp.role !== 'super_admin' && emp.role !== 'admin');

  if (list.length === 0) {
    employeesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No staff members found. Click "+ Onboard Employee" to add team credentials.</td></tr>`;
    return;
  }

  employeesTableBody.innerHTML = list.map(emp => {
    const dateStr = emp.last_login ? emp.last_login.replace(' ', 'T') : null;
    const lastActive = dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
    const isSuspended = emp.status === 'suspended';

    let roleLabel = 'Employee';
    if (emp.role === 'technician') roleLabel = 'AV Systems Technician';
    else if (emp.role === 'specialist') roleLabel = 'Acoustics & Lighting Specialist';
    else if (emp.role === 'sales') roleLabel = 'Sales & Accounts Consultant';
    else if (emp.role === 'employee') roleLabel = 'Employee';

    const initials = (emp.full_name || emp.username || 'ST').slice(0, 2).toUpperCase();

    return `
      <tr data-id="${emp.id}">
        <td class="client-name-cell col-emp-name" style="padding: 16px 20px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="user-avatar" style="width:40px; height:40px; font-size:1rem; flex-shrink:0; border-radius: 50%; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: #F8FAFC; display: flex; align-items: center; justify-content: center; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);">${escapeHtml(initials)}</div>
            <div style="min-width:0;">
              <strong style="color:var(--text-pure); display:block; line-height:1.2; font-size:1rem; margin-bottom: 3px; word-break:break-word;">${escapeHtml(emp.full_name || emp.username)}</strong>
              ${isSuspended ? `<span class="status-pill archived" style="font-size:0.65rem; padding:2px 6px;">BLOCKED</span>` : `<span style="color:#94A3B8; font-size:0.8rem;">${escapeHtml(roleLabel)}</span>`}
            </div>
          </div>
        </td>
        <td class="hide-on-mobile">
          <a href="mailto:${escapeHtml(emp.email)}" class="contact-link" style="font-size:0.9rem; font-weight: 500;">${escapeHtml(emp.email)}</a>
        </td>
        <td class="hide-on-mobile">
          <span class="font-mono" style="font-size:0.85rem; color:#64748B; background: rgba(255,255,255,0.03); padding: 4px 8px; border-radius: 4px;">@${escapeHtml(emp.username)}</span>
        </td>
        <td class="hide-on-mobile">
          <span class="status-pill ${isSuspended ? 'archived' : 'new'}" style="font-size: 0.75rem;">${isSuspended ? 'Suspended' : 'Active'}</span>
        </td>
        <td class="hide-on-mobile date-cell" style="color: ${dateStr ? '#E2E8F0' : '#64748B'};">${lastActive}</td>
        <td class="col-emp-actions" style="text-align: right; white-space: nowrap; padding-right: 20px;">
          <div class="emp-action-btn-group">
            <button type="button" class="btn-table-action ${isSuspended ? 'btn-unblock' : 'btn-block'}" onclick="window.malasToggleEmployeeBlock(${emp.id}, ${!isSuspended}, '${escapeHtml(emp.full_name || emp.username)}')">
              ${isSuspended ? 'Unblock' : 'Block'}
            </button>
            <button type="button" class="btn-table-action" onclick="window.malasOpenEmployee(${emp.id})">
              View Profile &rarr;
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function openEmployeeModal() {
  const employeeForm = document.getElementById('employee-form');
  const employeeIdInput = document.getElementById('employee-id');
  const employeeModalTitle = document.getElementById('employee-modal-title');
  const employeeModal = document.getElementById('employee-modal');

  if (employeeForm) employeeForm.reset();
  if (employeeIdInput) employeeIdInput.value = '';
  if (employeeModalTitle) employeeModalTitle.textContent = 'Onboard New Employee';
  if (employeeModal) employeeModal.style.display = 'flex';
}

export function closeEmployeeModal() {
  const employeeModal = document.getElementById('employee-modal');
  if (employeeModal) employeeModal.style.display = 'none';
}

export async function handleSaveEmployee(e) {
  e.preventDefault();
  const employeeNameInput = document.getElementById('employee-name');
  const employeeEmailInput = document.getElementById('employee-email');
  const employeeUsernameInput = document.getElementById('employee-username');
  const employeePasswordInput = document.getElementById('employee-password');
  const employeeRoleSelect = document.getElementById('employee-role');

  const name = employeeNameInput ? employeeNameInput.value.trim() : '';
  const email = employeeEmailInput ? employeeEmailInput.value.trim().toLowerCase() : '';
  const username = (employeeUsernameInput && employeeUsernameInput.value.trim()) || email.split('@')[0];
  const password = employeePasswordInput ? employeePasswordInput.value : '';
  const role = (employeeRoleSelect && employeeRoleSelect.value) ? employeeRoleSelect.value : 'employee';

  if (!name || !email || !password) {
    showToast('Name, Corporate Email, and Initial Password are required.', 'warning');
    return;
  }

  const payload = {
    full_name: name,
    email: email,
    username: username,
    password: password,
    role: role
  };

  try {
    const res = await authFetch(ENDPOINTS.employees(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      closeEmployeeModal();
      loadEmployees();
      loadDashboardStats();
      showToast(`Employee account for "${name}" registered successfully.`, 'success', 'Staff Onboarded');
    } else {
      showToast(data.error || 'Could not save employee', 'error');
    }
  } catch (err) {
    showToast('Communication error saving employee account.', 'error');
  }
}

export async function deleteEmployee(id, name) {
  const ok = await showConfirmModal({
    title: `Are you sure you want to delete "${escapeHtml(name)}"?`,
    confirmText: 'Yes',
    cancelText: 'No',
    type: 'danger'
  });
  if (!ok) return;

  try {
    const res = await authFetch(ENDPOINTS.employeeDetail(id), {
      method: 'DELETE'
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Employee "${name}" removed from system.`, 'success', 'Account Deleted');
      loadEmployees();
      loadDashboardStats();
    } else {
      showToast(data.error || 'Could not delete employee', 'error');
    }
  } catch (err) {
    showToast('Communication error deleting employee account.', 'error');
  }
}

export async function toggleEmployeeBlock(id, shouldBlock, name) {
  const ok = await showConfirmModal({
    title: shouldBlock
      ? `Are you sure you want to block "${escapeHtml(name)}"?`
      : `Are you sure you want to unblock "${escapeHtml(name)}"?`,
    confirmText: 'Yes',
    cancelText: 'No',
    type: shouldBlock ? 'warning' : 'primary'
  });
  if (!ok) return;

  try {
    const res = await authFetch(ENDPOINTS.employeeDetail(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: shouldBlock ? 'suspended' : 'active' })
    });
    const data = await res.json();

    if (data.success) {
      const emp = (state.employees || []).find(e => e.id === id);
      if (emp) {
        emp.status = shouldBlock ? 'suspended' : 'active';
      }
      if (state.selectedEmployee && state.selectedEmployee.id === id) {
        state.selectedEmployee.status = shouldBlock ? 'suspended' : 'active';
        updateEmployeeSubpageView(state.selectedEmployee);
      }

      showToast(`Employee "${name}" is now ${shouldBlock ? 'suspended' : 'active'}.`, 'success', 'Status Updated');
      loadEmployees();
      loadDashboardStats();
    } else {
      showToast(data.error || `Could not update employee status`, 'error');
    }
  } catch (err) {
    showToast('Communication error updating employee access status.', 'error');
  }
}

export function updateEmployeeSubpageView(emp) {
  if (!emp) return;
  const isSuspended = emp.status === 'suspended';
  const initials = (emp.full_name || emp.username || 'ST').slice(0, 2).toUpperCase();

  let roleLabel = 'Employee';
  if (emp.role === 'technician') roleLabel = 'AV Systems Technician';
  else if (emp.role === 'specialist') roleLabel = 'Acoustics & Lighting Specialist';
  else if (emp.role === 'sales') roleLabel = 'Sales & Accounts Consultant';
  else if (emp.role === 'employee') roleLabel = 'Employee';

  const employeeDetailStatusPill = document.getElementById('employee-detail-status-pill');
  const empPageAvatar = document.getElementById('emp-page-avatar');
  const empPageName = document.getElementById('emp-page-name');
  const empPageRoleLabel = document.getElementById('emp-page-role-label');
  const empPageUsername = document.getElementById('emp-page-username');
  const empPageMailBtn = document.getElementById('emp-page-mail-btn');
  const empPageFullname = document.getElementById('emp-page-fullname');
  const empPageLoginUser = document.getElementById('emp-page-login-user');
  const empPageEmail = document.getElementById('emp-page-email');
  const empPageRoleText = document.getElementById('emp-page-role-text');
  const empPageStatusText = document.getElementById('emp-page-status-text');
  const empPageCreatedAt = document.getElementById('emp-page-created-at');
  const empPageLastLogin = document.getElementById('emp-page-last-login');
  const empPageId = document.getElementById('emp-page-id');
  const empPageToggleBlockBtn = document.getElementById('emp-page-toggle-block-btn');
  const empPageBlockHint = document.getElementById('emp-page-block-hint');

  if (employeeDetailStatusPill) {
    employeeDetailStatusPill.className = `status-pill ${isSuspended ? 'archived' : 'new'}`;
    employeeDetailStatusPill.textContent = isSuspended ? 'BLOCKED / SUSPENDED' : 'ACTIVE';
  }

  if (empPageAvatar) empPageAvatar.textContent = initials;
  if (empPageName) empPageName.textContent = emp.full_name || emp.username;
  if (empPageRoleLabel) empPageRoleLabel.textContent = roleLabel;
  if (empPageUsername) empPageUsername.textContent = `@${emp.username}`;
  if (empPageMailBtn) empPageMailBtn.href = `mailto:${emp.email}`;

  if (empPageFullname) empPageFullname.textContent = emp.full_name || '—';
  if (empPageLoginUser) empPageLoginUser.textContent = emp.username;
  if (empPageEmail) {
    empPageEmail.textContent = emp.email;
    empPageEmail.href = `mailto:${emp.email}`;
  }
  if (empPageRoleText) empPageRoleText.textContent = roleLabel;
  if (empPageStatusText) empPageStatusText.textContent = isSuspended ? 'Suspended (Access Blocked)' : 'Active (Access Granted)';

  const createdStr = emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  if (empPageCreatedAt) empPageCreatedAt.textContent = createdStr;

  const lastActiveStr = emp.last_login ? new Date(emp.last_login.replace(' ', 'T')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
  if (empPageLastLogin) empPageLastLogin.textContent = lastActiveStr;

  if (empPageId) empPageId.textContent = `#${emp.id}`;

  if (empPageToggleBlockBtn) {
    empPageToggleBlockBtn.textContent = isSuspended ? 'Unblock Employee Access' : 'Block Employee Access';
    empPageToggleBlockBtn.className = `btn-primary-action btn-block-toggle ${isSuspended ? 'is-suspended' : ''}`;
  }
  if (empPageBlockHint) {
    empPageBlockHint.textContent = isSuspended 
      ? 'Account is currently suspended. Click above to restore login access.'
      : 'Suspended staff are immediately prevented from logging into the portal.';
  }
}

export function openEmployee(id) {
  const emp = (state.employees || []).find(item => item.id === id);
  if (!emp) return;

  state.selectedEmployee = emp;
  updateEmployeeSubpageView(emp);

  const tabPanels = document.querySelectorAll('.tab-panel');
  const tabEmployeeDetail = document.getElementById('tab-employee-detail');
  const pageCurrentTitle = document.getElementById('page-current-title');

  tabPanels.forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active');
  });

  if (tabEmployeeDetail) {
    tabEmployeeDetail.style.display = 'block';
    tabEmployeeDetail.classList.add('active');
  }
  if (pageCurrentTitle) {
    pageCurrentTitle.textContent = `Staff Member · ${emp.full_name || emp.username}`;
  }

  const mainScroll = document.querySelector('.dash-main-scroll');
  if (mainScroll) mainScroll.scrollTop = 0;
}

export function initEmployeesPage() {
  window.malasToggleEmployeeBlock = toggleEmployeeBlock;
  window.malasOpenEmployee = openEmployee;
  window.malasDeleteEmployee = deleteEmployee;

  const employeeSearch = document.getElementById('employee-search');
  const employeeStatusFilter = document.getElementById('employee-status-filter');
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  const closeEmployeeModalBtn = document.getElementById('close-employee-modal-btn');
  const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
  const employeeForm = document.getElementById('employee-form');
  const employeeBackBtn = document.getElementById('employee-back-btn');
  const empPageToggleBlockBtn = document.getElementById('emp-page-toggle-block-btn');
  const empPageDeleteBtn = document.getElementById('emp-page-delete-btn');

  if (employeeSearch) employeeSearch.addEventListener('input', filterEmployeesLocal);
  if (employeeStatusFilter) employeeStatusFilter.addEventListener('change', filterEmployeesLocal);
  if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', openEmployeeModal);
  if (closeEmployeeModalBtn) closeEmployeeModalBtn.addEventListener('click', closeEmployeeModal);
  if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', closeEmployeeModal);
  if (employeeForm) employeeForm.addEventListener('submit', handleSaveEmployee);
  if (employeeBackBtn) employeeBackBtn.addEventListener('click', () => switchTab('employees'));

  if (empPageToggleBlockBtn) {
    empPageToggleBlockBtn.addEventListener('click', () => {
      if (!state.selectedEmployee) return;
      const isCurrentlySuspended = state.selectedEmployee.status === 'suspended';
      toggleEmployeeBlock(state.selectedEmployee.id, !isCurrentlySuspended, state.selectedEmployee.full_name || state.selectedEmployee.username);
    });
  }

  if (empPageDeleteBtn) {
    empPageDeleteBtn.addEventListener('click', async () => {
      if (!state.selectedEmployee) return;
      const id = state.selectedEmployee.id;
      const name = state.selectedEmployee.full_name || state.selectedEmployee.username || 'this employee';
      const ok = await showConfirmModal({
        title: `Are you sure you want to delete "${escapeHtml(name)}"?`,
        confirmText: 'Yes',
        cancelText: 'No',
        type: 'danger'
      });
      if (!ok) return;

      try {
        const res = await authFetch(ENDPOINTS.employeeDetail(id), {
          method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
          showToast(`Employee "${name}" removed from system.`, 'success', 'Account Deleted');
          switchTab('employees');
          loadEmployees();
          loadDashboardStats();
        } else {
          showToast(data.error || 'Could not delete employee', 'error');
        }
      } catch (err) {
        showToast('Communication error deleting employee.', 'error');
      }
    });
  }
}

