// Malas Electronics — Admin Portal Client Configuration
(function() {
  var isLocal = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5000'
  );

  // Production Render API backend URL
  window.MALAS_API_BASE = isLocal
    ? 'http://localhost:5000/api'
    : 'https://malas.onrender.com/api';
})();
