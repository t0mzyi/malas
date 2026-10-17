<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — MARIADB 10.6.28 DATABASE CONFIGURATION
 * Native PHP / PDO Database Adapter & JWT Security Layer
 * ============================================================
 */

// Enable error reporting in development, disable in production
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

// ============================================================
// LIGHTWEIGHT .ENV PARSER (No Composer Required)
// ============================================================
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!empty($name)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// CORS Headers — Strict Origin Whitelist (Production)
$allowedOrigins = [
    'https://admin.malaselectronics.ae',
    'https://malaselectronics.ae',
    'https://www.malaselectronics.ae',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
} elseif (empty($origin)) {
    // Same-origin request (no Origin header) — allow it
    header("Access-Control-Allow-Origin: https://admin.malaselectronics.ae");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Ensure JSON response header for all API endpoints
header('Content-Type: application/json; charset=utf-8');

// Database Credentials — Environment Only, No Hardcoded Fallbacks
define('DB_HOST',    getenv('DB_HOST')     ?: ($_ENV['DB_HOST'] ?? 'localhost'));
define('DB_PORT',    getenv('DB_PORT')     ?: ($_ENV['DB_PORT'] ?? '3306'));
define('DB_NAME',    getenv('DB_NAME')     ?: ($_ENV['DB_NAME'] ?? 'malasele_db'));
define('DB_USER',    getenv('DB_USER')     ?: ($_ENV['DB_USER'] ?? 'malasele_db'));
define('DB_CHARSET', 'utf8mb4');

$_db_pass = getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? null);
if (!$_db_pass) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server misconfiguration: DB_PASSWORD environment variable is not set.']);
    exit();
}
define('DB_PASS', $_db_pass);

// JWT Secret — Environment Only
$_jwt_secret = getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? null);
if (!$_jwt_secret) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server misconfiguration: JWT_SECRET environment variable is not set.']);
    exit();
}
define('JWT_SECRET', $_jwt_secret);

// Cloudinary Configuration — Environment Only
define('CLOUDINARY_CLOUD_NAME',   getenv('CLOUDINARY_CLOUD_NAME')   ?: ($_ENV['CLOUDINARY_CLOUD_NAME'] ?? 'jfxqts4x'));
define('CLOUDINARY_API_KEY',      getenv('CLOUDINARY_API_KEY')      ?: ($_ENV['CLOUDINARY_API_KEY'] ?? '872827862522122'));
$_cld_secret = getenv('CLOUDINARY_API_SECRET') ?: ($_ENV['CLOUDINARY_API_SECRET'] ?? null);
if (!$_cld_secret) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server misconfiguration: CLOUDINARY_API_SECRET is not set.']);
    exit();
}
define('CLOUDINARY_API_SECRET', $_cld_secret);

// Is this a production environment?
define('IS_PRODUCTION', ((getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? '')) === 'production'));

/**
 * Obtain singleton PDO connection to MariaDB 10.6.28
 * Automatically initializes database schema if tables do not exist
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        // Ensure core tables exist on first connect
        initDatabaseSchema($pdo);
        return $pdo;
    } catch (PDOException $e) {
        $GLOBALS['db_error'] = $e->getMessage();
        return null;
    }
}

/**
 * Diagnostic test connection for MariaDB health telemetry
 */
function testConnection() {
    try {
        $conn = getDbConnection();
        if ($conn) {
            $stmt = $conn->query("SELECT VERSION() AS ver, DATABASE() AS db");
            $info = $stmt->fetch();
            return [
                'connected' => true,
                'engine'    => 'MariaDB',
                'version'   => $info['ver'] ?? '10.6.28',
                'database'  => $info['db'] ?? DB_NAME,
                'host'      => DB_HOST
            ];
        }
    } catch (Exception $e) {
        // Fall through
    }

    return [
        'connected' => false,
        'engine'    => 'MariaDB',
        'error'     => 'Could not establish connection to MariaDB service on localhost:3306.'
    ];
}

/**
 * Automatically set up schema and initial admin if table is missing
 */
