<?php
/**
 * ============================================================
 * MALAS ELECTRONICS LLC — CLOUDINARY UPLOAD API (PURE PHP)
 * Endpoint: POST /api/upload.php
 * Accepts: JSON payload with { "image": "data:image/...;base64,..." }
 *          or standard multipart/form-data $_FILES['file']
 * ============================================================
 */

require_once __DIR__ . '/config.php';

// Verify Administrator / Staff Clearance
$auth = requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit();
}

// 1. Extract image payload (base64 string or multipart file)
$imageData = null;

$body = getJsonInput();
if (!empty($body['image'])) {
    $imageData = $body['image'];
} elseif (!empty($_POST['image'])) {
    $imageData = $_POST['image'];
} elseif (!empty($_FILES['file']['tmp_name'])) {
    $tmpPath = $_FILES['file']['tmp_name'];
    $mime = mime_content_type($tmpPath) ?: 'image/jpeg';
    $rawBinary = file_get_contents($tmpPath);
    $imageData = 'data:' . $mime . ';base64,' . base64_encode($rawBinary);
}

if (!$imageData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image data provided for upload.']);
    exit();
}

// 2. Prepare Cloudinary Parameters & Signature
$timestamp = time();
$folder = 'malas_products';

// Cloudinary signature is sha1 of sorted params concatenated with API secret
$paramsToSign = "folder={$folder}&timestamp={$timestamp}";
$signature = sha1($paramsToSign . CLOUDINARY_API_SECRET);

$cloudName = CLOUDINARY_CLOUD_NAME;
$cloudinaryUrl = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

$postFields = [
    'file'      => $imageData,
    'api_key'   => CLOUDINARY_API_KEY,
    'timestamp' => $timestamp,
    'signature' => $signature,
    'folder'    => $folder
];

// 3. Dispatch to Cloudinary REST API via Native cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $cloudinaryUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || !empty($curlError)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'cURL error contacting Cloudinary: ' . $curlError
    ]);
    exit();
}

$result = json_decode($response, true);

if (!empty($result['secure_url'])) {
    echo json_encode([
        'success'   => true,
        'url'       => $result['secure_url'],
        'public_id' => $result['public_id'] ?? null
    ]);
    exit();
}

$errorMessage = $result['error']['message'] ?? 'Failed to upload image to Cloudinary.';
http_response_code($httpCode >= 400 ? $httpCode : 500);
echo json_encode([
    'success' => false,
    'error'   => $errorMessage
]);
exit();
