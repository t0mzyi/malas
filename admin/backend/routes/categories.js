const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/categories
 * List all categories (with product count)
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return res.json({ success: true, count: rows.length, categories: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/categories
 * Add new category (Anyone authenticated can add)
 */
router.post('/', requireAuth, async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Category Name is required.' });
  }

  const generatedSlug = slug
    ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

  try {
    const [result] = await pool.query(
      'INSERT INTO `categories` (name, slug, description) VALUES (?, ?, ?)',
      [name.trim(), generatedSlug, description ? description.trim() : null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category added successfully.',
      categoryId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/categories/:id
 * Update category
 */
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updates = [];
    const params = [];

    if (name) {
      updates.push('`name` = ?');
      params.push(name.trim());
      updates.push('`slug` = ?');
      params.push(name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }

    if (description !== undefined) {
      updates.push('`description` = ?');
      params.push(description ? description.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE \`categories\` SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete category
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM `categories` WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Category removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
