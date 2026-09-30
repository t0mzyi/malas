/**
 * MALAS ELECTRONICS LLC — ENTERPRISE ADMIN PORTAL SERVER
 * MariaDB 10.6.28 Database Integration
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth');
const inquiryRoutes = require('./routes/inquiries');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Frontend Assets (Admin UI in sibling frontend folder)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback to Admin Single Page App for any other route
app.get('*', (req, res) => {
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