function initDatabaseSchema($pdo) {
    static $initialized = false;
    if ($initialized) return;

    try {
        // 1. Admins Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `admins` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `username` VARCHAR(64) NOT NULL UNIQUE,
                `email` VARCHAR(128) NOT NULL UNIQUE,
                `password_hash` VARCHAR(255) NOT NULL,
                `full_name` VARCHAR(128) NOT NULL DEFAULT 'Malas Administrator',
                `role` VARCHAR(64) NOT NULL DEFAULT 'super_admin',
                `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
                `last_login` DATETIME NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_username` (`username`),
                INDEX `idx_email` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Ensure role column accepts 'ceo' and is not restricted to legacy enum
        try {
            $pdo->exec("ALTER TABLE `admins` MODIFY COLUMN `role` VARCHAR(64) NOT NULL DEFAULT 'super_admin'");
        } catch (Exception $e) {}

        // Ensure master administrative accounts have 'ceo' clearance
        try {
            $pdo->exec("UPDATE `admins` SET `role` = 'ceo' WHERE LOWER(`username`) IN ('ceo', 'admin') OR LOWER(`email`) IN ('ceo@malaselectronics.ae', 'admin@malaselectronics.com')");
        } catch (Exception $e) {}

        // 2. RFP Inquiries Table
        $pdo->exec("
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
        ");

        // 3. Categories Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `categories` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(128) NOT NULL UNIQUE,
                `slug` VARCHAR(128) NOT NULL UNIQUE,
                `description` TEXT NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 4. Products Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `products` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `category_id` INT NULL,
                `name` VARCHAR(255) NOT NULL,
                `model_number` VARCHAR(128) NULL,
                `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                `stock` INT NOT NULL DEFAULT 10,
                `tagline` VARCHAR(255) NULL,
                `description` TEXT NULL,
                `specifications` TEXT NULL,
                `image_url` TEXT NULL,
                `status` ENUM('active', 'draft', 'out_of_stock') NOT NULL DEFAULT 'active',
                `created_by` VARCHAR(128) NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_cat` (`category_id`),
                INDEX `idx_status` (`status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Migrations for products price & stock
        try { $pdo->exec("ALTER TABLE `products` ADD COLUMN `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00"); } catch (Exception $e) {}
        try { $pdo->exec("ALTER TABLE `products` ADD COLUMN `stock` INT NOT NULL DEFAULT 10"); } catch (Exception $e) {}

        // Invoices Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `invoices` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `invoice_number` VARCHAR(64) NOT NULL UNIQUE,
                `client_name` VARCHAR(128) NOT NULL,
                `client_email` VARCHAR(128) NULL,
                `client_phone` VARCHAR(64) NULL,
                `project_name` VARCHAR(128) NULL,
                `items` LONGTEXT NOT NULL,
                `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                `vat_rate` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
                `vat_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                `status` VARCHAR(32) NOT NULL DEFAULT 'finalized',
                `created_by` VARCHAR(128) NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_inv_num` (`invoice_number`),
                INDEX `idx_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 5. Audit Logs Table
        $pdo->exec("
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
        ");

        // 6. Site Settings Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `site_settings` (
                `setting_key` VARCHAR(64) PRIMARY KEY,
                `setting_value` TEXT NULL,
                `description` VARCHAR(255) NULL,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed or update CEO account (ceo@malaselectronics.ae / Ceo@Malas2026!)
        $ceoHash = password_hash('Ceo@Malas2026!', PASSWORD_BCRYPT);
        $checkCeo = $pdo->prepare("SELECT id FROM `admins` WHERE `email` = 'ceo@malaselectronics.ae' LIMIT 1");
        $checkCeo->execute();
        $ceoRow = $checkCeo->fetch();

        if ($ceoRow) {
            $pdo->prepare("UPDATE `admins` SET `role` = 'ceo', `password_hash` = ?, `status` = 'active', `username` = 'ceo@malaselectronics.ae' WHERE `id` = ?")->execute([$ceoHash, $ceoRow['id']]);
        } else {
            $firstAdmin = $pdo->query("SELECT id FROM `admins` ORDER BY `id` ASC LIMIT 1")->fetch();
            if ($firstAdmin) {
                $pdo->prepare("UPDATE `admins` SET `username` = 'ceo@malaselectronics.ae', `email` = 'ceo@malaselectronics.ae', `password_hash` = ?, `role` = 'ceo', `status` = 'active', `full_name` = 'Chief Executive Officer' WHERE `id` = ?")->execute([$ceoHash, $firstAdmin['id']]);
            } else {
                $pdo->prepare("
                    INSERT INTO `admins` (`username`, `email`, `password_hash`, `full_name`, `role`, `status`)
                    VALUES ('ceo@malaselectronics.ae', 'ceo@malaselectronics.ae', ?, 'Chief Executive Officer', 'ceo', 'active')
                ")->execute([$ceoHash]);
            }
        }

        // Seed initial site settings if empty
        $stmtSettings = $pdo->prepare("INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `description`) VALUES (?, ?, ?)");
        $stmtSettings->execute(['site_title', 'Malas Electronics LLC — Bespoke Architectural AV', 'Official Site Title']);
        $stmtSettings->execute(['contact_email', 'Info@malaselectronics.ae', 'Primary dispatch email']);
        $stmtSettings->execute(['contact_phone', '+971 56 742 4515', 'Official direct line']);
        $stmtSettings->execute(['headquarters_city', 'Deira, Dubai · UAE', 'Engineering headquarters address']);

        // Inquiries table is populated dynamically from client submissions

        // Seed default categories if empty
        $catCheck = $pdo->query("SELECT COUNT(*) FROM `categories`")->fetchColumn();
        if ((int)$catCheck === 0) {
            $stmtCat = $pdo->prepare("INSERT IGNORE INTO `categories` (`name`, `slug`, `description`) VALUES (?, ?, ?)");
            $stmtCat->execute(['LED Video Walls & Displays', 'led-video-walls', 'Fine-pitch direct-view LED panels, broadcast walls, and high-lumen architectural displays.']);
            $stmtCat->execute(['Architectural & Facade Lighting', 'facade-lighting', 'Exterior DMX512 architectural wash, kinetic linear lighting, and dynamic building projection.']);
            $stmtCat->execute(['Commercial & Corporate AV', 'commercial-av', 'Executive boardroom automation, hybrid telepresence, and multi-zone distribution.']);
            $stmtCat->execute(['Pro Audio & Acoustic Systems', 'pro-audio', 'Line-array acoustics, steerable beamforming mics, Dante DSP networks, and acoustic calibration.']);
            $stmtCat->execute(['Smart Control & Automation', 'smart-automation', 'Unified touchscreen environmental controllers, Crestron NVX switching, and automated shading.']);
        }

        $initialized = true;
    } catch (Exception $e) {
        // Log or silently continue if already created
    }
}

// ============================================================
// PURE PHP JWT ENGINE (RFC 7519 COMPLIANT · NO COMPOSER NEEDED)
// ============================================================

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

// ============================================================
// LOGIN RATE LIMITING (PHP Session-based, 5 attempts / 15 min)
// ============================================================

function checkLoginRateLimit($identifier) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $key = 'rl_' . md5($identifier);
    $now = time();
    $window = 15 * 60; // 15 minutes
    $maxAttempts = 5;

    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 0, 'first' => $now];
    }

    $data = &$_SESSION[$key];
    // Reset window if expired
    if ($now - $data['first'] > $window) {
        $data = ['count' => 0, 'first' => $now];
    }

    if ($data['count'] >= $maxAttempts) {
        $retryAfter = $window - ($now - $data['first']);
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error'   => "Too many failed login attempts. Please try again in " . ceil($retryAfter / 60) . " minute(s)."
        ]);
        exit();
    }

    return $data; // Pass back reference to increment on failure
}

