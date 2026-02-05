<?php

namespace App\Console\Commands;

use App\Models\HistoryJob;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TestPhotoUpload extends Command
{
    protected $signature = 'test:photo-upload';
    protected $description = 'Test photo upload functionality';

    public function handle()
    {
        $this->info('=== TEST PHOTO UPLOAD ===\n');

        // Get first record without foto_rumah
        $job = HistoryJob::whereNull('foto_rumah')->first();

        if (!$job) {
            $this->info('No job found without foto_rumah');
            return;
        }

        $this->info("Testing with Job ID: {$job->id} ({$job->job_number})\n");

        // Create test image
        $testImagePath = storage_path('test_photo.jpg');
        $image = imagecreatetruecolor(100, 100);
        $color = imagecolorallocate($image, 255, 0, 0);
        imagefill($image, 0, 0, $color);
        imagejpeg($image, $testImagePath);
        imagedestroy($image);

        $this->info("Test image created\n");

        try {
            $this->info("Storing photo...");

            // Use simple file copy
            $filename = time() . '.jpg';
            $storagePath = 'history_jobs/photos/' . $filename;

            Storage::disk('public')->put($storagePath, file_get_contents($testImagePath));

            $this->info("Photo stored at: $storagePath");

            // Update database
            $job->update(['foto_rumah' => $storagePath]);

            $this->info("Database updated\n");

            // Verify
            $updated = HistoryJob::find($job->id);
            $this->info("Verification:");
            $this->info("  New foto_rumah: " . ($updated->foto_rumah ?? 'NULL'));
            $this->info("  Success: " . (isset($updated->foto_rumah) && $updated->foto_rumah !== null ? 'YES ✓' : 'NO ✗'));

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        } finally {
            @unlink($testImagePath);
        }
    }
}
