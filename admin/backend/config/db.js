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

  // 6. Site Settings Table
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

  // Seed default admin if table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (countRow.count === 0) {
    const defaultHash = '$2a$10$52/vgAEcXZmim2xUzfgW7.lriT.v1OaIVstCbRpotO0en5KR4UvJ6';
    db.prepare(`
      INSERT INTO admins (username, email, password_hash, full_name, role, status)
      VALUES (?, ?, ?, 'Chief Executive Officer', 'ceo', 'active')
    `).run('admin', 'ceo@malaselectronics.com', defaultHash);

    // Initial site settings
    db.prepare(`
      INSERT OR IGNORE INTO site_settings (setting_key, setting_value, description)
      VALUES ('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
             ('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address')
    `).run();

    // Sample inquiry for testing
    db.prepare(`
      INSERT INTO rfp_inquiries (client_name, email, phone, sector, venue_type, estimated_budget, timeline, scope_notes, status)
      VALUES ('Al Wasl Tower Management', 'projects@alwasl.ae', '+971 4 332 9988', 'Commercial', 'Corporate Boardroom & Auditorium', 'AED 250k - 500k', 'Q4 2026', 'Turnkey 4K LED Wall, Shure wireless microphone system, and Crestron automated control.', 'new')
    `).run();
  }

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

  // Seed default products if empty
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (prodCount.count === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (category_id, name, model_number, tagline, description, specifications, image_url, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'CEO')
    `);

    insertProd.run(
      1,
      'Malas Onyx-0.9 DirectView MicroLED Display',
      'ME-LED-ONX09',
      'Ultra Fine-Pitch 0.9mm Architectural Display Wall',
      'Engineered for executive Dubai corporate boardrooms and luxury command centers. Features true HDR10+ calibration, 16-bit greyscale depth, and zero-bezel alignment.',
      'Pixel Pitch: 0.93mm | Brightness: 1,200 nits calibrated | Refresh Rate: 3,840 Hz | Contrast: 10,000:1 | IP Rating: Front IP54',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    );

    insertProd.run(
      2,
      'AuraLux Linear DMX512 Facade Beam',
      'AL-FAC-RGBW',
      'High-Output Architectural Grazing Luminaire',
      'Exterior IP67 architectural luminaire designed for continuous Dubai tower facade illumination with seamless RGBW color blending and Art-Net control.',
      'Power: 48W/meter | Beam Angle: 15°x45° asymmetric | Control: DMX512 / RDM | Ingress: IP67 Marine Grade Aluminum | Operating Temp: -20°C to +55°C',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    );

    insertProd.run(
      3,
      'Centrum Beamforming Dante Ceiling Array',
      'CM-BF360-D',
      'Steerable Multi-Lobe Acoustic Ceiling Microphone',
      'Invisible in-ceiling microphone array utilizing adaptive beam tracking algorithms to capture speech across boardrooms without boundary mics.',
      'Coverage: 360° up to 10m radius | Audio Network: Dante / AES67 | DSP: Built-in acoustic echo cancellation (AEC) & noise reduction | Power: PoE+',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    );
  }
}

module.exports = {
  pool,
  testConnection
};
