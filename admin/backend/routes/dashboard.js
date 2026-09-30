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
    const [[totalAdmins]] = await pool.query('SELECT COUNT(*) as count FROM `admins`');

    const dbHealth = await testConnection();

    return res.json({
      success: true,
      stats: {
        total: totalInquiries.count,
        new: newInquiries.count,
        inReview: activeReviews.count,
        admins: totalAdmins.count
      },
      db: dbHealth
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
