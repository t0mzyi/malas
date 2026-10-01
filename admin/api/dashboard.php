<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — DASHBOARD STATS & HEALTH API (PHP)
 * Endpoints:
 *   GET /api/dashboard.php?action=stats   (Protected: counts)
 *   GET /api/dashboard.php?action=health  (System DB Health)
 * ============================================================
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if (empty($action) && !empty($_SERVER['PATH_INFO'])) {
    $action = trim($_SERVER['PATH_INFO'], '/');
}

if (empty($action)) {
    $action = 'stats';
}

// -------------------------------------------------------------
// 1. GET: DASHBOARD STATS (PROTECTED)
// -------------------------------------------------------------
if ($action === 'stats' && $method === 'GET') {
    requireAuth();

    if (!$pdo) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database connection unavailable.'
        ]);
        exit();
    }

    try {
        $totalInq = (int)$pdo->query("SELECT COUNT(*) FROM `rfp_inquiries`")->fetchColumn();
        $newInq   = (int)$pdo->query("SELECT COUNT(*) FROM `rfp_inquiries` WHERE `status` = 'new'")->fetchColumn();
        $inReview = (int)$pdo->query("SELECT COUNT(*) FROM `rfp_inquiries` WHERE `status` = 'in_review'")->fetchColumn();
        $admins   = (int)$pdo->query("SELECT COUNT(*) FROM `admins`")->fetchColumn();

        $dbHealth = testConnection();

        echo json_encode([
            'success' => true,
            'stats'   => [
                'total'    => $totalInq,
                'new'      => $newInq,
                'inReview' => $inReview,
                'admins'   => $admins
            ],
            'db'      => $dbHealth
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 2. GET: HEALTH TELEMETRY
// -------------------------------------------------------------
if ($action === 'health' && $method === 'GET') {
    $dbHealth = testConnection();

    echo json_encode([
        'status'    => $dbHealth['connected'] ? 'healthy' : 'database_disconnected',
        'timestamp' => date('c'),
        'database'  => $dbHealth
    ]);
    exit();
}

// Default 404
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint action not found.']);
