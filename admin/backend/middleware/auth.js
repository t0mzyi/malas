const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    // 2. Check HTTP-only cookie
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'malas_admin_jwt_secret_token_2026';
    const decoded = jwt.verify(token, secret);
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
    if (req.admin && (req.admin.role === 'ceo' || req.admin.role === 'super_admin')) {
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
  requireCeo
};
