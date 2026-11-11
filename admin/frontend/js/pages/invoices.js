/**
 * MALAS ELECTRONICS — INVOICING & QUOTATION ENGINE CONTROLLER
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { authFetch } from '../services/api.js';
import { showToast, escapeHtml } from '../components/notifications.js';
import { updateNavBadge } from '../components/navigation.js';
import { switchTab } from '../router.js';
import { loadDashboardStats } from './dashboard.js';
import { loadProducts } from './products.js';

export function addToCart(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  const availableStock = prod.stock !== undefined && prod.stock !== null ? parseInt(prod.stock, 10) : 0;
  if (availableStock <= 0) {
    showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
    return;
  }

  const existing = state.cart.find(item => item.id === prod.id);
  if (existing) {
    if (existing.quantity >= availableStock) {
      showToast(`Cannot add more units. Available inventory for "${prod.name}" is ${availableStock}.`, 'warning', 'Stock Limit');
      return;
    }
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: prod.id,
      name: prod.name,
      model_number: prod.model_number || '',
      price: parseFloat(prod.price) || 0,
      stock: availableStock,
      quantity: 1,
      image_url: prod.image_url || ''
    });
  }

  updateCartBadge();
  openCartModal();
}

export function updateCartBadge() {
  const cartItemCount = document.getElementById('cart-item-count');
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartItemCount) cartItemCount.textContent = totalItems;
}

export function openCartModal() {
  clearInvoiceProductSelection();
  renderCart();
  const invoiceCartModal = document.getElementById('invoice-cart-modal');
  if (invoiceCartModal) invoiceCartModal.style.display = 'flex';
}

export function closeCartModal() {
  closeInvoiceSearchDropdown();
  const invoiceCartModal = document.getElementById('invoice-cart-modal');
  if (invoiceCartModal) invoiceCartModal.style.display = 'none';
}

function closeInvoiceSearchDropdown() {
  const dropdown = document.getElementById('invoice-search-results-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

function clearInvoiceProductSelection() {
  const input = document.getElementById('invoice-product-search-input');
  const hiddenVal = document.getElementById('invoice-product-picker-val');
  const clearBtn = document.getElementById('invoice-search-clear-btn');
  if (input) input.value = '';
  if (hiddenVal) hiddenVal.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  closeInvoiceSearchDropdown();
}

export function selectProductForInvoice(prod) {
  if (!prod) return;
  const availableStock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
  if (availableStock <= 0) {
    showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
    return;
  }

  const input = document.getElementById('invoice-product-search-input');
  const hiddenVal = document.getElementById('invoice-product-picker-val');
  const clearBtn = document.getElementById('invoice-search-clear-btn');
  const qtyInput = document.getElementById('invoice-picker-qty');

  if (hiddenVal) hiddenVal.value = prod.id;
  if (input) input.value = prod.name;
  if (clearBtn) clearBtn.style.display = 'block';
  closeInvoiceSearchDropdown();

  if (qtyInput) {
    qtyInput.focus();
    qtyInput.select();
  }
}

export function filterAndRenderInvoiceSearchResults(query = '') {
  const dropdown = document.getElementById('invoice-search-results-dropdown');
  if (!dropdown) return;

  const term = (query || '').toLowerCase().trim();
  let matches = state.products || [];

  if (term) {
    matches = matches.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.model_number && p.model_number.toLowerCase().includes(term)) ||
      (p.tagline && p.tagline.toLowerCase().includes(term)) ||
      (p.category_name && p.category_name.toLowerCase().includes(term))
    );
  }

  if (matches.length === 0) {
    dropdown.innerHTML = `<div class="invoice-search-empty">No equipment matches "${escapeHtml(term || '')}"</div>`;
    dropdown.style.display = 'block';
    return;
  }

  const sorted = [...matches].sort((a, b) => {
    const stockA = parseInt(a.stock || 0, 10);
    const stockB = parseInt(b.stock || 0, 10);
    if (stockA <= 0 && stockB > 0) return 1;
    if (stockA > 0 && stockB <= 0) return -1;
    return (a.name || '').localeCompare(b.name || '');
  });

  dropdown.innerHTML = sorted.map((prod, idx) => {
    const stock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
    const price = parseFloat(prod.price || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const isOut = stock <= 0;
    const isLow = stock > 0 && stock <= 5;
    const stockClass = isOut ? 'stock-out' : (isLow ? 'stock-low' : 'stock-ok');
    const stockLabel = isOut ? 'Out of stock' : (isLow ? `${stock} left (Low)` : `${stock} available`);

    const thumb = prod.image_url && prod.image_url.trim()
      ? `<img src="${escapeHtml(prod.image_url)}" class="invoice-search-item-thumb" alt="${escapeHtml(prod.name)}">`
      : `<div class="invoice-search-item-thumb">📦</div>`;

    return `
      <div class="invoice-search-item ${isOut ? 'item-out-of-stock' : ''}" 
           data-product-id="${prod.id}" 
           data-index="${idx}"
           onclick="window.malasSelectInvoiceProduct(${prod.id})">
        <div class="invoice-search-item-left">
          ${thumb}
          <div class="invoice-search-item-info">
            <span class="invoice-search-item-name">${escapeHtml(prod.name)}</span>
            <span class="invoice-search-item-model">${escapeHtml(prod.model_number || 'AV Hardware')}</span>
          </div>
        </div>
        <div class="invoice-search-item-right">
          <span class="invoice-search-item-price">AED ${price}</span>
          <span class="invoice-search-item-stock ${stockClass}">${stockLabel}</span>
        </div>
      </div>
    `;
  }).join('');

  dropdown.style.display = 'block';
}

export function handleAddProductToInvoice() {
  const hiddenVal = document.getElementById('invoice-product-picker-val');
  const searchInput = document.getElementById('invoice-product-search-input');
  const qtyInput = document.getElementById('invoice-picker-qty');

  let productId = parseInt(hiddenVal ? hiddenVal.value : 0, 10);

  if (!productId && searchInput && searchInput.value.trim()) {
    const term = searchInput.value.trim().toLowerCase();
    let matched = state.products.find(p => p.name && p.name.toLowerCase() === term);
    if (!matched) {
      matched = state.products.find(p =>
        parseInt(p.stock || 0, 10) > 0 &&
        ((p.name && p.name.toLowerCase().includes(term)) ||
         (p.model_number && p.model_number.toLowerCase().includes(term)))
      );
    }
    if (matched) productId = matched.id;
  }

  if (!productId) {
    showToast('Please search and select a hardware product first.', 'warning', 'No Product Selected');
    if (searchInput) {
      searchInput.focus();
      filterAndRenderInvoiceSearchResults(searchInput.value);
    }
    return;
  }

  const prod = state.products.find(p => p.id === productId);
  if (!prod) {
    showToast('Product not found in active catalog.', 'error');
    return;
  }

  const availableStock = parseInt(prod.stock !== undefined && prod.stock !== null ? prod.stock : 0, 10);
  if (availableStock <= 0) {
    showToast(`"${prod.name}" is currently out of stock.`, 'warning', 'Out of Stock');
    return;
  }

  const qtyToAdd = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
  const existing = state.cart.find(item => item.id === prod.id);

  if (existing) {
    if (existing.quantity + qtyToAdd > availableStock) {
      showToast(`Cannot add ${qtyToAdd} more units. Invoice already has ${existing.quantity}, max available is ${availableStock}.`, 'warning', 'Stock Limit');
      return;
    }
    existing.quantity += qtyToAdd;
    showToast(`Updated "${prod.name}" quantity to ${existing.quantity}.`, 'success', 'Product Updated');
  } else {
    if (qtyToAdd > availableStock) {
      showToast(`Requested quantity (${qtyToAdd}) exceeds available stock (${availableStock}).`, 'warning', 'Stock Limit');
      return;
    }
    state.cart.push({
      id: prod.id,
      name: prod.name,
      model_number: prod.model_number || '',
      price: parseFloat(prod.price) || 0,
      stock: availableStock,
      quantity: qtyToAdd,
      image_url: prod.image_url || ''
    });
    showToast(`Added ${qtyToAdd}x "${prod.name}" to invoice.`, 'success', 'Product Added');
  }

  clearInvoiceProductSelection();
  if (qtyInput) qtyInput.value = '1';

  updateCartBadge();
  renderCart();
}

export function renderCart() {
  const cartItemDistinctCount = document.getElementById('cart-item-distinct-count');
  if (cartItemDistinctCount) cartItemDistinctCount.textContent = state.cart.length;

  const tbody = document.getElementById('cart-table-body') || document.getElementById('cart-items-tbody');
  if (!tbody) return;

  if (state.cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No products added to invoice yet. Select a product above to add to this invoice.</td></tr>`;
    updateCartSummary();
    return;
  }

  tbody.innerHTML = state.cart.map((item, index) => {
    const lineTotal = item.price * item.quantity;
    return `
      <tr>
        <td>
          <strong>${escapeHtml(item.name)}</strong>
          ${item.model_number ? `<br><span class="font-mono text-muted" style="font-size:0.75rem;">${escapeHtml(item.model_number)}</span>` : ''}
        </td>
        <td class="font-mono" style="text-align: right;">
          AED ${item.price.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
        </td>
        <td style="text-align: center;">
          <div class="cart-qty-controls">
            <button type="button" class="btn-qty" onclick="window.malasChangeCartQty(${index}, -1)">-</button>
            <span class="font-mono" style="min-width:24px; display:inline-block; font-weight:700;">${item.quantity}</span>
            <button type="button" class="btn-qty" onclick="window.malasChangeCartQty(${index}, 1)">+</button>
          </div>
        </td>
        <td class="font-mono text-accent" style="text-align: right; font-weight:700;">
          AED ${lineTotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-remove-cart" onclick="window.malasRemoveFromCart(${index})" title="Remove item">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  updateCartSummary();
}

export function changeCartQty(index, delta) {
  const item = state.cart[index];
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    state.cart.splice(index, 1);
  } else if (newQty > item.stock) {
    showToast(`Cannot add more than ${item.stock} available units.`, 'warning', 'Stock Limit');
    return;
  } else {
    item.quantity = newQty;
  }

  updateCartBadge();
  renderCart();
}

export function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

export function updateCartSummary() {
  const cartDiscountInput = document.getElementById('cart-discount-input');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryVat = document.getElementById('summary-vat');
  const summaryGrandTotal = document.getElementById('summary-grand-total');

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = parseFloat(cartDiscountInput ? cartDiscountInput.value : 0) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vat = taxable * 0.05;
  const total = taxable + vat;

  if (summarySubtotal) summarySubtotal.textContent = `AED ${subtotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (summaryDiscount) summaryDiscount.textContent = `- AED ${discount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (summaryVat) summaryVat.textContent = `AED ${vat.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (summaryGrandTotal) summaryGrandTotal.textContent = `AED ${total.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
}

export async function handleFinalizeInvoice(e) {
  e.preventDefault();

  const cartClientName = document.getElementById('cart-client-name');
  const cartClientEmail = document.getElementById('cart-client-email');
  const cartClientPhone = document.getElementById('cart-client-phone');
  const cartProjectName = document.getElementById('cart-project-name');
  const cartDiscountInput = document.getElementById('cart-discount-input');
  const finalizeInvoiceForm = document.getElementById('finalize-invoice-form') || document.getElementById('invoice-finalize-form');

  if (state.cart.length === 0) {
    showToast('Please select at least one hardware product for the invoice.', 'warning');
    return;
  }

  const clientName = cartClientName ? cartClientName.value.trim() : '';
  if (!clientName) {
    showToast('Client Name is required.', 'warning');
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = parseFloat(cartDiscountInput ? cartDiscountInput.value : 0) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vatAmount = taxable * 0.05;
  const totalAmount = taxable + vatAmount;

  const invoicePayload = {
    client_name: clientName,
    client_email: cartClientEmail ? cartClientEmail.value.trim() : '',
    client_phone: cartClientPhone ? cartClientPhone.value.trim() : '',
    project_name: (cartProjectName && cartProjectName.value ? cartProjectName.value.trim() : '') || 'Commercial AV Procurement',
    items: state.cart,
    subtotal: subtotal,
    vat_rate: 5.0,
    vat_amount: vatAmount,
    discount: discount,
    total_amount: totalAmount
  };

  const isEditing = Boolean(state.editingInvoiceId);
  const targetUrl = isEditing ? ENDPOINTS.invoiceDetail(state.editingInvoiceId) : ENDPOINTS.invoices();
  const httpMethod = isEditing ? 'PUT' : 'POST';

  try {
    const res = await authFetch(targetUrl, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoicePayload)
    });
    const data = await res.json();

    if (data.success) {
      state.cart = [];
      updateCartBadge();
      closeCartModal();
      if (finalizeInvoiceForm) finalizeInvoiceForm.reset();
      resetInvoiceModalMode();

      loadDashboardStats();
      loadProducts();
      loadInvoices();

      const toastMsg = isEditing ? 'Invoice successfully updated.' : 'Official quotation invoice generated and stored.';
      showToast(toastMsg, 'success', isEditing ? 'Invoice Saved' : 'Invoice Finalized');

      if (data.invoice) {
        openInvoiceViewModal(data.invoice);
      } else {
        switchTab('invoices');
      }
    } else {
      showToast(data.error || 'Could not process invoice', 'error');
    }
  } catch (err) {
    showToast('Communication error processing invoice.', 'error');
  }
}

export function resetInvoiceModalMode() {
  state.editingInvoiceId = null;
  state.editingInvoiceNumber = null;
  const modalTitle = document.getElementById('invoice-modal-title');
  if (modalTitle) modalTitle.textContent = 'Create Commercial Invoice';
  const btnText = document.getElementById('finalize-btn-text');
  if (btnText) btnText.textContent = 'Finalize & Issue Invoice';
}

export async function loadInvoices() {
  const invoicesTableBody = document.getElementById('invoices-table-body');
  const invoiceSearch = document.getElementById('invoice-search');
  const badgeInvoices = document.getElementById('badge-invoices-count');
  const statInvoices = document.getElementById('stat-invoices');

  if (!invoicesTableBody) return;

  const search = invoiceSearch ? invoiceSearch.value.trim() : '';
  invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Loading quotations and invoices...</td></tr>`;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const res = await authFetch(ENDPOINTS.invoices(params.toString()));
    const data = await res.json();

    if (data.success) {
      state.invoices = data.invoices || [];
      updateNavBadge(badgeInvoices, state.invoices.length);
      if (statInvoices) statInvoices.textContent = state.invoices.length;
      renderInvoicesTable(state.invoices);
    } else {
      invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--status-red);">${data.error}</td></tr>`;
    }
  } catch (err) {
    invoicesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load invoices.</td></tr>`;
  }
}

export function renderInvoicesTable(invoices) {
  const invoicesTableBody = document.getElementById('invoices-table-body');
  if (!invoicesTableBody) return;

  if (!invoices || invoices.length === 0) {
    invoicesTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No quotations or invoices generated yet. Click "Create Invoice" above to issue one.</td></tr>`;
    return;
  }

  invoicesTableBody.innerHTML = invoices.map(inv => {
    const dateStr = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const totalFormatted = parseFloat(inv.total_amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 });
    const clientName = inv.client_name || 'Valued Client';
    const projName = inv.project_name || 'Bespoke AV Installation';
    const invNum = inv.invoice_number || `INV-${inv.id}`;

    return `
      <tr data-id="${inv.id}" class="invoice-row-card">
        <td class="col-inv-client">
          <strong class="inv-client-heading">${escapeHtml(clientName)}</strong>
        </td>
        <td class="col-inv-date date-cell">${dateStr}</td>
        <td class="col-inv-num font-mono text-accent font-bold">${escapeHtml(invNum)}</td>
        <td class="col-inv-proj text-muted">${escapeHtml(projName)}</td>
        <td class="col-inv-total font-mono font-bold">AED ${totalFormatted}</td>
        <td class="col-inv-action">
          <div class="inv-action-btn-group">
            <button type="button" class="btn-edit-inv" onclick="window.malasEditInvoice(${inv.id})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-view-inv" onclick="window.malasViewInvoice(${inv.id})">
              <span>View</span>
              <span class="action-arr">&rarr;</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function editInvoice(id) {
  const inv = state.invoices.find(item => item.id === id);
  if (!inv) return;

  state.editingInvoiceId = inv.id;
  state.editingInvoiceNumber = inv.invoice_number;

  let items = [];
  if (typeof inv.items === 'string') {
    try { items = JSON.parse(inv.items); } catch (e) {}
  } else if (Array.isArray(inv.items)) {
    items = inv.items;
  }

  state.cart = items.map(it => {
    const prod = state.products.find(p => p.id === it.id);
    const stock = prod ? parseInt(prod.stock || 999, 10) : (it.stock || 999);
    return {
      id: it.id,
      name: it.name || 'Hardware Asset',
      model_number: it.model_number || '',
      price: parseFloat(it.price) || 0,
      stock: Math.max(stock, parseInt(it.quantity, 10) || 1),
      quantity: parseInt(it.quantity, 10) || 1,
      image_url: it.image_url || ''
    };
  });

  const cartClientName = document.getElementById('cart-client-name');
  const cartClientEmail = document.getElementById('cart-client-email');
  const cartClientPhone = document.getElementById('cart-client-phone');
  const invoiceViewModal = document.getElementById('invoice-view-modal');
  const modalTitle = document.getElementById('invoice-modal-title');
  const btnText = document.getElementById('finalize-btn-text');

  if (cartClientName) cartClientName.value = inv.client_name || '';
  if (cartClientEmail) cartClientEmail.value = inv.client_email || '';
  if (cartClientPhone) cartClientPhone.value = inv.client_phone || '';
  if (modalTitle) modalTitle.textContent = `Edit Invoice (${inv.invoice_number})`;
  if (btnText) btnText.textContent = 'Save & Update Invoice';
  if (invoiceViewModal) invoiceViewModal.style.display = 'none';

  updateCartBadge();
  openCartModal();
}

export function openInvoiceViewModal(inv) {
  state.activeInvoiceForView = inv;

  const viewModalNumber = document.getElementById('view-modal-number');
  const printInvNum = document.getElementById('print-inv-num');
  const printInvDate = document.getElementById('print-inv-date');
  const printInvAuthor = document.getElementById('print-inv-author');
  const printClientName = document.getElementById('print-client-name');
  const printClientEmail = document.getElementById('print-client-email');
  const printClientPhone = document.getElementById('print-client-phone');
  const printProjectName = document.getElementById('print-project-name');
  const printItemsTbody = document.getElementById('print-items-tbody');

  const printSubtotal = document.getElementById('print-subtotal');
  const printDiscount = document.getElementById('print-discount');
  const printTaxable = document.getElementById('print-taxable');
  const printVat = document.getElementById('print-vat');
  const printTotal = document.getElementById('print-total');
  const invoiceViewModal = document.getElementById('invoice-view-modal');

  if (viewModalNumber) viewModalNumber.textContent = 'TAX INVOICE';
  if (printInvNum) printInvNum.textContent = inv.invoice_number || '';
  if (printInvDate) printInvDate.textContent = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');
  if (printInvAuthor) printInvAuthor.textContent = inv.created_by || 'Operations Dispatch';

  if (printClientName) printClientName.textContent = inv.client_name || 'Valued Client';
  if (printClientEmail) printClientEmail.textContent = inv.client_email || '';
  if (printClientPhone) printClientPhone.textContent = inv.client_phone || '';
  if (printProjectName) printProjectName.textContent = inv.project_name || '';

  let items = [];
  if (typeof inv.items === 'string') {
    try { items = JSON.parse(inv.items); } catch (e) {}
  } else if (Array.isArray(inv.items)) {
    items = inv.items;
  }

  if (printItemsTbody) {
    printItemsTbody.innerHTML = items.map((item, idx) => {
      const unit = parseFloat(item.price || 0);
      const qty = parseInt(item.quantity || 1, 10);
      const line = unit * qty;
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${escapeHtml(item.name || 'Hardware Asset')}</strong></td>
          <td class="font-mono" style="text-align:right;">AED ${unit.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
          <td class="font-mono" style="text-align:center;">${qty}</td>
          <td class="font-mono" style="text-align:right; font-weight:700;">AED ${line.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');
  }

  const sub = parseFloat(inv.subtotal || 0);
  const disc = parseFloat(inv.discount || 0);
  const tax = Math.max(0, sub - disc);
  const vat = parseFloat(inv.vat_amount || 0);
  const tot = parseFloat(inv.total_amount || 0);

  if (printSubtotal) printSubtotal.textContent = `AED ${sub.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (printDiscount) printDiscount.textContent = `- AED ${disc.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (printTaxable) printTaxable.textContent = `AED ${tax.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (printVat) printVat.textContent = `AED ${vat.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
  if (printTotal) printTotal.textContent = `AED ${tot.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;

  if (invoiceViewModal) invoiceViewModal.style.display = 'flex';
}

export function closeInvoiceViewModal() {
  const invoiceViewModal = document.getElementById('invoice-view-modal');
  if (invoiceViewModal) invoiceViewModal.style.display = 'none';
  state.activeInvoiceForView = null;
}

export function handleExportExcel() {
  if (!state.activeInvoiceForView) return;
  const inv = state.activeInvoiceForView;

  let items = [];
  if (typeof inv.items === 'string') {
    try { items = JSON.parse(inv.items); } catch (e) {}
  } else if (Array.isArray(inv.items)) {
    items = inv.items;
  }

  const excelRows = [
    ['MALAS ELECTRONICS LLC — OFFICIAL COMMERCIAL QUOTATION'],
    ['Tax Registration No (TRN):', '100482910300003'],
    ['Invoice Number:', inv.invoice_number],
    ['Date:', inv.created_at || new Date().toISOString()],
    ['Client Name:', inv.client_name],
    ['Client Email:', inv.client_email || ''],
    ['Project:', inv.project_name || ''],
    [],
    ['#', 'Item Description', 'Unit Price (AED)', 'Quantity', 'Line Total (AED)']
  ];

  items.forEach((it, i) => {
    const u = parseFloat(it.price || 0);
    const q = parseInt(it.quantity || 1, 10);
    excelRows.push([i + 1, it.name, u, q, u * q]);
  });

  excelRows.push([]);
  excelRows.push(['', '', 'Subtotal:', parseFloat(inv.subtotal || 0)]);
  excelRows.push(['', '', 'Discount:', parseFloat(inv.discount || 0)]);
  excelRows.push(['', '', 'UAE VAT (5%):', parseFloat(inv.vat_amount || 0)]);
  excelRows.push(['', '', 'Grand Total (AED):', parseFloat(inv.total_amount || 0)]);

  if (window.XLSX) {
    const ws = window.XLSX.utils.aoa_to_sheet(excelRows);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
    window.XLSX.writeFile(wb, `${inv.invoice_number}_Malas_Electronics.xlsx`);
  } else {
    showToast('Excel export engine is initializing. Please try again.', 'info');
  }
}

export function handleExportPdf() {
  const element = document.getElementById('invoice-printable-template');
  if (!element) return;

  const invNum = state.activeInvoiceForView ? state.activeInvoiceForView.invoice_number : 'Invoice';

  if (window.html2pdf) {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${invNum}_Malas_Electronics.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save();
  } else {
    window.print();
  }
}

export function initInvoicesPage() {
  window.malasAddToCart = addToCart;
  window.malasSelectInvoiceProduct = (productId) => {
    const prod = state.products.find(p => p.id === productId);
    if (prod) selectProductForInvoice(prod);
  };
  window.malasChangeCartQty = changeCartQty;
  window.malasRemoveFromCart = removeFromCart;
  window.malasEditInvoice = editInvoice;
  window.malasViewInvoice = (id) => {
    const inv = state.invoices.find(item => item.id === id);
    if (inv) openInvoiceViewModal(inv);
  };

  const newInvoiceTabBtn = document.getElementById('new-invoice-from-tab-btn');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartModalBtn = document.getElementById('close-cart-modal-btn');
  const cartContinueShoppingBtn = document.getElementById('cart-continue-shopping-btn');
  const cartClearAllBtn = document.getElementById('cart-clear-all-btn');
  const finalizeInvoiceForm = document.getElementById('finalize-invoice-form') || document.getElementById('invoice-finalize-form');
  const cartDiscountInput = document.getElementById('cart-discount-input');

  const invoiceProductSearchInput = document.getElementById('invoice-product-search-input');
  const invoiceSearchClearBtn = document.getElementById('invoice-search-clear-btn');
  const invoiceAddItemBtn = document.getElementById('invoice-add-item-btn');
  const invoicePickerQty = document.getElementById('invoice-picker-qty');
  const invoicePickerQtyDec = document.getElementById('invoice-picker-qty-dec');
  const invoicePickerQtyInc = document.getElementById('invoice-picker-qty-inc');

  const invoiceSearch = document.getElementById('invoice-search');
  const closeInvoiceViewBtn = document.getElementById('close-invoice-view-btn');
  const exportExcelBtn = document.getElementById('export-excel-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const printInvoiceBtn = document.getElementById('print-invoice-btn');

  if (newInvoiceTabBtn) {
    newInvoiceTabBtn.addEventListener('click', () => {
      resetInvoiceModalMode();
      openCartModal();
    });
  }
  if (openCartBtn) openCartBtn.addEventListener('click', openCartModal);
  if (closeCartModalBtn) closeCartModalBtn.addEventListener('click', closeCartModal);
  if (cartContinueShoppingBtn) cartContinueShoppingBtn.addEventListener('click', closeCartModal);

  if (cartClearAllBtn) {
    cartClearAllBtn.addEventListener('click', () => {
      state.cart = [];
      updateCartBadge();
      renderCart();
      showToast('Invoice line items cleared.', 'info');
    });
  }

  if (finalizeInvoiceForm) finalizeInvoiceForm.addEventListener('submit', handleFinalizeInvoice);
  if (cartDiscountInput) cartDiscountInput.addEventListener('input', updateCartSummary);

  if (invoiceProductSearchInput) {
    invoiceProductSearchInput.addEventListener('input', (e) => filterAndRenderInvoiceSearchResults(e.target.value));
    invoiceProductSearchInput.addEventListener('focus', (e) => filterAndRenderInvoiceSearchResults(e.target.value));
  }
  if (invoiceSearchClearBtn) invoiceSearchClearBtn.addEventListener('click', clearInvoiceProductSelection);
  if (invoiceAddItemBtn) invoiceAddItemBtn.addEventListener('click', handleAddProductToInvoice);

  if (invoicePickerQtyDec && invoicePickerQty) {
    invoicePickerQtyDec.addEventListener('click', () => {
      invoicePickerQty.value = Math.max(1, (parseInt(invoicePickerQty.value, 10) || 1) - 1);
    });
  }
  if (invoicePickerQtyInc && invoicePickerQty) {
    invoicePickerQtyInc.addEventListener('click', () => {
      invoicePickerQty.value = (parseInt(invoicePickerQty.value, 10) || 1) + 1;
    });
  }

  if (invoiceSearch) invoiceSearch.addEventListener('input', () => loadInvoices());
  if (closeInvoiceViewBtn) closeInvoiceViewBtn.addEventListener('click', closeInvoiceViewModal);
  if (exportExcelBtn) exportExcelBtn.addEventListener('click', handleExportExcel);
  if (exportPdfBtn) exportPdfBtn.addEventListener('click', handleExportPdf);
  if (printInvoiceBtn) printInvoiceBtn.addEventListener('click', () => window.print());
}

