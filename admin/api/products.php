<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — PRODUCTS REST API (PHP)
 * Endpoints:
 *   GET    /api/products.php             (Public or protected: list products)
 *   POST   /api/products.php             (Protected: create product)
 *   PATCH  /api/products.php?id={id}     (Protected: update product)
 *   DELETE /api/products.php?id={id}     (Protected: delete product)
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
// 1. GET: LIST PRODUCTS
// -------------------------------------------------------------
if ($method === 'GET') {
    $categoryId = $_GET['category_id'] ?? '';
    $search     = $_GET['search'] ?? '';
    $status     = $_GET['status'] ?? '';

    $query = "
        SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM `products` p
        LEFT JOIN `categories` c ON c.id = p.category_id
        WHERE 1=1
    ";
    $params = [];

    if (!empty($categoryId) && $categoryId !== 'all') {
        $query .= " AND p.category_id = ?";
        $params[] = (int)$categoryId;
    }

    if (!empty($status) && $status !== 'all') {
        $query .= " AND p.status = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $query .= " AND (p.name LIKE ? OR p.model_number LIKE ? OR p.description LIKE ?)";
        $term = "%" . trim($search) . "%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $query .= " ORDER BY p.created_at DESC";

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success'  => true,
            'count'    => count($rows),
            'products' => $rows
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. POST: CREATE PRODUCT (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'POST') {
    $auth = requireAuth();

    $body = getJsonInput();
    if (empty($body)) $body = $_POST;

    $name        = trim($body['name'] ?? '');
    $catId       = !empty($body['category_id']) ? (int)$body['category_id'] : null;
    $modelNumber = trim($body['model_number'] ?? '');
    $tagline     = trim($body['tagline'] ?? '');
    $description = trim($body['description'] ?? '');
    $specs       = trim($body['specifications'] ?? '');
    $imageUrl    = trim($body['image_url'] ?? '');
    $status      = in_array($body['status'] ?? '', ['active', 'draft']) ? $body['status'] : 'active';
    $createdBy   = $auth['fullName'] ?? $auth['username'] ?? 'Staff';

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product Name is mandatory.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO `products` 
            (category_id, name, model_number, tagline, description, specifications, image_url, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $catId,
            $name,
            $modelNumber ?: null,
            $tagline ?: null,
            $description ?: null,
            $specs ?: null,
            $imageUrl ?: null,
            $status,
            $createdBy
        ]);

        echo json_encode([
            'success'   => true,
            'message'   => 'Product registered in catalog successfully.',
            'productId' => (int)$pdo->lastInsertId()
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PATCH: UPDATE PRODUCT (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'PATCH') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product ID is required.']);
        exit();
    }

    $body = getJsonInput();
    $updates = [];
    $params = [];

    if (isset($body['category_id'])) {
        $updates[] = "`category_id` = ?";
        $params[] = !empty($body['category_id']) ? (int)$body['category_id'] : null;
    }
    if (!empty($body['name'])) {
        $updates[] = "`name` = ?";
        $params[] = trim($body['name']);
    }
    if (isset($body['model_number'])) {
        $updates[] = "`model_number` = ?";
        $params[] = trim($body['model_number']) ?: null;
    }
    if (isset($body['tagline'])) {
        $updates[] = "`tagline` = ?";
        $params[] = trim($body['tagline']) ?: null;
    }
    if (isset($body['description'])) {
        $updates[] = "`description` = ?";
        $params[] = trim($body['description']) ?: null;
    }
    if (isset($body['specifications'])) {
        $updates[] = "`specifications` = ?";
        $params[] = trim($body['specifications']) ?: null;
    }
    if (isset($body['image_url'])) {
        $updates[] = "`image_url` = ?";
        $params[] = trim($body['image_url']) ?: null;
    }
    if (isset($body['status']) && in_array($body['status'], ['active', 'draft'])) {
        $updates[] = "`status` = ?";
        $params[] = $body['status'];
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No update fields provided.']);
        exit();
    }

    $params[] = $id;

    try {
        $sql = "UPDATE `products` SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Product updated successfully.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 4. DELETE: REMOVE PRODUCT (ANY AUTHENTICATED STAFF)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product ID is required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `products` WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Product removed from catalog.']);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
