const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/products
 * List products with optional category and search filters
 */
router.get('/', requireAuth, async (req, res) => {
  const { category_id, search, status } = req.query;

  try {
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id && category_id !== 'all') {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (status && status !== 'all') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.model_number LIKE ? OR p.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, products: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/products
 * Add new product (Anyone authenticated can add)
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    category_id,
    name,
    model_number,
    tagline,
    description,
    specifications,
    image_url,
    price = 0,
    stock = 0,
    status = 'active'
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Product Name is required.' });
  }

  const creatorName = req.admin ? (req.admin.fullName || req.admin.username) : 'Staff';
  const numericPrice = parseFloat(price) || 0;
  const numericStock = parseInt(stock, 10) || 0;

  try {
    const [result] = await pool.query(
      `INSERT INTO \`products\` 
       (category_id, name, model_number, price, stock, tagline, description, specifications, image_url, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id ? parseInt(category_id, 10) : null,
        name.trim(),
        model_number ? model_number.trim() : null,
        numericPrice,
        numericStock,
        tagline ? tagline.trim() : null,
        description ? description.trim() : null,
        specifications ? specifications.trim() : null,
        image_url ? image_url.trim() : null,
        status,
        creatorName
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product registered in catalog.',
      productId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/products/:id
 * Update product
 */
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    category_id,
    name,
    model_number,
    price,
    stock,
    tagline,
    description,
    specifications,
    image_url,
    status
  } = req.body;

  try {
    const updates = [];
    const params = [];

    if (category_id !== undefined) {
      updates.push('`category_id` = ?');
      params.push(category_id ? parseInt(category_id, 10) : null);
    }
    if (name) {
      updates.push('`name` = ?');
      params.push(name.trim());
    }
    if (model_number !== undefined) {
      updates.push('`model_number` = ?');
      params.push(model_number ? model_number.trim() : null);
    }
    if (price !== undefined) {
      updates.push('`price` = ?');
      params.push(parseFloat(price) || 0);
    }
    if (stock !== undefined) {
      updates.push('`stock` = ?');
      params.push(parseInt(stock, 10) || 0);
    }
    if (tagline !== undefined) {
      updates.push('`tagline` = ?');
      params.push(tagline ? tagline.trim() : null);
    }
    if (description !== undefined) {
      updates.push('`description` = ?');
      params.push(description ? description.trim() : null);
    }
    if (specifications !== undefined) {
      updates.push('`specifications` = ?');
      params.push(specifications ? specifications.trim() : null);
    }
    if (image_url !== undefined) {
      updates.push('`image_url` = ?');
      params.push(image_url ? image_url.trim() : null);
    }
    if (status) {
      updates.push('`status` = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE \`products\` SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/products/:id/stock
 * Quick stock adjustment
 */
router.patch('/:id/stock', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { stock, delta } = req.body;

  try {
    if (stock !== undefined) {
      const newStock = Math.max(0, parseInt(stock, 10) || 0);
      await pool.query('UPDATE `products` SET stock = ? WHERE id = ?', [newStock, id]);
      return res.json({ success: true, stock: newStock });
    }

    if (delta !== undefined) {
      const deltaVal = parseInt(delta, 10) || 0;
      await pool.query('UPDATE `products` SET stock = MAX(0, stock + ?) WHERE id = ?', [deltaVal, id]);
      const [[updated]] = await pool.query('SELECT stock FROM `products` WHERE id = ?', [id]);
      return res.json({ success: true, stock: updated.stock });
    }

    return res.status(400).json({ success: false, error: 'Provide stock or delta.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM `products` WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Product deleted from catalog.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
