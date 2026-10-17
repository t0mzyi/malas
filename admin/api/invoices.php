<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — INVOICES REST API (PHP)
 * Endpoints:
 *   GET  /api/invoices.php         (List all invoices)
 *   GET  /api/invoices.php?id={id} (Invoice detail)
 *   POST /api/invoices.php         (Finalize invoice & deduct stock)
 * ============================================================
 */

require_once __DIR__ . '/config.php';

$admin = requireAuth();

$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection unavailable.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
if (!$id && !empty($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) {
        $id = $parts[0];
    }
}

// -------------------------------------------------------------
// 1. GET: LIST OR SINGLE INVOICE
// -------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM `invoices` WHERE id = ? OR invoice_number = ? LIMIT 1");
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Invoice not found.']);
            exit();
        }
        $row['items'] = json_decode($row['items'] ?: '[]', true);
        echo json_encode(['success' => true, 'invoice' => $row]);
        exit();
    }

    $stmt = $pdo->query("SELECT * FROM `invoices` ORDER BY `created_at` DESC");
    $rows = $stmt->fetchAll();
    $invoices = array_map(function($inv) {
        $inv['items'] = json_decode($inv['items'] ?: '[]', true);
        return $inv;
    }, $rows);

    echo json_encode([
        'success'  => true,
        'count'    => count($invoices),
        'invoices' => $invoices
    ]);
    exit();
}

