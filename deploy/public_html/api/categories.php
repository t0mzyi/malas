<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — CATEGORIES REST API (PHP)
 * Endpoints:
 *   GET    /api/categories.php             (Public or protected: list categories)
 *   POST   /api/categories.php             (Protected: create category)
 *   PATCH  /api/categories.php?id={id}     (Protected: update category)
 *   DELETE /api/categories.php?id={id}     (Protected: delete category)
 * ============================================================
 */

require_once __DIR__ . '/config.php';

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
// 1. GET: LIST CATEGORIES
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT c.*, COUNT(p.id) AS product_count
            FROM `categories` c
            LEFT JOIN `products` p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.name ASC
        ");
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success'    => true,
            'count'      => count($rows),
            'categories' => $rows
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. POST: CREATE CATEGORY (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'POST') {
    requireAuth();

    $body = getJsonInput();
    if (empty($body)) $body = $_POST;

    $name = trim($body['name'] ?? '');
    $slug = trim($body['slug'] ?? '');
    $desc = trim($body['description'] ?? '');

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category Name is required.']);
        exit();
    }

    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($name));
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO `categories` (name, slug, description) VALUES (?, ?, ?)");
        $stmt->execute([$name, $slug, $desc ?: null]);

        echo json_encode([
            'success'    => true,
            'message'    => 'Category added successfully.',
            'categoryId' => (int)$pdo->lastInsertId()
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PATCH: UPDATE CATEGORY (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'PATCH') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required.']);
        exit();
    }

    $body = getJsonInput();
    $updates = [];
    $params = [];

    if (!empty($body['name'])) {
        $updates[] = "`name` = ?";
        $params[] = trim($body['name']);
        $updates[] = "`slug` = ?";
        $params[] = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($body['name'])));
    }
    if (isset($body['description'])) {
        $updates[] = "`description` = ?";
        $params[] = trim($body['description']) ?: null;
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No update fields provided.']);
        exit();
    }

    $params[] = $id;

    try {
        $sql = "UPDATE `categories` SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Category updated successfully.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 4. DELETE: REMOVE CATEGORY (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `categories` WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Category deleted successfully.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
