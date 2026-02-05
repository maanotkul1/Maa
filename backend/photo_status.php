<?php
$dbPath = realpath(__DIR__ . '/database/database.sqlite');

if (!file_exists($dbPath)) {
  echo "Database not found at: $dbPath\n";
  exit(1);
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->query('SELECT id, job_number, job_type, foto_rumah, foto_pemasangan FROM history_jobs ORDER BY id DESC LIMIT 10');
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== HISTORY JOBS PHOTO STATUS ===\n\n";

foreach ($records as $r) {
  $photo_status = '';
  if ($r['foto_rumah'] && $r['foto_pemasangan']) {
    $photo_status = '✓ Both photos';
  } elseif ($r['foto_rumah']) {
    $photo_status = '✓ Only foto_rumah';
  } elseif ($r['foto_pemasangan']) {
    $photo_status = '✓ Only foto_pemasangan';
  } else {
    $photo_status = '✗ No photos';
  }

  echo "ID: {$r['id']} | Job: {$r['job_number']} | Type: {$r['job_type']} | $photo_status\n";
}

$total = $pdo->query('SELECT COUNT(*) as cnt FROM history_jobs')->fetch(PDO::FETCH_ASSOC)['cnt'];
$withPhotos = $pdo->query('SELECT COUNT(*) as cnt FROM history_jobs WHERE (foto_rumah IS NOT NULL OR foto_pemasangan IS NOT NULL)')->fetch(PDO::FETCH_ASSOC)['cnt'];

echo "\n\nSummary:\n";
echo "Total: $total\n";
echo "With photos: $withPhotos\n";
echo "Without photos: " . ($total - $withPhotos) . "\n";
?>
