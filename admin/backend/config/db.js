/**
 * MALAS ELECTRONICS LLC — DATABASE CONNECTION ADAPTER
 * Supports Multi-Engine Architecture:
 * - 'supabase' / 'postgres': Production Cloud PostgreSQL on Supabase (pg Pool)
 * - 'sqlite': Built-in Zero-Install Local Engine (Node.js 22 native node:sqlite)
 * - 'mariadb': Remote MariaDB 10.6.28 instance (mysql2 pool)
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CLIENT = (
  process.env.DB_CLIENT ||
  (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL ? 'supabase' : 'sqlite')
).toLowerCase();

let pool = null;
let testConnection = null;

if (DB_CLIENT === 'supabase' || DB_CLIENT === 'postgres') {
  // ============================================================
  // SUPABASE / POSTGRESQL ENGINE (PRODUCTION CLOUD DATABASE)
  // ============================================================
  const { Pool: PgPool } = require('pg');

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const isLocal = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

  const pgPool = new PgPool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  /**
   * Translates MySQL/MariaDB query syntax to PostgreSQL syntax on the fly
   */
  function translateSqlToPg(sql) {
    let s = sql;
    // Strip backticks from MySQL table/column identifiers
    s = s.replace(/`/g, '');
    // Replace MySQL INSERT IGNORE with standard INSERT
    s = s.replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT INTO');
    // Replace ? parameter placeholders with $1, $2, ...
    let paramIndex = 1;
    s = s.replace(/\?/g, () => `$${paramIndex++}`);
    return s;
  }

  pool = {
    async query(sql, params = []) {
      const translated = translateSqlToPg(sql);
      const trimmed = translated.trim();
      const isSelect = /^(SELECT|SHOW)/i.test(trimmed);
      const isInsert = /^INSERT\s+INTO\b/i.test(trimmed);

      let finalSql = translated;
      // Auto-append RETURNING id for inserts so insertId is available (except site_settings where PK is setting_key)
      if (isInsert && !/\bRETURNING\b/i.test(finalSql) && !/site_settings/i.test(finalSql)) {
        finalSql += ' RETURNING id';
      }

      try {
        const result = await pgPool.query(finalSql, params);
        if (isSelect) {
          return [result.rows, result.fields || []];
        } else {
          const insertId = result.rows && result.rows[0] && result.rows[0].id ? Number(result.rows[0].id) : 0;
          return [
            {
              insertId: insertId,
              affectedRows: result.rowCount || 0,
              changes: result.rowCount || 0
            },
            []
          ];
        }
      } catch (err) {
        console.error('PostgreSQL query execution error:', err.message, 'SQL:', finalSql);
        throw err;
      }
    },

    async end() {
      await pgPool.end();
    }
  };

  testConnection = async function () {
    try {
      const client = await pgPool.connect();
      const res = await client.query('SELECT version(), current_database() as db');
      client.release();

      // Initialize schema on first connect if tables do not exist
      await initSupabaseSchema(pgPool);

      return {
        client: 'supabase/postgres',
        connected: true,
        version: res.rows[0].version.split(' on ')[0],
        database: res.rows[0].db,
        host: 'Supabase Cloud (PostgreSQL)'
      };
    } catch (error) {
      return {
        client: 'supabase/postgres',
        connected: false,
        error: error.message,
        code: error.code,
        hint: 'Ensure DATABASE_URL or SUPABASE_DB_URL is set correctly in environment.'
      };
    }
  };

} else if (DB_CLIENT === 'mariadb') {
  // ============================================================
  // MARIADB 10.6.28 ENGINE (LEGACY REMOTE HOST)
  // ============================================================
  const mysql = require('mysql2/promise');

  const mariadbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'malasele_db',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'malasele_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  pool = mariadbPool;

  testConnection = async function () {
    try {
      const connection = await mariadbPool.getConnection();
      const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as db');
      connection.release();
      return {
        client: 'mariadb',
        connected: true,
        version: rows[0].version,
        database: rows[0].db,
        host: process.env.DB_HOST,
        user: process.env.DB_USER
      };
    } catch (error) {
      return {
        client: 'mariadb',
        connected: false,
        error: error.message,
        code: error.code,
        hint: error.code === 'ETIMEDOUT'
          ? 'Firewall on remote host is dropping port 3306. Use DB_CLIENT=sqlite for local development.'
          : error.message
      };
    }
  };

} else {
  // ============================================================
  // SQLITE ENGINE (LOCAL ZERO-INSTALL DEVELOPMENT)
  // Powered by Node.js 22 Native SQLite (DatabaseSync)
  // ============================================================
  const { DatabaseSync } = require('node:sqlite');
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbFilePath = path.join(dataDir, 'malas_local.db');
  const sqliteDb = new DatabaseSync(dbFilePath);

  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  initSqliteSchema(sqliteDb);

  function translateSql(sql) {
    let s = sql;
    s = s.replace(/\bNOW\(\)/gi, "datetime('now')");
    s = s.replace(/\bINSERT IGNORE\b/gi, 'INSERT OR IGNORE');
    return s;
  }

  pool = {
    async query(sql, params = []) {
      const translated = translateSql(sql);
      const trimmed = translated.trim();
      const isSelect = /^(SELECT|PRAGMA|SHOW)/i.test(trimmed);

      try {
        const stmt = sqliteDb.prepare(translated);
        if (isSelect) {
          const rows = stmt.all(...params);
          return [rows, []];
        } else {
          const result = stmt.run(...params);
          return [
            {
              insertId: Number(result.lastInsertRowid),
              affectedRows: Number(result.changes),
              changes: Number(result.changes)
            },
            []
          ];
        }
      } catch (err) {
        console.error('SQLite query execution error:', err.message, 'SQL:', translated);
        throw err;
      }
    },

    async end() {}
  };

  testConnection = async function () {
    return {
      client: 'sqlite',
      connected: true,
      version: '3.45 (Node 22 SQLite Native)',
      database: 'malas_local.db (Local Dev Engine)',
      host: 'localhost (Embedded)',
      user: 'local_admin'
    };
  };
}

/**
 * Initializes Supabase PostgreSQL tables and seeds default records
 */
async function initSupabaseSchema(pgPool) {
  const schema = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      email VARCHAR(128) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(128) NOT NULL DEFAULT 'Malas Administrator',
      role VARCHAR(32) NOT NULL DEFAULT 'super_admin',
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      last_login TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rfp_inquiries (
      id SERIAL PRIMARY KEY,
      client_name VARCHAR(128) NOT NULL,
      email VARCHAR(128) NOT NULL,
      phone VARCHAR(64),
      sector VARCHAR(64) NOT NULL DEFAULT 'Commercial',
      venue_type VARCHAR(128),
      estimated_budget VARCHAR(64),
      timeline VARCHAR(64),
      scope_notes TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'new',
      assigned_engineer VARCHAR(128),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER,
      action VARCHAR(128) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL UNIQUE,
      slug VARCHAR(128) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      model_number VARCHAR(128),
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 10,
      tagline TEXT,
      description TEXT,
      specifications TEXT,
      image_url TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_by VARCHAR(128),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(64) NOT NULL UNIQUE,
      client_name VARCHAR(128) NOT NULL,
      client_email VARCHAR(128),
      client_phone VARCHAR(64),
      project_name VARCHAR(255),
      items TEXT NOT NULL,
      subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
      vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 5,
      vat_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'finalized',
      created_by VARCHAR(128),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT,
      description VARCHAR(255),
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pgPool.query(schema);

  // Seed Initial CEO Accounts (.ae and .co)
  const ceoHash = '$2a$10$vnNtLu44ajeUqjibmSxtkevT7LMRBqu.2PyPRKkn3vGe8hgGX7CRi'; // Ceo@Malas2026!
  await pgPool.query(`
    INSERT INTO admins (username, email, password_hash, full_name, role, status)
    VALUES 
      ('ceo@malaselectronics.ae', 'ceo@malaselectronics.ae', $1, 'Chief Executive Officer', 'ceo', 'active'),
      ('ceo@malaselectronics.co', 'ceo@malaselectronics.co', $1, 'Chief Executive Officer', 'ceo', 'active')
    ON CONFLICT (email) DO NOTHING;
  `, [ceoHash]);

  // Seed default site settings
  await pgPool.query(`
    INSERT INTO site_settings (setting_key, setting_value, description)
    VALUES ('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
           ('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address')
    ON CONFLICT (setting_key) DO NOTHING;
  `);

  // Seed default categories if none exist
  const catCheck = await pgPool.query('SELECT COUNT(*) as count FROM categories');
  if (parseInt(catCheck.rows[0].count, 10) === 0) {
    const defaultCats = [
      ['LED Video Walls & Displays', 'led-video-walls', 'Fine-pitch direct-view LED panels, broadcast walls, and high-lumen architectural displays.'],
      ['Architectural & Facade Lighting', 'facade-lighting', 'Exterior DMX512 architectural wash, kinetic linear lighting, and dynamic building projection.'],
      ['Commercial & Corporate AV', 'commercial-av', 'Executive boardroom automation, hybrid telepresence, and multi-zone distribution.'],
      ['Pro Audio & Acoustic Systems', 'pro-audio', 'Line-array acoustics, steerable beamforming mics, Dante DSP networks, and acoustic calibration.'],
      ['Smart Control & Automation', 'smart-automation', 'Unified touchscreen environmental controllers, Crestron NVX switching, and automated shading.']
    ];
    for (const [name, slug, desc] of defaultCats) {
      await pgPool.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [name, slug, desc]
      );
    }
  }
}

/**
 * Initializes SQLite tables and seeds default administrator if missing
 */
function initSqliteSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT 'Malas Administrator',
      role TEXT NOT NULL DEFAULT 'super_admin',
      status TEXT NOT NULL DEFAULT 'active',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rfp_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      sector TEXT NOT NULL DEFAULT 'Commercial',
      venue_type TEXT,
      estimated_budget TEXT,
      timeline TEXT,
      scope_notes TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_engineer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      model_number TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 10,
      tagline TEXT,
      description TEXT,
      specifications TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT,
      project_name TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      vat_rate REAL NOT NULL DEFAULT 5,
      vat_amount REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'finalized',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec("ALTER TABLE products ADD COLUMN price REAL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10"); } catch (e) {}

  const ceoHash = '$2a$10$vnNtLu44ajeUqjibmSxtkevT7LMRBqu.2PyPRKkn3vGe8hgGX7CRi'; // Ceo@Malas2026!
  try {
    const existingCeo = db.prepare("SELECT id FROM admins WHERE email = 'ceo@malaselectronics.ae'").get();
    if (existingCeo) {
      db.prepare("UPDATE admins SET role = 'ceo', password_hash = ?, status = 'active' WHERE id = ?").run(ceoHash, existingCeo.id);
    } else {
      const firstAdmin = db.prepare("SELECT id FROM admins ORDER BY id ASC LIMIT 1").get();
      if (firstAdmin) {
        db.prepare(`
          UPDATE admins 
          SET username = 'ceo@malaselectronics.ae', email = 'ceo@malaselectronics.ae', password_hash = ?, full_name = 'Chief Executive Officer', role = 'ceo', status = 'active'
          WHERE id = ?
        `).run(ceoHash, firstAdmin.id);
      } else {
        db.prepare(`
          INSERT INTO admins (username, email, password_hash, full_name, role, status)
          VALUES ('ceo@malaselectronics.ae', 'ceo@malaselectronics.ae', ?, 'Chief Executive Officer', 'ceo', 'active')
        `).run(ceoHash);
      }
    }
  } catch (err) {
    console.error('Error ensuring CEO account in SQLite:', err);
  }

  db.prepare(`
    INSERT OR IGNORE INTO site_settings (setting_key, setting_value, description)
    VALUES ('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
           ('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address')
  `).run();

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    insertCat.run('LED Video Walls & Displays', 'led-video-walls', 'Fine-pitch direct-view LED panels, broadcast walls, and high-lumen architectural displays.');
    insertCat.run('Architectural & Facade Lighting', 'facade-lighting', 'Exterior DMX512 architectural wash, kinetic linear lighting, and dynamic building projection.');
    insertCat.run('Commercial & Corporate AV', 'commercial-av', 'Executive boardroom automation, hybrid telepresence, and multi-zone distribution.');
    insertCat.run('Pro Audio & Acoustic Systems', 'pro-audio', 'Line-array acoustics, steerable beamforming mics, Dante DSP networks, and acoustic calibration.');
    insertCat.run('Smart Control & Automation', 'smart-automation', 'Unified touchscreen environmental controllers, Crestron NVX switching, and automated shading.');
  }
}

module.exports = {
  pool,
  testConnection
};
