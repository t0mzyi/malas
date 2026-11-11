/**
 * MALAS ELECTRONICS — HARDWARE CATALOG & INVENTORY CONTROLLER
 */

import { state } from '../state.js';
import { ENDPOINTS } from '../config.js';
import { authFetch } from '../services/api.js';
import { showToast, showConfirmModal, escapeHtml } from '../components/notifications.js';
import { updateNavBadge } from '../components/navigation.js';
import { loadDashboardStats } from './dashboard.js';

export async function loadProducts() {
  const productsGrid = document.getElementById('products-grid-container');
  const badgeProducts = document.getElementById('badge-products-count');
  const statProducts = document.getElementById('stat-products');

  if (productsGrid) {
    productsGrid.innerHTML = `<div class="empty-state">Loading hardware catalog...</div>`;
  }

  try {
    const res = await authFetch(ENDPOINTS.products());
    const data = await res.json();

    if (data.success) {
      state.products = data.products || [];
      updateNavBadge(badgeProducts, state.products.length);
      if (statProducts) statProducts.textContent = state.products.length;
      renderProductsGrid(state.products);
    } else {
      if (productsGrid) {
        productsGrid.innerHTML = `<div class="empty-state" style="color:var(--status-red);">${data.error}</div>`;
      }
    }
  } catch (err) {
    if (productsGrid) {
      productsGrid.innerHTML = `<div class="empty-state">Failed to load hardware catalog.</div>`;
    }
  }
}

export function filterProductsLocal() {
  const productSearch = document.getElementById('product-search');
  const productStockFilter = document.getElementById('product-stock-filter');
  const productSortSelect = document.getElementById('product-sort-select');

  const term = (productSearch ? productSearch.value : '').toLowerCase().trim();
  const stockFilter = (productStockFilter ? productStockFilter.value : 'all');
  const sortBy = (productSortSelect ? productSortSelect.value : 'newest');

  let filtered = state.products;

  if (term) {
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.tagline && p.tagline.toLowerCase().includes(term))
    );
  }

  if (stockFilter === 'in_stock') {
    filtered = filtered.filter(p => parseInt(p.stock || 0, 10) > 5);
  } else if (stockFilter === 'low_stock') {
    filtered = filtered.filter(p => {
      const s = parseInt(p.stock || 0, 10);
      return s >= 1 && s <= 5;
    });
  } else if (stockFilter === 'out_of_stock') {
    filtered = filtered.filter(p => parseInt(p.stock || 0, 10) <= 0);
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'price_asc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sortBy === 'price_desc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    if (sortBy === 'stock_desc') return (parseInt(b.stock, 10) || 0) - (parseInt(a.stock, 10) || 0);
    if (sortBy === 'stock_asc') return (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0);
    return (b.id || 0) - (a.id || 0);
  });

  renderProductsGrid(filtered);
}

