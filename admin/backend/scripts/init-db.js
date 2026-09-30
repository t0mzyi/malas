/**
 * MALAS ELECTRONICS LLC — MARIADB DATABASE INITIALIZATION SCRIPT
 * Creates malasele_db database, executes schema.sql, and seeds the initial admin account.
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'malasele_db',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

const DB_NAME = process.env.DB_NAME || 'malasele_db';
const ADMIN_USER = process.env.DEFAULT_ADMIN_USER || 'admin';
const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@malaselectronics.com';
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@Malas2026!';

async function initializeDatabase() {
  console.log('\n============================================================');
  console.log('⚡ MALAS ELECTRONICS — INITIALIZING MARIADB 10.6.28');
  console.log('============================================================');
  console.log(`Connecting to MariaDB host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`User: ${DB_CONFIG.user} | Target Database: ${DB_NAME}`);

  let connection;
  try {
    // 1. Initial connection without database to create it if missing
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Successfully connected to MariaDB service.');

    // 2. Create database
    console.log(`\n1. Creating database \`${DB_NAME}\` (if not exists)...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${DB_NAME}\`;`);
    console.log(`✓ Database \`${DB_NAME}\` is ready.`);

    // 3. Read and execute schema
    const schemaPath = path.join(__dirname, '../schema.sql');
    console.log(`\n2. Executing schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual queries
    const statements = schemaSql
      .split(/;(?:\r?\n)+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('CREATE') || statement.toUpperCase().startsWith('INSERT')) {
        await connection.query(statement);
      }
    }
    console.log('✓ Tables created: `admins`, `rfp_inquiries`, `audit_logs`, `site_settings`.');

    // 4. Seed default administrator
    console.log('\n3. Verifying Administrator Account...');
    const [existingAdmins] = await connection.query(
      'SELECT id, username, email FROM `admins` WHERE username = ? OR email = ?',
      [ADMIN_USER, ADMIN_EMAIL]
    );

    if (existingAdmins.length === 0) {
      console.log(`→ Seeding initial admin: "${ADMIN_USER}" (${ADMIN_EMAIL})...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await connection.query(
        `INSERT INTO \`admins\` (username, email, password_hash, full_name, role)
         VALUES (?, ?, ?, 'Chief Systems Administrator', 'super_admin')`,
        [ADMIN_USER, ADMIN_EMAIL, passwordHash]
      );

      console.log('✓ Default Administrator created successfully!');
      console.log('------------------------------------------------------------');
      console.log(`  Username: ${ADMIN_USER}`);
      console.log(`  Email:    ${ADMIN_EMAIL}`);
      console.log(`  Password: ${ADMIN_PASSWORD}`);
      console.log('------------------------------------------------------------');
      console.log('  ⚠️ NOTE: Please change your password upon first login.');
    } else {
      console.log(`✓ Admin user "${existingAdmins[0].username}" already exists (ID: ${existingAdmins[0].id}).`);
    }

    console.log('\n============================================================');
    console.log('🎉 DATABASE INITIALIZATION COMPLETE');
    console.log('============================================================');
    console.log('To start the Admin Portal:');
    console.log('  cd admin');
    console.log('  npm start');
    console.log('Then open: http://localhost:5000/admin\n');

  } catch (error) {
    console.error('\n❌ Initialization Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Authentication Failed:');
      console.error(`- Check DB_USER ("${DB_CONFIG.user}") and DB_PASSWORD in \`admin/.env\`.`);
      console.error('- Ensure the MariaDB user exists and has GRANT permissions.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection Refused:');
      console.error(`- MariaDB is not running on ${DB_CONFIG.host}:${DB_CONFIG.port}.`);
      console.error('- Please start MariaDB service (e.g. via XAMPP, Laragon, or Services.msc).');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