// -------------------------------------------------------------
// 2. POST: FINALIZE INVOICE & DEDUCT STOCK
// -------------------------------------------------------------
if ($method === 'POST') {
    $body = getJsonInput();
    if (empty($body)) $body = $_POST;

    $clientName  = trim($body['client_name'] ?? '');
    $clientEmail = trim($body['client_email'] ?? '');
    $clientPhone = trim($body['client_phone'] ?? '');
    $projectName = trim($body['project_name'] ?? 'Malas Commercial Project');
    $items       = $body['items'] ?? [];
    $discount    = (float)($body['discount'] ?? 0);
    $vatRate     = isset($body['vat_rate']) ? (float)$body['vat_rate'] : 5.0;

    if (empty($clientName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Client or Company Name is required.']);
        exit();
    }

    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'At least one product item must be added to the invoice.']);
        exit();
    }

    try {
        // 1. Check stock availability for each item
        foreach ($items as $item) {
            $pId = (int)($item['id'] ?? 0);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            if ($pId > 0) {
                $chk = $pdo->prepare("SELECT id, name, stock FROM `products` WHERE id = ? LIMIT 1");
                $chk->execute([$pId]);
                $prod = $chk->fetch();
                if ($prod) {
                    $curStock = isset($prod['stock']) ? (int)$prod['stock'] : 10;
                    if ($curStock < $qty) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error'   => "Insufficient stock for '{$prod['name']}'. Available: {$curStock}, requested: {$qty}."
                        ]);
                        exit();
                    }
                }
            }
        }

        // 2. Compute totals
        $subtotal = 0.0;
        $sanitizedItems = [];
        foreach ($items as $item) {
            $unitPrice = (float)($item['price'] ?? 0);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $lineTotal = $unitPrice * $qty;
            $subtotal += $lineTotal;

            $sanitizedItems[] = [
                'id'           => $item['id'] ?? null,
                'name'         => $item['name'] ?? 'Hardware Item',
                'model_number' => $item['model_number'] ?? '',
                'price'        => $unitPrice,
                'quantity'     => $qty,
                'total'        => $lineTotal,
                'image_url'    => $item['image_url'] ?? ''
            ];
        }

        $taxable = max(0, $subtotal - $discount);
        $vatAmount = ($taxable * $vatRate) / 100.0;
        $totalAmount = $taxable + $vatAmount;

        // 3. Generate invoice number
        $year = date('Y');
        $count = (int)$pdo->query("SELECT COUNT(*) FROM `invoices`")->fetchColumn();
        $invoiceNumber = 'INV-' . $year . '-' . str_pad($count + 101, 4, '0', STR_PAD_LEFT);

        $creatorName = $admin['full_name'] ?? $admin['username'] ?? 'Staff';

        // 4. Insert invoice
        $stmt = $pdo->prepare("
            INSERT INTO `invoices`
            (`invoice_number`, `client_name`, `client_email`, `client_phone`, `project_name`, `items`, `subtotal`, `vat_rate`, `vat_amount`, `discount`, `total_amount`, `status`, `created_by`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalized', ?)
        ");
        $stmt->execute([
            $invoiceNumber,
            $clientName,
            $clientEmail,
            $clientPhone,
            $projectName,
            json_encode($sanitizedItems),
            $subtotal,
            $vatRate,
            $vatAmount,
            $discount,
            $totalAmount,
            $creatorName
        ]);
        $invoiceId = (int)$pdo->lastInsertId();

        // 5. Deduct stock from products
        foreach ($sanitizedItems as $sItem) {
            if (!empty($sItem['id'])) {
                $pId = (int)$sItem['id'];
                $qty = (int)$sItem['quantity'];
                $pdo->prepare("UPDATE `products` SET stock = GREATEST(0, stock - ?) WHERE id = ?")->execute([$qty, $pId]);
                $pdo->prepare("UPDATE `products` SET status = 'out_of_stock' WHERE id = ? AND stock <= 0")->execute([$pId]);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Invoice {$invoiceNumber} created and inventory deducted.",
            'invoice' => [
                'id'             => $invoiceId,
                'invoice_number' => $invoiceNumber,
                'client_name'    => $clientName,
                'client_email'   => $clientEmail,
                'client_phone'   => $clientPhone,
                'project_name'   => $projectName,
                'items'          => $sanitizedItems,
                'subtotal'       => $subtotal,
                'vat_rate'       => $vatRate,
                'vat_amount'     => $vatAmount,
                'discount'       => $discount,
                'total_amount'   => $totalAmount,
                'status'         => 'finalized',
                'created_by'     => $creatorName,
                'created_at'     => date('Y-m-d H:i:s')
            ]
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PUT: UPDATE EXISTING INVOICE
// -------------------------------------------------------------
if ($method === 'PUT') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invoice ID is required for editing.']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM `invoices` WHERE id = ? OR invoice_number = ? LIMIT 1");
    $stmt->execute([$id, $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Invoice not found.']);
        exit();
    }

    $body = getJsonInput();
    $clientName  = trim($body['client_name'] ?? $existing['client_name']);
    $clientEmail = trim($body['client_email'] ?? $existing['client_email']);
    $clientPhone = trim($body['client_phone'] ?? $existing['client_phone']);
    $projectName = trim($body['project_name'] ?? $existing['project_name']);
    $items       = $body['items'] ?? json_decode($existing['items'] ?: '[]', true);
    $discount    = (float)($body['discount'] ?? $existing['discount'] ?? 0);
    $vatRate     = isset($body['vat_rate']) ? (float)$body['vat_rate'] : (float)($existing['vat_rate'] ?? 5.0);

    if (empty($clientName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Client or Company Name is required.']);
        exit();
    }
    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'At least one product item is required.']);
        exit();
    }

    try {
        $subtotal = 0.0;
        $sanitizedItems = [];
        foreach ($items as $item) {
            $unitPrice = (float)($item['price'] ?? 0);
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $lineTotal = $unitPrice * $qty;
            $subtotal += $lineTotal;

            $sanitizedItems[] = [
                'id'           => $item['id'] ?? null,
                'name'         => $item['name'] ?? 'Hardware Item',
                'model_number' => $item['model_number'] ?? '',
                'price'        => $unitPrice,
                'quantity'     => $qty,
                'total'        => $lineTotal,
                'image_url'    => $item['image_url'] ?? ''
            ];
        }

        $taxable = max(0, $subtotal - $discount);
        $vatAmount = ($taxable * $vatRate) / 100.0;
        $totalAmount = $taxable + $vatAmount;

        $upd = $pdo->prepare("
            UPDATE `invoices`
            SET `client_name` = ?,
                `client_email` = ?,
                `client_phone` = ?,
                `project_name` = ?,
                `items` = ?,
                `subtotal` = ?,
                `vat_rate` = ?,
                `vat_amount` = ?,
                `discount` = ?,
                `total_amount` = ?
            WHERE `id` = ?
        ");
        $upd->execute([
            $clientName,
            $clientEmail,
            $clientPhone,
            $projectName,
            json_encode($sanitizedItems),
            $subtotal,
            $vatRate,
            $vatAmount,
            $discount,
            $totalAmount,
            $existing['id']
        ]);

        $stmt = $pdo->prepare("SELECT * FROM `invoices` WHERE id = ? LIMIT 1");
        $stmt->execute([$existing['id']]);
        $updated = $stmt->fetch();
        $updated['items'] = json_decode($updated['items'] ?: '[]', true);

        echo json_encode([
            'success' => true,
            'message' => "Invoice {$existing['invoice_number']} updated successfully.",
            'invoice' => $updated
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}