export function renderProductsGrid(products) {
  const productsGrid = document.getElementById('products-grid-container');
  if (!productsGrid) return;

  if (!products || products.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center;">
        <div style="font-size: 2.2rem; margin-bottom: 12px; opacity: 0.7;">📦</div>
        <h4 style="color: #F8FAFC; margin-bottom: 6px; font-size: 1.15rem;">No Hardware Products Found</h4>
        <p style="color: #94A3B8; font-size: 0.86rem; max-width: 440px; margin: 0 auto 20px;">
          No items match your active search or stock criteria. Click below to add new equipment to the catalog.
        </p>
        <button type="button" class="btn-primary-action btn-sm" onclick="window.malasOpenAddProductModal()" style="margin: 0 auto;">
          + Add First Hardware Item
        </button>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = products.map(p => {
    const priceFormatted = parseFloat(p.price || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const stock = parseInt(p.stock !== undefined && p.stock !== null ? p.stock : 0, 10);
    const isOutOfStock = stock <= 0;
    const stockBadgeClass = isOutOfStock ? 'stock-badge-out' : (stock <= 5 ? 'stock-badge-low' : 'stock-badge-ok');
    const stockLabel = isOutOfStock ? 'Out of stocks' : (stock <= 5 ? `Low stocks (${stock})` : `${stock} in stocks`);
    const hasImage = Boolean(p.image_url && p.image_url.trim());

    return `
      <div class="product-card product-card-immersive" data-id="${p.id}">
        <div class="product-immersive-media">
          ${hasImage ? `
            <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" class="product-immersive-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
          ` : ''}
          <div class="product-placeholder-icon-wrap" style="${hasImage ? 'display:none;' : 'display:flex;'}">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span class="product-placeholder-label">Hardware Item</span>
          </div>
        </div>

        <div class="product-top-bar">
          <span class="product-stock-pill ${stockBadgeClass}" onclick="window.malasOpenStockModal(${p.id})" title="Click to adjust inventory stock" style="cursor: pointer;">
            <span class="stock-dot"></span>
            ${stockLabel}
          </span>
        </div>

        <div class="product-immersive-overlay">
          <div class="product-immersive-meta">
            <h3 class="product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            ${p.tagline ? `<p class="product-tagline" title="${escapeHtml(p.tagline)}">${escapeHtml(p.tagline)}</p>` : ''}
          </div>

          <div class="product-price-display">
            <span class="product-price-val font-mono"><small>AED</small> ${priceFormatted}</span>
          </div>

          <div class="product-card-footer">
            <button type="button" class="btn-product-edit" onclick="window.malasEditProduct(${p.id})" title="Edit Product Specs & Price">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-product-delete" onclick="window.malasDeleteProduct(${p.id}, '${escapeHtml(p.name)}')" title="Delete Product">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function openProductModal(prod = null) {
  const productForm = document.getElementById('product-form');
  const productModalTitle = document.getElementById('product-modal-title');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productTaglineInput = document.getElementById('product-tagline');
  const productPriceInput = document.getElementById('product-price');
  const productStockInput = document.getElementById('product-stock');
  const deleteModalProductBtn = document.getElementById('delete-modal-product-btn');
  const productModal = document.getElementById('product-modal');
  const directUrlInputContainer = document.getElementById('direct-url-input-container');
  const btnToggleUrlInput = document.getElementById('btn-toggle-url-input');

  if (productForm) productForm.reset();
  resetDropzoneToEmpty();
  if (directUrlInputContainer) directUrlInputContainer.style.display = 'none';
  if (btnToggleUrlInput) btnToggleUrlInput.textContent = '🔗 Or paste an existing image URL';

  if (prod) {
    if (productModalTitle) productModalTitle.textContent = 'Edit Hardware Product';
    if (productIdInput) productIdInput.value = prod.id;
    if (productNameInput) productNameInput.value = prod.name || '';
    if (productTaglineInput) productTaglineInput.value = prod.tagline || '';
    if (productPriceInput) productPriceInput.value = (prod.price !== undefined && prod.price !== null && prod.price > 0) ? prod.price : '';
    if (productStockInput) productStockInput.value = prod.stock !== undefined ? prod.stock : 10;
    
    if (prod.image_url) {
      setDropzonePreview(prod.image_url);
    }
    if (deleteModalProductBtn) deleteModalProductBtn.style.display = 'inline-block';
  } else {
    if (productModalTitle) productModalTitle.textContent = 'Add Hardware Product';
    if (productIdInput) productIdInput.value = '';
    if (productNameInput) productNameInput.value = '';
    if (productTaglineInput) productTaglineInput.value = '';
    if (productPriceInput) productPriceInput.value = '';
    if (productStockInput) productStockInput.value = '10';
    if (deleteModalProductBtn) deleteModalProductBtn.style.display = 'none';
  }

  if (productModal) productModal.style.display = 'flex';
}

export function closeProductModal() {
  const productModal = document.getElementById('product-modal');
  if (productModal) productModal.style.display = 'none';
}

export async function handleSaveProduct(e) {
  e.preventDefault();
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productTaglineInput = document.getElementById('product-tagline');
  const productPriceInput = document.getElementById('product-price');
  const productStockInput = document.getElementById('product-stock');
  const productImageInput = document.getElementById('product-image');

  const id = productIdInput ? productIdInput.value : '';
  const isEdit = Boolean(id);

  const payload = {
    name: productNameInput.value.trim(),
    tagline: productTaglineInput ? productTaglineInput.value.trim() : '',
    price: (productPriceInput && productPriceInput.value.trim() !== '') ? parseFloat(productPriceInput.value) : 0,
    stock: parseInt(productStockInput.value, 10) || 0,
    image_url: productImageInput ? productImageInput.value.trim() : '',
    status: 'active'
  };

  if (!payload.name) {
    showToast('Product Name is required.', 'warning');
    return;
  }

  const endpoint = isEdit ? ENDPOINTS.productDetail(id) : ENDPOINTS.products();
  const method = isEdit ? 'PATCH' : 'POST';

  try {
    const res = await authFetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      closeProductModal();
      loadProducts();
      loadDashboardStats();
      showToast(`Product "${payload.name}" saved successfully.`, 'success', 'Catalog Updated');
    } else {
      showToast(data.error || 'Could not save product', 'error');
    }
  } catch (err) {
    showToast('Communication error saving product.', 'error');
  }
}

export async function deleteProduct(id, name = 'this product') {
  const confirmed = await showConfirmModal({
    title: `Are you sure you want to delete "${escapeHtml(name)}"?`,
    confirmText: 'Yes',
    cancelText: 'No',
    type: 'danger'
  });

  if (!confirmed) return;

  try {
    const res = await authFetch(ENDPOINTS.productDetail(id), {
      method: 'DELETE'
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Product "${name}" deleted from catalog.`, 'success', 'Item Deleted');
      closeProductModal();
      loadProducts();
      loadDashboardStats();
    } else {
      showToast(data.error || 'Could not delete product', 'error');
    }
  } catch (err) {
    showToast('Communication error deleting product.', 'error');
  }
}

export function setDropzonePreview(url) {
  const productImageInput = document.getElementById('product-image');
  const productImageNewUrlInput = document.getElementById('product-image-url-input');
  const cloudinaryImgPreview = document.getElementById('cloudinary-img-preview');
  const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
  const dropzoneUploadingState = document.getElementById('dropzone-uploading-state');
  const dropzonePreviewState = document.getElementById('dropzone-preview-state');

  if (productImageInput) productImageInput.value = url;
  if (productImageNewUrlInput) productImageNewUrlInput.value = url.startsWith('data:') ? '' : url;
  if (cloudinaryImgPreview) cloudinaryImgPreview.src = url;

  if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
  if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
  if (dropzonePreviewState) dropzonePreviewState.style.display = 'flex';
}

export function resetDropzoneToEmpty() {
  const productImageInput = document.getElementById('product-image');
  const productImageNewUrlInput = document.getElementById('product-image-url-input');
  const cloudinaryFileInput = document.getElementById('cloudinary-file-input');
  const cloudinaryImgPreview = document.getElementById('cloudinary-img-preview');
  const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
  const dropzoneUploadingState = document.getElementById('dropzone-uploading-state');
  const dropzonePreviewState = document.getElementById('dropzone-preview-state');

  if (productImageInput) productImageInput.value = '';
  if (productImageNewUrlInput) productImageNewUrlInput.value = '';
  if (cloudinaryFileInput) cloudinaryFileInput.value = '';
  if (cloudinaryImgPreview) cloudinaryImgPreview.src = '';

  if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
  if (dropzonePreviewState) dropzonePreviewState.style.display = 'none';
  if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'flex';
}

export async function processImageUploadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WebP, GIF).', 'warning');
    return;
  }

  const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
  const dropzonePreviewState = document.getElementById('dropzone-preview-state');
  const dropzoneUploadingState = document.getElementById('dropzone-uploading-state');
  const saveProductBtn = document.getElementById('save-product-btn');

  if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
  if (dropzonePreviewState) dropzonePreviewState.style.display = 'none';
  if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'flex';

  if (saveProductBtn) {
    saveProductBtn.disabled = true;
    saveProductBtn.textContent = 'Uploading Image...';
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64Data = event.target.result;
    try {
      const res = await authFetch(ENDPOINTS.upload(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const data = await res.json();

      if (data.success && data.url) {
        setDropzonePreview(data.url);
        showToast('Image uploaded successfully.', 'success', 'Image Uploaded');
      } else {
        setDropzonePreview(base64Data);
        showToast('Image attached.', 'info');
      }
    } catch (err) {
      setDropzonePreview(base64Data);
    } finally {
      if (dropzoneUploadingState) dropzoneUploadingState.style.display = 'none';
      if (saveProductBtn) {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'Save Product';
      }
    }
  };

  reader.onerror = () => {
    resetDropzoneToEmpty();
    if (saveProductBtn) {
      saveProductBtn.disabled = false;
      saveProductBtn.textContent = 'Save Product';
    }
    showToast('Could not read the selected image file.', 'error');
  };

  reader.readAsDataURL(file);
}

export function openStockModal(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  const stockAdjustProductId = document.getElementById('stock-adjust-product-id');
  const stockAdjustProductName = document.getElementById('stock-adjust-product-name');
  const stockAdjustSku = document.getElementById('stock-adjust-sku');
  const stockAdjustQty = document.getElementById('stock-adjust-qty');
  const stockModal = document.getElementById('stock-modal');

  if (stockAdjustProductId) stockAdjustProductId.value = prod.id;
  if (stockAdjustProductName) stockAdjustProductName.textContent = prod.name;
  if (stockAdjustSku) stockAdjustSku.textContent = prod.model_number || 'No SKU';
  if (stockAdjustQty) stockAdjustQty.value = prod.stock !== undefined ? prod.stock : 0;
  if (stockModal) stockModal.style.display = 'flex';
}

export function closeStockModal() {
  const stockModal = document.getElementById('stock-modal');
  if (stockModal) stockModal.style.display = 'none';
}

export async function handleSaveQuickStock(e) {
  e.preventDefault();
  const stockAdjustProductId = document.getElementById('stock-adjust-product-id');
  const stockAdjustQty = document.getElementById('stock-adjust-qty');

  const id = stockAdjustProductId ? stockAdjustProductId.value : '';
  const stock = parseInt(stockAdjustQty ? stockAdjustQty.value : '0', 10);

  try {
    const res = await authFetch(ENDPOINTS.productStock(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: stock })
    });
    const data = await res.json();

    if (data.success) {
      closeStockModal();
      loadProducts();
      showToast(`Stock updated to ${stock} units.`, 'success', 'Inventory Adjusted');
    } else {
      showToast(data.error || 'Could not update inventory stock', 'error');
    }
  } catch (err) {
    showToast('Communication error updating stock.', 'error');
  }
}

