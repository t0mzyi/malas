// Malas Electronics — Admin Portal Client Configuration
(function() {
  var isLocal = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5000'
  );

  // In production on Vercel (admin.malaselectronics.co), replace with your live Render backend URL:
  // e.g. 'https://malas-admin-api.onrender.com/api'
  window.MALAS_API_BASE = isLocal
    ? 'http://localhost:5000/api'
    : (window.MALAS_API_BASE || 'https://malas-admin-api.onrender.com/api');
})();

