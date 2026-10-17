/**
 * MALAS ELECTRONICS LLC — DATABASE CONNECTION ADAPTER
 * Supports Dual-Engine Architecture:
 * - 'sqlite': Built-in Zero-Install Local Engine (Node.js 22 native node:sqlite)
 * - 'mariadb': Production Remote MariaDB 10.6.28 (mysql2 pool)
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CLIENT = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

let pool = null;
let testConnection = null;

if (DB_CLIENT === 'mariadb') {
  // ============================================================
  // MARIADB 10.6.28 ENGINE (REMOTE / PRODUCTION)
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

  // Enable WAL mode for high performance & foreign keys
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  // Auto-initialize SQLite schema if tables don't exist
  initSqliteSchema(sqliteDb);

  /**
   * Translates MySQL/MariaDB SQL syntax to SQLite syntax on the fly
   */
  function translateSql(sql) {
    let s = sql;
    // Replace MySQL functions & keywords
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

    async end() {
      // DatabaseSync closes automatically on exit
    }
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
 * Initializes SQLite tables and seeds default administrator if missing
 */
function initSqliteSchema(db) {
  // 1. Admins Table
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
  `);

  // 2. RFP Inquiries Table
  db.exec(`
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
  `);

  // 3. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Products Table
  db.exec(`
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
  `);

  // Migrations for products price & stock
  try { db.exec("ALTER TABLE products ADD COLUMN price REAL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10"); } catch (e) {}

  // 6. Invoices Table
  db.exec(`
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
  `);

  // 7. Site Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);



  // Update existing admins with super_admin to ceo role
  try {
    db.prepare("UPDATE admins SET role = 'ceo' WHERE role = 'super_admin'").run();
  } catch (e) {}

  // Ensure CEO account exists with ceo@malaselectronics.ae and password Ceo@Malas2026!
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
    console.error('Error ensuring CEO account:', err);
  }

  // Initial site settings
  db.prepare(`
    INSERT OR IGNORE INTO site_settings (setting_key, setting_value, description)
    VALUES ('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
           ('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address')
  `).run();

  // Inquiries table starts completely clean; populated dynamically from client submissions

  // Seed default categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    insertCat.run('LED Video Walls & Displays', 'led-video-walls', 'Fine-pitch direct-view LED panels, broadcast walls, and high-lumen architectural displays.');
    insertCat.run('Architectural & Facade Lighting', 'facade-lighting', 'Exterior DMX512 architectural wash, kinetic linear lighting, and dynamic building projection.');
    insertCat.run('Commercial & Corporate AV', 'commercial-av', 'Executive boardroom automation, hybrid telepresence, and multi-zone distribution.');
    insertCat.run('Pro Audio & Acoustic Systems', 'pro-audio', 'Line-array acoustics, steerable beamforming mics, Dante DSP networks, and acoustic calibration.');
    insertCat.run('Smart Control & Automation', 'smart-automation', 'Unified touchscreen environmental controllers, Crestron NVX switching, and automated shading.');
  }

  // Products table is clean; populated dynamically from admin catalog manager
}

module.exports = {
  pool,
  testConnection
};