export function initProductsPage() {
  window.malasOpenAddProductModal = () => openProductModal(null);
  window.malasEditProduct = (id) => {
    const prod = state.products.find(p => p.id === id);
    if (prod) openProductModal(prod);
  };
  window.malasDeleteProduct = deleteProduct;
  window.malasOpenStockModal = openStockModal;

  const addProductBtn = document.getElementById('add-product-btn');
  const closeProductModalBtn = document.getElementById('close-product-modal-btn');
  const cancelProductBtn = document.getElementById('cancel-product-btn');
  const productForm = document.getElementById('product-form');
  const deleteModalProductBtn = document.getElementById('delete-modal-product-btn');
  const productSearch = document.getElementById('product-search');
  const productStockFilter = document.getElementById('product-stock-filter');
  const productSortSelect = document.getElementById('product-sort-select');

  // Dropzone elements
  const btnTriggerFile = document.getElementById('btn-trigger-file');
  const cloudinaryFileInput = document.getElementById('cloudinary-file-input');
  const removeImgBtn = document.getElementById('remove-img-btn');
  const btnReplaceImg = document.getElementById('btn-replace-img');
  const btnToggleUrlInput = document.getElementById('btn-toggle-url-input');
  const directUrlInputContainer = document.getElementById('direct-url-input-container');
  const productImageNewUrlInput = document.getElementById('product-image-url-input');
  const imageUploadDropzone = document.getElementById('image-upload-dropzone');

  // Stock modal elements
  const closeStockModalBtn = document.getElementById('close-stock-modal-btn');
  const cancelStockModalBtn = document.getElementById('cancel-stock-modal-btn');
  const stockForm = document.getElementById('stock-form');
  const stockQtyDec = document.getElementById('stock-qty-dec');
  const stockQtyInc = document.getElementById('stock-qty-inc');
  const stockAdjustQty = document.getElementById('stock-adjust-qty');

  if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal(null));
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);
  if (productForm) productForm.addEventListener('submit', handleSaveProduct);

  if (deleteModalProductBtn) {
    deleteModalProductBtn.addEventListener('click', () => {
      const productIdInput = document.getElementById('product-id');
      const productNameInput = document.getElementById('product-name');
      if (productIdInput && productIdInput.value) {
        deleteProduct(Number(productIdInput.value), productNameInput ? productNameInput.value : '');
      }
    });
  }

  if (productSearch) productSearch.addEventListener('input', filterProductsLocal);
  if (productStockFilter) productStockFilter.addEventListener('change', filterProductsLocal);
  if (productSortSelect) productSortSelect.addEventListener('change', filterProductsLocal);

  // File picker bindings
  if (btnTriggerFile && cloudinaryFileInput) {
    btnTriggerFile.addEventListener('click', () => cloudinaryFileInput.click());
  }
  if (btnReplaceImg && cloudinaryFileInput) {
    btnReplaceImg.addEventListener('click', () => cloudinaryFileInput.click());
  }
  if (cloudinaryFileInput) {
    cloudinaryFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) processImageUploadFile(e.target.files[0]);
    });
  }
  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', resetDropzoneToEmpty);
  }

  if (btnToggleUrlInput && directUrlInputContainer) {
    btnToggleUrlInput.addEventListener('click', () => {
      const isVisible = directUrlInputContainer.style.display !== 'none';
      directUrlInputContainer.style.display = isVisible ? 'none' : 'block';
      btnToggleUrlInput.textContent = isVisible ? '🔗 Or paste an existing image URL' : '✕ Hide URL Input';
    });
  }
  if (productImageNewUrlInput) {
    productImageNewUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) setDropzonePreview(url);
    });
  }

  // Drag and drop events
  if (imageUploadDropzone) {
    ['dragenter', 'dragover'].forEach(name => {
      imageUploadDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageUploadDropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      imageUploadDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageUploadDropzone.classList.remove('dragover');
      });
    });
    imageUploadDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageUploadFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Stock adjustments
  if (closeStockModalBtn) closeStockModalBtn.addEventListener('click', closeStockModal);
  if (cancelStockModalBtn) cancelStockModalBtn.addEventListener('click', closeStockModal);
  if (stockForm) stockForm.addEventListener('submit', handleSaveQuickStock);
  if (stockQtyDec && stockAdjustQty) {
    stockQtyDec.addEventListener('click', () => {
      stockAdjustQty.value = Math.max(0, (parseInt(stockAdjustQty.value, 10) || 0) - 1);
    });
  }
  if (stockQtyInc && stockAdjustQty) {
    stockQtyInc.addEventListener('click', () => {
      stockAdjustQty.value = (parseInt(stockAdjustQty.value, 10) || 0) + 1;
    });
  }
}

