<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — INQUIRIES REST API (PHP)
 * Endpoints:
 *   GET    /api/inquiries.php             (Protected: list inquiries)
 *   POST   /api/inquiries.php             (Public: submit inquiry)
 *   PATCH  /api/inquiries.php?id={id}     (Protected: update status)
 *   DELETE /api/inquiries.php?id={id}     (Protected: delete inquiry)
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

// Only allow trusted HTTP method override via header (not query string)
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

// Extract ID from query param or path
$id = $_GET['id'] ?? null;
if (!$id && !empty($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0]) && is_numeric($parts[0])) {
        $id = (int)$parts[0];
    }
}

// -------------------------------------------------------------
// 1. GET: LIST INQUIRIES (PROTECTED)
// -------------------------------------------------------------
if ($method === 'GET') {
    requireAuth();

    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    $query = "SELECT * FROM `rfp_inquiries` WHERE 1=1";
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $query .= " AND `status` = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $query .= " AND (`client_name` LIKE ? OR `email` LIKE ? OR `venue_type` LIKE ?)";
        $term = "%" . trim($search) . "%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $query .= " ORDER BY `created_at` DESC LIMIT 100";

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success'   => true,
            'count'     => count($rows),
            'inquiries' => $rows
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. POST: SUBMIT NEW INQUIRY (PUBLIC RFP SUBMISSION)
// -------------------------------------------------------------
if ($method === 'POST') {
    $body = getJsonInput();
    if (empty($body)) {
        $body = $_POST;
    }

    $clientName = trim($body['client_name'] ?? $body['name'] ?? '');
    $email      = trim(strtolower($body['email'] ?? ''));
    $phone      = trim($body['phone'] ?? '');
    $sector     = trim($body['sector'] ?? 'Commercial');
    $venueType  = trim($body['venue_type'] ?? $body['project'] ?? '');
    $budget     = trim($body['estimated_budget'] ?? $body['budget'] ?? '');
    $timeline   = trim($body['timeline'] ?? '');
    $scopeNotes = trim($body['scope_notes'] ?? $body['message'] ?? '');

    if (empty($clientName) || empty($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Client Name and Email are mandatory.'
        ]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO `rfp_inquiries` 
            (`client_name`, `email`, `phone`, `sector`, `venue_type`, `estimated_budget`, `timeline`, `scope_notes`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
        ");
        $stmt->execute([
            $clientName,
            $email,
            $phone ?: null,
            $sector,
            $venueType ?: null,
            $budget ?: null,
            $timeline ?: null,
            $scopeNotes ?: null
        ]);

        $newId = $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success'   => true,
            'message'   => 'Inquiry successfully registered in Malas Electronics engineering dispatch system.',
            'inquiryId' => (int)$newId
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database insertion failed: ' . $e->getMessage()
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PATCH: UPDATE INQUIRY STATUS (PROTECTED)
// -------------------------------------------------------------
if ($method === 'PATCH') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Inquiry ID is required.']);
        exit();
    }

    $body = getJsonInput();
    $updates = [];
    $params = [];

    $validStatuses = ['new', 'contacted', 'in_review', 'quoted', 'archived'];
    if (isset($body['status'])) {
        if (!in_array($body['status'], $validStatuses, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status value. Allowed: ' . implode(', ', $validStatuses)]);
            exit();
        }
        $updates[] = "`status` = ?";
        $params[] = $body['status'];
    }
    if (isset($body['assigned_engineer'])) {
        $updates[] = "`assigned_engineer` = ?";
        $params[] = $body['assigned_engineer'];
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No update fields provided.']);
        exit();
    }

    $params[] = $id;

    try {
        $sql = "UPDATE `rfp_inquiries` SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => 'Inquiry updated successfully.'
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 4. DELETE: DELETE INQUIRY (PROTECTED)
// -------------------------------------------------------------
if ($method === 'DELETE') {
    requireAuth();

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Inquiry ID is required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `rfp_inquiries` WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode([
            'success' => true,
            'message' => 'Inquiry record deleted successfully.'
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// Method not allowed
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
