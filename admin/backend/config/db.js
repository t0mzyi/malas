const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for MariaDB 10.6.28
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'malasele_db',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'malasele_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * Test the database connection and return status object
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as db');
    connection.release();
    return {
      connected: true,
      version: rows[0].version,
      database: rows[0].db,
      host: process.env.DB_HOST,
      user: process.env.DB_USER
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      code: error.code,
      hint: error.code === 'ER_ACCESS_DENIED_ERROR'
        ? 'Check your DB_USER and DB_PASSWORD in admin/.env'
        : error.code === 'ECONNREFUSED'
        ? 'MariaDB server is not running on localhost:3306. Please start your MariaDB service.'
        : 'Ensure database malasele_db exists or run npm run init-db'
    };
  }
}

module.exports = {
  pool,
  testConnection
};
