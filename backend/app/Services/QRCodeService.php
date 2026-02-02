<?php

namespace App\Services;

use App\Models\ToolData;
use App\Models\ToolQRUpdate;
use App\Models\ToolQRScanHistory;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class QRCodeService
{
    /**
     * Generate QR code untuk tool
     */
    public function generateQRCode(ToolData $toolData, $expiryDays = 30)
    {
        // Invalidate previous QR code if exists
        $existingQR = $toolData->qrUpdates()
            ->where('status', 'active')
            ->first();

        if ($existingQR) {
            $existingQR->update(['status' => 'expired']);
        }

        // Generate unique QR code data
        $qrData = $this->generateQRData($toolData);
        $qrHash = hash('sha256', $qrData);

        // Create new QR record
        $qrUpdate = ToolQRUpdate::create([
            'tools_data_id' => $toolData->id,
            'qr_code' => $qrData,
            'qr_hash' => $qrHash,
            'generated_at' => Carbon::now(),
            'expired_at' => Carbon::now()->addDays($expiryDays),
            'status' => 'active',
            'scan_count' => 0,
        ]);

        return $qrUpdate;
    }

    /**
     * Generate unique QR code data string
     */
    private function generateQRData(ToolData $toolData)
    {
        $timestamp = Carbon::now()->timestamp;
        $uniqueId = Str::random(16);

        return "{$toolData->id}:{$uniqueId}:{$timestamp}";
    }

    /**
     * Generate QR code image URL (menggunakan Google Charts API)
     */
    public function getQRCodeImageUrl(ToolQRUpdate $qrUpdate)
    {
        $data = urlencode($qrUpdate->qr_code);
        $size = urlencode('300x300');

        return "https://chart.googleapis.com/chart?chs={$size}&chld=L|0&cht=qr&chl={$data}";
    }

    /**
     * Validate dan process QR scan
     */
    public function scanQRCode($qrCodeData, ToolData $toolData, $request = null)
    {
        // Find QR update by code
        $qrUpdate = ToolQRUpdate::where('qr_code', $qrCodeData)
            ->where('tools_data_id', $toolData->id)
            ->first();

        if (!$qrUpdate) {
            return [
                'success' => false,
                'message' => 'QR Code tidak ditemukan atau tidak sesuai dengan tool ini',
                'status' => 'invalid',
            ];
        }

        // Check if QR is valid
        if (!$qrUpdate->isValid()) {
            return [
                'success' => false,
                'message' => 'QR Code sudah tidak valid (expired atau sudah digunakan)',
                'status' => 'expired',
            ];
        }

        // Check if tool can be updated (1 month rule)
        if (!$qrUpdate->canBeScanned()) {
            $toolData = $qrUpdate->toolData;
            $lastUpdate = $toolData->last_month_update
                ? Carbon::createFromFormat('Y-m', $toolData->last_month_update)->translatedFormat('F Y', locale: 'id')
                : 'Belum pernah';

            return [
                'success' => false,
                'message' => "Tool ini sudah diupdate pada bulan {$lastUpdate}. Dapat diupdate kembali dalam 1 bulan.",
                'status' => 'not_due',
            ];
        }

        // Create scan history record
        $scanCode = Str::random(32);
        $scanData = $this->extractScanData($request);

        $scanHistory = ToolQRScanHistory::create([
            'tool_qr_update_id' => $qrUpdate->id,
            'tools_data_id' => $toolData->id,
            'scan_code' => $scanCode,
            'scanned_at' => Carbon::now(),
            'device_type' => $scanData['device_type'] ?? 'unknown',
            'ip_address' => $scanData['ip_address'] ?? null,
            'user_agent' => $scanData['user_agent'] ?? null,
            'scan_data' => $scanData,
            'status' => 'success',
        ]);

        // Update QR update record
        $qrUpdate->increment('scan_count');
        $qrUpdate->update([
            'last_scanned_at' => Carbon::now(),
            'status' => 'used',
        ]);

        // Update tool data's last update
        $toolData->update([
            'last_month_update' => Carbon::now()->format('Y-m'),
        ]);

        return [
            'success' => true,
            'message' => 'Tools berhasil diupdate melalui QR Code',
            'status' => 'success',
            'scan_code' => $scanCode,
            'tool_data' => $toolData,
            'qr_update' => $qrUpdate,
            'next_scan_date' => $toolData->last_month_update
                ? Carbon::createFromFormat('Y-m', $toolData->last_month_update)->addMonth()->translatedFormat('F Y', locale: 'id')
                : 'N/A',
        ];
    }

    /**
     * Extract scan data dari request
     */
    private function extractScanData($request)
    {
        if (!$request) {
            return [];
        }

        return [
            'device_type' => $this->detectDeviceType($request->userAgent()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => Carbon::now()->toIso8601String(),
        ];
    }

    /**
     * Detect device type
     */
    private function detectDeviceType($userAgent)
    {
        if (preg_match('/mobile|android|iphone|ipad|phone/i', $userAgent)) {
            return 'mobile';
        }
        return 'web';
    }

    /**
     * Get QR code status
     */
    public function getQRCodeStatus(ToolData $toolData)
    {
        $currentQR = $toolData->qrUpdates()
            ->where('status', 'active')
            ->first();

        $lastUpdate = $toolData->last_month_update
            ? Carbon::createFromFormat('Y-m', $toolData->last_month_update)
            : null;

        $canUpdate = $toolData->canBeUpdated();

        $nextUpdateDate = null;
        if ($lastUpdate && !$canUpdate) {
            $nextUpdateDate = $lastUpdate->addMonth();
        }

        return [
            'has_active_qr' => (bool) $currentQR,
            'qr_status' => $currentQR ? $currentQR->status : 'no_qr',
            'last_update' => $lastUpdate ? $lastUpdate->translatedFormat('d F Y', locale: 'id') : 'Belum pernah',
            'can_update' => $canUpdate,
            'next_update_date' => $nextUpdateDate ? $nextUpdateDate->translatedFormat('d F Y', locale: 'id') : null,
            'days_until_next_update' => !$canUpdate ? $toolData->getRemainingDaysUntilUpdate() : 0,
            'current_qr' => $currentQR ? [
                'id' => $currentQR->id,
                'qr_code' => $currentQR->qr_code,
                'generated_at' => $currentQR->generated_at,
                'expired_at' => $currentQR->expired_at,
                'scan_count' => $currentQR->scan_count,
                'validity_days' => $currentQR->getRemainingValidityDays(),
                'image_url' => $this->getQRCodeImageUrl($currentQR),
            ] : null,
        ];
    }

    /**
     * Get scan history
     */
    public function getScanHistory(ToolData $toolData, $limit = 10)
    {
        $histories = ToolQRScanHistory::where('tools_data_id', $toolData->id)
            ->orderBy('scanned_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($history) {
                return [
                    'id' => $history->id,
                    'scanned_at' => $history->scanned_at->translatedFormat('d F Y H:i:s', locale: 'id'),
                    'device_type' => $history->device_type,
                    'ip_address' => $history->ip_address,
                    'status' => $history->status,
                    'qr_code' => $history->qrUpdate->qr_code ?? 'N/A',
                ];
            });

        return [
            'total_scans' => ToolQRScanHistory::where('tools_data_id', $toolData->id)->count(),
            'histories' => $histories,
        ];
    }

    /**
     * Get monthly update status untuk semua tools
     */
    public function getMonthlyUpdateStatus()
    {
        $tools = ToolData::all();

        return $tools->map(function ($tool) {
            $lastUpdate = $tool->last_month_update
                ? Carbon::createFromFormat('Y-m', $tool->last_month_update)
                : null;

            $canUpdate = $tool->canBeUpdated();
            $activeQR = $tool->qrUpdates()
                ->where('status', 'active')
                ->first();

            return [
                'id' => $tool->id,
                'nama_tools' => $tool->nama_tools,
                'kategori_tools' => $tool->kategori_tools,
                'last_update' => $lastUpdate ? $lastUpdate->translatedFormat('F Y', locale: 'id') : 'Belum pernah',
                'can_update' => $canUpdate,
                'days_remaining' => !$canUpdate ? $tool->getRemainingDaysUntilUpdate() : 0,
                'has_qr' => (bool) $activeQR,
                'status' => $canUpdate ? 'ready_for_update' : 'waiting',
            ];
        });
    }

    /**
     * Generate QR Code image dari kode_tool
     * Returns PNG data URI
     */
    public function generateQRCodeImage(ToolData $tool): string
    {
        // Get kode_tool from tool data_tools
        $dataTools = is_array($tool->data_tools)
            ? $tool->data_tools
            : json_decode($tool->data_tools, true);

        $kodeTools = $dataTools['kode_tool'] ?? 'T' . str_pad($tool->id, 7, '0', STR_PAD_LEFT);

        try {
            // Create QR Code
            $qrCode = new QrCode($kodeTools);
            $qrCode->setSize(300);
            $qrCode->setMargin(10);

            // Generate PNG
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Return as data URI for HTML display
            return $result->getDataUri();
        } catch (\Exception $e) {
            \Log::error('QR Code generation failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Generate QR Code image PNG file and save to storage
     */
    public function saveQRCodeImage(ToolData $tool): ?string
    {
        try {
            // Get kode_tool
            $dataTools = is_array($tool->data_tools)
                ? $tool->data_tools
                : json_decode($tool->data_tools, true);

            $kodeTools = $dataTools['kode_tool'] ?? 'T' . str_pad($tool->id, 7, '0', STR_PAD_LEFT);

            // Create QR Code
            $qrCode = new QrCode($kodeTools);
            $qrCode->setSize(300);
            $qrCode->setMargin(10);

            // Generate PNG
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Save to public storage
            $directory = 'qr_codes';
            $filename = 'qr_' . $tool->id . '_' . str_slug($kodeTools) . '.png';
            $path = $directory . '/' . $filename;

            // Store file
            \Storage::disk('public')->put($path, $result->getString());

            return $path;
        } catch (\Exception $e) {
            \Log::error('QR Code file save failed: ' . $e->getMessage());
            return null;
        }
    }}
