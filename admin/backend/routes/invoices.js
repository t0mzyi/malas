const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/invoices
 * List all invoices
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `invoices` ORDER BY `created_at` DESC');
    
    // Parse items JSON for each invoice
    const formatted = rows.map(inv => {
      let parsedItems = [];
      try {
        parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []);
      } catch (e) {
        parsedItems = [];
      }
      return {
        ...inv,
        items: parsedItems
      };
    });

    return res.json({ success: true, count: formatted.length, invoices: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/invoices/:id
 * Get single invoice detail
 */
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM `invoices` WHERE id = ? OR invoice_number = ? LIMIT 1', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    const inv = rows[0];
    let parsedItems = [];
    try {
      parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []);
    } catch (e) {
      parsedItems = [];
    }

    return res.json({
      success: true,
      invoice: {
        ...inv,
        items: parsedItems
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/invoices
 * Finalize & issue a new invoice with real-time stock deduction
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    client_name,
    client_email,
    client_phone,
    project_name,
    items,
    discount = 0,
    vat_rate = 5,
    status = 'finalized'
  } = req.body;

  if (!client_name || !client_name.trim()) {
    return res.status(400).json({ success: false, error: 'Client or Company Name is required.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one product item must be added to the invoice.' });
  }

  const creatorName = req.admin ? (req.admin.fullName || req.admin.email || req.admin.username) : 'Staff';

  try {
    // 1. Verify and validate stock for each item
    for (const item of items) {
      const productId = item.id;
      const requestedQty = parseInt(item.quantity, 10) || 1;

      if (productId) {
        const [prodRows] = await pool.query('SELECT id, name, stock, price FROM `products` WHERE id = ? LIMIT 1', [productId]);
        if (prodRows.length > 0) {
          const currentStock = prodRows[0].stock !== undefined && prodRows[0].stock !== null ? prodRows[0].stock : 10;
          if (currentStock < requestedQty) {
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for "${prodRows[0].name}". Current stock: ${currentStock}, requested in cart: ${requestedQty}.`
            });
          }
        }
      }
    }

    // 2. Calculate subtotal, discount, VAT, and grand total
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const unitPrice = parseFloat(item.price) || 0;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        id: item.id || null,
        name: item.name || 'Custom Hardware / Service',
        model_number: item.model_number || '',
        price: unitPrice,
        quantity: qty,
        total: lineTotal,
        image_url: item.image_url || ''
      };
    });

    const numDiscount = Math.max(0, parseFloat(discount) || 0);
    const taxableAmount = Math.max(0, subtotal - numDiscount);
    const numVatRate = parseFloat(vat_rate) >= 0 ? parseFloat(vat_rate) : 5;
    const vatAmount = (taxableAmount * numVatRate) / 100;
    const totalAmount = taxableAmount + vatAmount;

    // 3. Generate unique invoice number: INV-2026-XXXX
    const year = new Date().getFullYear();
    const [[countRow]] = await pool.query('SELECT COUNT(*) as count FROM `invoices`');
    const seq = String((countRow ? countRow.count : 0) + 101).padStart(4, '0');
    const invoiceNumber = `INV-${year}-${seq}`;

    // 4. Insert Invoice Record
    const [result] = await pool.query(
      `INSERT INTO \`invoices\`
       (invoice_number, client_name, client_email, client_phone, project_name, items, subtotal, vat_rate, vat_amount, discount, total_amount, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        client_name.trim(),
        client_email ? client_email.trim() : '',
        client_phone ? client_phone.trim() : '',
        project_name ? project_name.trim() : 'Malas Commercial Project',
        JSON.stringify(sanitizedItems),
        subtotal,
        numVatRate,
        vatAmount,
        numDiscount,
        totalAmount,
        status,
        creatorName
      ]
    );

    // 5. Deduct Stock for all inventory products
    for (const item of sanitizedItems) {
      if (item.id) {
        await pool.query(
          'UPDATE `products` SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
        // If stock is now 0, optionally flag out of stock
        await pool.query(
          "UPDATE `products` SET status = 'out_of_stock' WHERE id = ? AND stock <= 0",
          [item.id]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoiceNumber} finalized successfully and inventory deducted.`,
      invoice: {
        id: result.insertId,
        invoice_number: invoiceNumber,
        client_name: client_name.trim(),
        client_email: client_email ? client_email.trim() : '',
        client_phone: client_phone ? client_phone.trim() : '',
        project_name: project_name ? project_name.trim() : '',
        items: sanitizedItems,
        subtotal,
        vat_rate: numVatRate,
        vat_amount: vatAmount,
        discount: numDiscount,
        total_amount: totalAmount,
        status,
        created_by: creatorName,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/invoices/:id
 * Update an existing invoice
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    client_name,
    client_email,
    client_phone,
    project_name,
    items,
    discount = 0,
    vat_rate = 5
  } = req.body;

  if (!client_name || !client_name.trim()) {
    return res.status(400).json({ success: false, error: 'Client or Company Name is required.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one product item must be added to the invoice.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM `invoices` WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const unitPrice = parseFloat(item.price) || 0;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        id: item.id || null,
        name: item.name || 'Custom Hardware / Service',
        model_number: item.model_number || '',
        price: unitPrice,
        quantity: qty,
        total: lineTotal,
        image_url: item.image_url || ''
      };
    });

    const numDiscount = Math.max(0, parseFloat(discount) || 0);
    const taxableAmount = Math.max(0, subtotal - numDiscount);
    const numVatRate = parseFloat(vat_rate) >= 0 ? parseFloat(vat_rate) : 5;
    const vatAmount = (taxableAmount * numVatRate) / 100;
    const totalAmount = taxableAmount + vatAmount;

    await pool.query(
      `UPDATE \`invoices\` SET
        client_name = ?,
        client_email = ?,
        client_phone = ?,
        project_name = ?,
        items = ?,
        subtotal = ?,
        vat_rate = ?,
        vat_amount = ?,
        discount = ?,
        total_amount = ?
       WHERE id = ?`,
      [
        client_name.trim(),
        client_email ? client_email.trim() : '',
        client_phone ? client_phone.trim() : '',
        project_name ? project_name.trim() : 'Malas Commercial Project',
        JSON.stringify(sanitizedItems),
        subtotal,
        numVatRate,
        vatAmount,
        numDiscount,
        totalAmount,
        id
      ]
    );

    const [updatedRows] = await pool.query('SELECT * FROM `invoices` WHERE id = ? LIMIT 1', [id]);
    const updatedInv = updatedRows[0];
    updatedInv.items = sanitizedItems;

    return res.json({
      success: true,
      message: 'Invoice updated successfully.',
      invoice: updatedInv
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/invoices/:id
 * Delete an invoice record
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id FROM `invoices` WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    await pool.query('DELETE FROM `invoices` WHERE id = ?', [id]);
    return res.json({ success: true, message: `Invoice deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

