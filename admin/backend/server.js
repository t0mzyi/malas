/**
 * MALAS ELECTRONICS LLC — ENTERPRISE ADMIN PORTAL SERVER
 * MariaDB 10.6.28 Database Integration
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth');
const inquiryRoutes = require('./routes/inquiries');
const dashboardRoutes = require('./routes/dashboard');
const employeeRoutes = require('./routes/employees');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://malaselectronics.co', 'https://admin.malaselectronics.co'],
      connectSrc: ["'self'", "https://*.onrender.com", "https://*.supabase.co", "https://malaselectronics.co", "https://admin.malaselectronics.co", "http://localhost:*"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS — Allowed Origins (Production domains + Local development + Environment variables)
const defaultOrigins = [
  'https://malaselectronics.co',
  'https://www.malaselectronics.co',
  'https://admin.malaselectronics.co',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Serve Static Frontend Assets (Admin UI in sibling frontend folder)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use(['/admin', '/products', '/prodcuts', '/inquiries', '/invoices', '/employees'], express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/upload', uploadRoutes);

// Fallback to Admin Single Page App for any SPA route
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server & Test Database Connection
app.listen(PORT, async () => {
  console.log('\n============================================================');
  console.log('⚡ MALAS ELECTRONICS — ENTERPRISE ADMIN PORTAL');
  console.log('============================================================');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Admin Login URL:   http://localhost:${PORT}/login`);
  console.log('------------------------------------------------------------');

  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`✓ MariaDB Connected: ${dbStatus.version}`);
    console.log(`  Database: ${dbStatus.database} | Host: ${dbStatus.host}`);
  } else {
    console.log('⚠️ MariaDB Connection Notice:');
    console.log(`  ${dbStatus.error}`);
    console.log(`  Hint: ${dbStatus.hint}`);
    console.log('  To initialize database once password is added: npm run init-db');
  }
  console.log('============================================================\n');
});
