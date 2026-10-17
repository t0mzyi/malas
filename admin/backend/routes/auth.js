const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// Rate limiting: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many failed login attempts. Please try again in 15 minutes.' }
});

/**
 * POST /api/auth/login
 * Validates credentials against MariaDB 10.6.28 and issues JWT
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username/Email and Password are required.'
    });
  }

  try {
    const trimmedUser = username.trim();
    // 1. Exact match on username or email first
    const [rows] = await pool.query(
      "SELECT id, username, email, password_hash, full_name, role, status FROM `admins` WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1",
      [trimmedUser.toLowerCase(), trimmedUser.toLowerCase()]
    );

    let admin = rows[0];

    // 2. Fallback: If username entered is 'admin' or 'ceo' and no exact record was found
    if (!admin && (trimmedUser.toLowerCase() === 'admin' || trimmedUser.toLowerCase() === 'ceo')) {
      const [allAdmins] = await pool.query("SELECT id, username, email, password_hash, full_name, role, status FROM `admins` WHERE status = 'active' AND role IN ('ceo', 'super_admin', 'admin') LIMIT 1");
      if (allAdmins.length > 0) {
        admin = allAdmins[0];
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access denied.'
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account has been suspended. Contact system administrator.'
      });
    }

    // Verify bcrypt hash only — no master password bypasses
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access denied.'
      });
    }

    // Update last_login
    await pool.query('UPDATE `admins` SET last_login = NOW() WHERE id = ?', [admin.id]);

    // Sign JWT valid for 24 hours
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        fullName: admin.full_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie with 24h lifespan
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
