<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — EMPLOYEES REST API (PHP)
 * STRICTLY RESTRICTED TO CHIEF EXECUTIVE OFFICER (CEO)
 * Endpoints:
 *   GET    /api/employees.php             (CEO only: list staff)
 *   POST   /api/employees.php             (CEO only: create staff account)
 *   PATCH  /api/employees.php?id={id}     (CEO only: update staff status/role)
 *   DELETE /api/employees.php?id={id}     (CEO only: delete staff)
 * ============================================================
 */

require_once __DIR__ . '/config.php';

// Enforce CEO Role
$ceo = requireCeo();

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection unavailable.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle method overrides
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
} elseif ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
} elseif ($method === 'POST' && isset($_GET['action'])) {
    if ($_GET['action'] === 'update') $method = 'PATCH';
    if ($_GET['action'] === 'delete') $method = 'DELETE';
}

$id = $_GET['id'] ?? null;
if (!$id && !empty($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0]) && is_numeric($parts[0])) {
        $id = (int)$parts[0];
    }
}

// -------------------------------------------------------------
// 1. GET: LIST EMPLOYEES
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT id, username, email, full_name, role, status, last_login, created_at 
            FROM `admins` 
            ORDER BY `role` ASC, `created_at` DESC
        ");
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success'   => true,
            'count'     => count($rows),
            'employees' => $rows
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. POST: CREATE EMPLOYEE ACCOUNT (CEO ONLY)
// -------------------------------------------------------------
if ($method === 'POST') {
    $body = getJsonInput();
    if (empty($body)) $body = $_POST;

    $email    = trim(strtolower($body['email'] ?? ''));
    $password = $body['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Corporate Email and Initial Password are required.'
        ]);
        exit();
    }

    $username = trim($body['username'] ?? '');
    if (empty($username)) {
        $parts = explode('@', $email);
        $username = $parts[0] ?: 'staff';
    }

    $fullName = trim($body['full_name'] ?? '');
    if (empty($fullName)) {
        $fullName = ucwords(str_replace(['.', '_', '-'], ' ', $username));
    }
    $role = 'employee';

    try {
        // Check uniqueness of email
        $checkEmail = $pdo->prepare("SELECT id FROM `admins` WHERE email = ? LIMIT 1");
        $checkEmail->execute([$email]);
        if ($checkEmail->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error'   => 'An employee account with this corporate email already exists.'
            ]);
            exit();
        }

        // If username exists, append a random number
        $checkUser = $pdo->prepare("SELECT id FROM `admins` WHERE username = ? LIMIT 1");
        $checkUser->execute([$username]);
        if ($checkUser->fetch()) {
            $username .= '_' . rand(100, 999);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO `admins` (username, email, password_hash, full_name, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([$username, $email, $hash, $fullName, $role]);

        echo json_encode([
            'success'    => true,
            'message'    => "Operations employee account created successfully for {$email}.",
            'employeeId' => (int)$pdo->lastInsertId()
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PATCH: UPDATE EMPLOYEE (CEO ONLY)
// -------------------------------------------------------------
if ($method === 'PATCH') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Employee ID is required.']);
        exit();
    }

    $body = getJsonInput();
    $updates = [];
    $params = [];

    if (isset($body['status']) && in_array($body['status'], ['active', 'suspended'])) {
        $updates[] = "`status` = ?";
        $params[] = $body['status'];
    }
    if (isset($body['role']) && in_array($body['role'], ['employee', 'ceo'])) {
        $updates[] = "`role` = ?";
        $params[] = $body['role'];
    }
    if (!empty($body['full_name'])) {
        $updates[] = "`full_name` = ?";
        $params[] = trim($body['full_name']);
    }
    if (!empty($body['password']) && strlen(trim($body['password'])) >= 6) {
        $updates[] = "`password_hash` = ?";
        $params[] = password_hash(trim($body['password']), PASSWORD_BCRYPT);
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No valid fields provided for update.']);
        exit();
    }

    $params[] = $id;

    try {
        $sql = "UPDATE `admins` SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Employee record updated successfully.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 4. DELETE: REMOVE EMPLOYEE (CEO ONLY)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Employee ID is required.']);
        exit();
    }

    if ((int)$id === (int)$ceo['id']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'You cannot delete your own CEO account while logged in.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `admins` WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Employee account removed successfully.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
