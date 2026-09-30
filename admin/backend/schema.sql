-- ============================================================
-- MALAS ELECTRONICS LLC — MARIADB 10.6.28 DATABASE SCHEMA
-- Database: malasele_db
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `malasele_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `malasele_db`;

-- 1. Administrators Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(128) NOT NULL DEFAULT 'Malas Administrator',
  `role` ENUM('super_admin', 'editor', 'viewer') NOT NULL DEFAULT 'super_admin',
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RFP & Client Inquiries Table
CREATE TABLE IF NOT EXISTS `rfp_inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `phone` VARCHAR(64) NULL,
  `sector` VARCHAR(64) NOT NULL DEFAULT 'Commercial',
  `venue_type` VARCHAR(128) NULL,
  `estimated_budget` VARCHAR(64) NULL,
  `timeline` VARCHAR(64) NULL,
  `scope_notes` TEXT NULL,
  `status` ENUM('new', 'contacted', 'in_review', 'quoted', 'archived') NOT NULL DEFAULT 'new',
  `assigned_engineer` VARCHAR(128) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. System Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NULL,
  `action` VARCHAR(128) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin` (`admin_id`),
  INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Site Settings & Telemetry Configuration Table
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` TEXT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial System Settings
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `description`) VALUES
('site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title'),
('maintenance_mode', 'false', 'Toggle maintenance state'),
('contact_email', 'info@malaselectronics.com', 'Primary dispatch email'),
('contact_phone', '+971 4 000 0000', 'Official landline'),
('headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address');
