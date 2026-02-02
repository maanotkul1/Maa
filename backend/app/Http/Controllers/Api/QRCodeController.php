<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class QRCodeController extends Controller
{
    /**
     * Generate QR code SVG for a tool
     */
    public function generateQRSvg($id)
    {
        $tool = ToolData::findOrFail($id);

        if (!$tool->qr_identifier) {
            $tool->generateQRCode();
            $tool->save();
        }

        $qrIdentifier = $tool->qr_identifier;

        // Generate simple QR code SVG using meQR or similar
        // For now, return the identifier in a simple format
        $qrData = "tool_id:{$tool->id}|qr_id:{$qrIdentifier}";

        // Generate QR code SVG (simplified - using simple string encoding)
        $svg = $this->generateSimpleQRSvg($qrData);

        return Response::make($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Generate a simple QR-like SVG (placeholder - use real QR library in production)
     */
    private function generateSimpleQRSvg($data)
    {
        // In production, use: endroid/qr-code or similar library
        // For now, return a placeholder SVG with the data
        $encodedData = base64_encode($data);

        return <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="white"/>
  <text x="100" y="95" font-family="Arial" font-size="12" text-anchor="middle" fill="black">
    QR Code
  </text>
  <text x="100" y="115" font-family="Arial" font-size="10" text-anchor="middle" fill="black">
    {$data}
  </text>
  <rect x="10" y="10" width="20" height="20" fill="black"/>
  <rect x="170" y="10" width="20" height="20" fill="black"/>
  <rect x="10" y="170" width="20" height="20" fill="black"/>
</svg>
SVG;
    }

    /**
     * Get QR code identifier for a tool
     */
    public function getQRIdentifier($id)
    {
        $tool = ToolData::findOrFail($id);

        if (!$tool->qr_identifier) {
            $tool->generateQRCode();
            $tool->save();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tool->id,
                'qr_identifier' => $tool->qr_identifier,
                'qr_code' => $tool->qr_code,
                'nama_tools' => $tool->nama_tools,
            ],
        ]);
    }
}
