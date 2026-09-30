const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/inquiries (Protected)
 * List inquiries with optional search & status filter
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM `rfp_inquiries` WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND `status` = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (`client_name` LIKE ? OR `email` LIKE ? OR `venue_type` LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY `created_at` DESC LIMIT 100';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, inquiries: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/inquiries (Public)
 * Submits a new inquiry from landing page consultation form
 */
router.post('/', async (req, res) => {
  const {
    client_name,
    email,
    phone,
    sector = 'Commercial',
    venue_type,
    estimated_budget,
    timeline,
    scope_notes
  } = req.body;

  if (!client_name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Client Name and Email are required.'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO \`rfp_inquiries\` 
       (client_name, email, phone, sector, venue_type, estimated_budget, timeline, scope_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        client_name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        sector,
        venue_type ? venue_type.trim() : null,
        estimated_budget || null,
        timeline || null,
        scope_notes ? scope_notes.trim() : null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Inquiry registered in Malas Engineering dispatch system.',
      inquiryId: result.insertId
    });
  } catch (err) {
    console.error('Inquiry submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'Could not record inquiry. Database communication issue.'
    });
  }
});

/**
 * PATCH /api/inquiries/:id (Protected)
 * Update status or assigned engineer
 */
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status, assigned_engineer } = req.body;

  try {
    const updates = [];
    const params = [];

    if (status) {
      updates.push('`status` = ?');
      params.push(status);
    }
    if (assigned_engineer !== undefined) {
      updates.push('`assigned_engineer` = ?');
      params.push(assigned_engineer);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE \`rfp_inquiries\` SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Inquiry updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/inquiries/:id (Protected)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM `rfp_inquiries` WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