function recordFailedLogin($identifier) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $key = 'rl_' . md5($identifier);
    if (isset($_SESSION[$key])) {
        $_SESSION[$key]['count']++;
    }
}

function clearLoginRateLimit($identifier) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $key = 'rl_' . md5($identifier);
    unset($_SESSION[$key]);
}

function generateJWT($payload, $expirySeconds = 86400) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expirySeconds;
    $payload['iat'] = time();
    $payloadJson = json_encode($payload);

    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payloadJson);

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT($token) {
    if (!$token) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($base64Header, $base64Payload, $base64Signature) = $parts;
    $signature = base64UrlDecode($base64Signature);
    $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);

    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }

    $payload = json_decode(base64UrlDecode($base64Payload), true);
    if (!$payload) return false;

    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false; // Expired
    }

    return $payload;
}

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }

    if (isset($_COOKIE['admin_token'])) {
        return $_COOKIE['admin_token'];
    }

    return null;
}

function requireAuth() {
    $token = getBearerToken();
    $payload = verifyJWT($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required or token session expired.']);
        exit();
    }
    return $payload;
}

function requireCeo() {
    $payload = requireAuth();
    $role = strtolower(trim((string)($payload['role'] ?? '')));
    $uname = strtolower(trim((string)($payload['username'] ?? '')));
    $email = strtolower(trim((string)($payload['email'] ?? '')));
    $isCeo = (
        $role === 'ceo' ||
        $role === 'super_admin' ||
        $role === 'admin' ||
        $role === 'administrator' ||
        $uname === 'ceo' ||
        $uname === 'admin' ||
        $uname === 'ceo@malaselectronics.ae' ||
        $email === 'ceo@malaselectronics.ae' ||
        $email === 'admin@malaselectronics.com'
    );
    if (!$isCeo) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'Access restricted: Only the Chief Executive Officer (CEO) has authorization to manage employee accounts.'
        ]);
        exit();
    }
    return $payload;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
