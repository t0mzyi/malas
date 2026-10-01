<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — AUTHENTICATION API (PHP)
 * Endpoints:
 *   POST /api/auth.php?action=login   (or /api/auth/login)
 *   POST /api/auth.php?action=logout  (or /api/auth/logout)
 *   GET  /api/auth.php?action=me      (or /api/auth/me)
 * ============================================================
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Database connection failed. Please ensure MariaDB is running on localhost.'
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Support PATH_INFO (e.g., auth.php/login or auth.php/me)
if (empty($action) && !empty($_SERVER['PATH_INFO'])) {
    $action = trim($_SERVER['PATH_INFO'], '/');
}

// Default action based on method if not specified
if (empty($action)) {
    if ($method === 'POST') {
        $action = 'login';
    } elseif ($method === 'GET') {
        $action = 'me';
    }
}

// -------------------------------------------------------------
// 1. POST: LOGIN
// -------------------------------------------------------------
if ($action === 'login' && $method === 'POST') {
    $body = getJsonInput();
    $username = trim($body['username'] ?? $_POST['username'] ?? '');
    $password = $body['password'] ?? $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Username/Email and Password are required.'
        ]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id, username, email, password_hash, full_name, role, status 
            FROM `admins` 
            WHERE username = ? OR email = ? 
            LIMIT 1
        ");
        $stmt->execute([$username, strtolower($username)]);
        $admin = $stmt->fetch();

        if (!$admin) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error'   => 'Invalid credentials. Access denied.'
            ]);
            exit();
        }

        if ($admin['status'] !== 'active') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error'   => 'Account has been suspended. Contact system administrator.'
            ]);
            exit();
        }

        // Verify password hash
        if (!password_verify($password, $admin['password_hash'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error'   => 'Invalid credentials. Access denied.'
            ]);
            exit();
        }

        // Update last login timestamp
        $updateStmt = $pdo->prepare("UPDATE `admins` SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$admin['id']]);

        // Issue JWT token (valid for 24 hours)
        $token = generateJWT([
            'id'       => (int)$admin['id'],
            'username' => $admin['username'],
            'email'    => $admin['email'],
            'role'     => $admin['role'],
            'fullName' => $admin['full_name']
        ], 86400);

        // Set secure HTTP cookie
        setcookie('admin_token', $token, [
            'expires'  => time() + 86400,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Authentication successful.',
            'token'   => $token,
            'admin'   => [
                'id'       => (int)$admin['id'],
                'username' => $admin['username'],
                'email'    => $admin['email'],
                'fullName' => $admin['full_name'],
                'role'     => $admin['role']
            ]
        ]);
        exit();

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Authentication database error: ' . $e->getMessage()
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. POST: LOGOUT
// -------------------------------------------------------------
if ($action === 'logout' && $method === 'POST') {
    setcookie('admin_token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully.'
    ]);
    exit();
}

// -------------------------------------------------------------
// 3. GET: ME (Verify current session)
// -------------------------------------------------------------
if ($action === 'me' && $method === 'GET') {
    $auth = requireAuth();

    try {
        $stmt = $pdo->prepare("
            SELECT id, username, email, full_name, role, status, last_login, created_at 
            FROM `admins` 
            WHERE id = ? 
            LIMIT 1
        ");
        $stmt->execute([$auth['id']]);
        $admin = $stmt->fetch();

        if (!$admin || $admin['status'] !== 'active') {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Admin profile not found or inactive.']);
            exit();
        }

        echo json_encode([
            'success' => true,
            'admin'   => [
                'id'        => (int)$admin['id'],
                'username'  => $admin['username'],
                'email'     => $admin['email'],
                'fullName'  => $admin['full_name'],
                'role'      => $admin['role'],
                'lastLogin' => $admin['last_login']
            ]
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// Default 404
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint or method not found.']);
