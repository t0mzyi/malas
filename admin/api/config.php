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

// CORS Headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure JSON response header for all API endpoints
header('Content-Type: application/json; charset=utf-8');

// Database Credentials (configured for DirectAdmin MariaDB on localhost)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'malasele_db');
define('DB_USER', getenv('DB_USER') ?: 'malasele_db');
define('DB_PASS', getenv('DB_PASSWORD') ?: 'MERyhcyxUdEVeF34VzkG');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'malas_admin_jwt_secret_token_2026_super_secure');

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
                `role` ENUM('super_admin', 'editor', 'viewer') NOT NULL DEFAULT 'super_admin',
                `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
                `last_login` DATETIME NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_username` (`username`),
                INDEX `idx_email` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

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
                `tagline` VARCHAR(255) NULL,
                `description` TEXT NULL,
                `specifications` TEXT NULL,
                `image_url` TEXT NULL,
                `status` ENUM('active', 'draft') NOT NULL DEFAULT 'active',
                `created_by` VARCHAR(128) NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_cat` (`category_id`),
                INDEX `idx_status` (`status`)
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

        // Seed initial admin user if not present (admin / Admin@Malas2026!)
        $check = $pdo->query("SELECT COUNT(*) FROM `admins`")->fetchColumn();
        if ((int)$check === 0) {
            $hash = password_hash('Admin@Malas2026!', PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("
                INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `status`)
                VALUES (1, 'admin', 'ceo@malaselectronics.com', ?, 'Chief Executive Officer', 'ceo', 'active')
            ");
            $stmt->execute([$hash]);

            // Seed sample inquiry
            $stmtInq = $pdo->prepare("
                INSERT INTO `rfp_inquiries` 
                (`client_name`, `email`, `phone`, `sector`, `venue_type`, `estimated_budget`, `timeline`, `scope_notes`, `status`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtInq->execute([
                'Al Wasl Tower Management',
                'contracts@alwasltower.ae',
                '+971 4 398 7720',
                'Hospitality',
                'Luxury Ballroom & Acoustic Boardroom',
                'AED 500,000+',
                'Q4 2026',
                'Requesting single-line AV schematics, Crestron NVX distribution, and Martin Audio acoustic array integration.',
                'new'
            ]);
        }

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
    $role = $payload['role'] ?? '';
    if ($role !== 'ceo' && $role !== 'super_admin') {
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
