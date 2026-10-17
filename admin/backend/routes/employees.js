const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { requireCeo } = require('../middleware/auth');

/**
 * All employee management routes are STRICTLY restricted to the CEO
 */
router.use(requireCeo);

/**
 * GET /api/employees
 * List all staff/employees
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, full_name, role, status, last_login, created_at FROM `admins` WHERE LOWER(role) NOT IN ('ceo', 'super_admin', 'admin') ORDER BY `created_at` DESC"
    );
    return res.json({ success: true, count: rows.length, employees: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/employees
 * Add a new employee (Only CEO can do this)
 */
router.post('/', async (req, res) => {
  const rawEmail = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  if (!rawEmail || !password) {
    return res.status(400).json({
      success: false,
      error: 'Corporate Email and Initial Password are required.'
    });
  }

  // Auto-generate username from email if not provided
  let username = (req.body.username || rawEmail.split('@')[0] || 'staff').trim();
  // Auto-generate full name from username if not provided
  let fullName = req.body.full_name
    ? req.body.full_name.trim()
    : username.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const assignedRole = 'employee';

  try {
    // Check if email or username already exists
    const [existing] = await pool.query(
      'SELECT id FROM `admins` WHERE email = ? OR username = ? LIMIT 1',
      [rawEmail, username]
    );

    if (existing.length > 0) {
      // If username collided but email didn't, append random suffix
      if (existing[0].email === rawEmail) {
        return res.status(409).json({
          success: false,
          error: 'An employee account with this corporate email already exists.'
        });
      }
      username = `${username}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO \`admins\` 
       (username, email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [
        username,
        rawEmail,
        passwordHash,
        fullName || 'Malas Staff Member',
        assignedRole
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Employee account created successfully with ${assignedRole.toUpperCase()} permissions.`,
      employeeId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/employees/:id
 * Update employee status or role
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, role, full_name, password } = req.body;

  try {
    const updates = [];
    const params = [];

    if (status && ['active', 'suspended'].includes(status)) {
      updates.push('`status` = ?');
      params.push(status);
    }

    if (role && ['employee', 'ceo'].includes(role)) {
      updates.push('`role` = ?');
      params.push(role);
    }

    if (full_name) {
      updates.push('`full_name` = ?');
      params.push(full_name.trim());
    }

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password.trim(), salt);
      updates.push('`password_hash` = ?');
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided for update.' });
    }

    params.push(id);
    await pool.query(`UPDATE \`admins\` SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Employee details updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/employees/:id
 * Remove employee account
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (parseInt(id, 10) === req.admin.id) {
    return res.status(400).json({
      success: false,
      error: 'You cannot delete your own CEO account while logged in.'
    });
  }

  try {
    await pool.query('DELETE FROM `admins` WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Employee account successfully removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
