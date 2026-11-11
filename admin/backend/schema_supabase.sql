-- ============================================================
-- MALAS ELECTRONICS LLC — SUPABASE (POSTGRESQL) SCHEMA
-- ============================================================

-- 1. Administrators Table
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

-- 2. RFP & Client Inquiries Table
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

-- 3. System Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  action VARCHAR(128) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  slug VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hardware & Products Catalog Table
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

-- 6. Invoices & Quotes Table
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

-- 7. Site Telemetry & Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Initial CEO Account (ceo@malaselectronics.ae / Ceo@Malas2026!)
INSERT INTO admins (username, email, password_hash, full_name, role, status)
VALUES (
  'ceo@malaselectronics.ae',
  'ceo@malaselectronics.ae',
  '$2a$10$vnNtLu44ajeUqjibmSxtkevT7LMRBqu.2PyPRKkn3vGe8hgGX7CRi',
  'Chief Executive Officer',
  'ceo',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Initial Settings
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES 
  ('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
  ('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address')
ON CONFLICT (setting_key) DO NOTHING;

-- Initial Categories
INSERT INTO categories (name, slug, description) VALUES
  ('LED Video Walls & Displays', 'led-video-walls', 'Fine-pitch direct-view LED panels, broadcast walls, and high-lumen architectural displays.'),
  ('Architectural & Facade Lighting', 'facade-lighting', 'Exterior DMX512 architectural wash, kinetic linear lighting, and dynamic building projection.'),
  ('Commercial & Corporate AV', 'commercial-av', 'Executive boardroom automation, hybrid telepresence, and multi-zone distribution.'),
  ('Pro Audio & Acoustic Systems', 'pro-audio', 'Line-array acoustics, steerable beamforming mics, Dante DSP networks, and acoustic calibration.'),
  ('Smart Control & Automation', 'smart-automation', 'Unified touchscreen environmental controllers, Crestron NVX switching, and automated shading.')
ON CONFLICT DO NOTHING;

