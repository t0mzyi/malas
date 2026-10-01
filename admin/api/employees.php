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

    $username = trim($body['username'] ?? '');
    $email    = trim(strtolower($body['email'] ?? ''));
    $password = $body['password'] ?? '';
    $fullName = trim($body['full_name'] ?? 'Malas Staff Member');
    $role     = in_array($body['role'] ?? '', ['employee', 'ceo']) ? $body['role'] : 'employee';

    if (empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Username, Email, and Initial Password are required.'
        ]);
        exit();
    }

    try {
        // Check uniqueness
        $check = $pdo->prepare("SELECT id FROM `admins` WHERE username = ? OR email = ? LIMIT 1");
        $check->execute([$username, $email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error'   => 'An account with this username or email already exists.'
            ]);
            exit();
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO `admins` (username, email, password_hash, full_name, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([$username, $email, $hash, $fullName, $role]);

        echo json_encode([
            'success'    => true,
            'message'    => "Employee account created successfully with {$role} privileges.",
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
