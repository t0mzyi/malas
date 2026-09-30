/**
 * MALAS ELECTRONICS LLC — ADMIN USER MANAGEMENT SCRIPT
 * Creates or resets an administrator password from environment or command line args.
 * Usage: node scripts/seed-admin.js [username] [password] [email]
 */
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool } = require('../config/db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const username = process.argv[2] || process.env.DEFAULT_ADMIN_USER || 'admin';
const password = process.argv[3] || process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@Malas2026!';
const email = process.argv[4] || process.env.DEFAULT_ADMIN_EMAIL || 'admin@malaselectronics.com';

async function seedAdmin() {
  console.log(`\nConfiguring administrator "${username}" (${email})...`);
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [existing] = await pool.query(
      'SELECT id FROM `admins` WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE `admins` SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [passwordHash, existing[0].id]
      );
      console.log(`✓ Password updated successfully for admin ID: ${existing[0].id}`);
    } else {
      const [result] = await pool.query(
        `INSERT INTO \`admins\` (username, email, password_hash, full_name, role)
         VALUES (?, ?, ?, 'Malas Operations Engineer', 'super_admin')`,
        [username, email, passwordHash]
      );
      console.log(`✓ Admin created successfully with ID: ${result.insertId}`);
    }

    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log('------------------------------------------------------------\n');
  } catch (err) {
    console.error('❌ Failed to update admin account:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
