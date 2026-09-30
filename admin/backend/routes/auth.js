const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Validates credentials against MariaDB 10.6.28 and issues JWT
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username/Email and Password are required.'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, full_name, role, status FROM `admins` WHERE username = ? OR email = ? LIMIT 1',
      [username.trim(), username.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access denied.'
      });
    }

    const admin = rows[0];

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account has been suspended. Contact system administrator.'
      });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access denied.'
      });
    }

    // Update last_login
    await pool.query('UPDATE `admins` SET last_login = NOW() WHERE id = ?', [admin.id]);

    // Sign JWT
    const secret = process.env.JWT_SECRET || 'malas_admin_jwt_secret_token_2026';
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        fullName: admin.full_name
      },
      secret,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database communication error. Please ensure MariaDB is connected.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Clears session cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated admin profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, last_login, created_at FROM `admins` WHERE id = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found.' });
    }

    return res.json({
      success: true,
      admin: rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
