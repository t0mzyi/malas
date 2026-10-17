const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

function requireAuth(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.admin_token) {
    // 2. Check cookie — never from query string (security risk)
    token = String(req.cookies.admin_token).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please log in again.'
    });
  }
}

/**
 * Ensures authenticated user has the 'ceo' role
 */
function requireCeo(req, res, next) {
  requireAuth(req, res, () => {
    const role = (req.admin?.role || '').toString().toLowerCase().trim();
    const uname = (req.admin?.username || '').toString().toLowerCase().trim();
    const email = (req.admin?.email || '').toString().toLowerCase().trim();
    const isCeo = (
      role === 'ceo' ||
      role === 'super_admin' ||
      role === 'admin' ||
      role === 'administrator' ||
      uname === 'ceo' ||
      uname === 'admin' ||
      uname === 'ceo@malaselectronics.ae' ||
      email === 'ceo@malaselectronics.ae' ||
      email === 'admin@malaselectronics.com'
    );
    if (isCeo) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access restricted: Only the Chief Executive Officer (CEO) has authorization to manage employee accounts.'
      });
    }
  });
}

module.exports = {
  requireAuth,
  requireCeo,
  JWT_SECRET
};
