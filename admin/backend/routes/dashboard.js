const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/dashboard/stats (Protected)
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[totalInquiries]] = await pool.query('SELECT COUNT(*) as count FROM `rfp_inquiries`');
    const [[newInquiries]] = await pool.query("SELECT COUNT(*) as count FROM `rfp_inquiries` WHERE `status` = 'new'");
    const [[activeReviews]] = await pool.query("SELECT COUNT(*) as count FROM `rfp_inquiries` WHERE `status` = 'in_review'");
    const [[totalAdmins]] = await pool.query("SELECT COUNT(*) as count FROM `admins` WHERE `role` NOT IN ('ceo', 'super_admin')");
    const [[activeAdmins]] = await pool.query("SELECT COUNT(*) as count FROM `admins` WHERE `status` = 'active'");
    const [[totalProducts]] = await pool.query('SELECT COUNT(*) as count FROM `products`');
    const [[totalCategories]] = await pool.query('SELECT COUNT(*) as count FROM `categories`');
    let totalInvoices = { count: 0 };
    try {
      const [[invCount]] = await pool.query('SELECT COUNT(*) as count FROM `invoices`');
      if (invCount) totalInvoices = invCount;
    } catch (e) {}

    return res.json({
      success: true,
      stats: {
        total: totalInquiries.count,
        products: totalProducts.count,
        invoices: totalInvoices.count,
        employees: totalAdmins.count
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/dashboard/health (Public/Protected diagnostic)
 */
router.get('/health', async (req, res) => {
  const dbHealth = await testConnection();
  return res.json({
    status: dbHealth.connected ? 'healthy' : 'database_disconnected',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

module.exports = router;
