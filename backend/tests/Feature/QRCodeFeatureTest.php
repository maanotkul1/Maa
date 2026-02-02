<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\ToolData;
use App\Models\ToolQRUpdate;
use App\Models\User;
use App\Services\QRCodeService;

class QRCodeFeatureTest extends TestCase
{
    protected $admin;
    protected $qrCodeService;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user for testing
        $this->admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Test Admin',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ]
        );

        $this->qrCodeService = new QRCodeService();
    }

    /**
     * Test generate QR code
     */
    public function test_generate_qr_code()
    {
        $tool = ToolData::firstOrCreate(
            ['nama_tools' => 'Test Tool'],
            [
                'kategori_tools' => 'Test Category',
                'status' => 'aktif',
                'data_tools' => [],
            ]
        );

        $qr = $this->qrCodeService->generateQRCode($tool, 30);

        $this->assertNotNull($qr);
        $this->assertEquals('active', $qr->status);
        $this->assertEquals(0, $qr->scan_count);
        $this->assertNotNull($qr->qr_code);
        $this->assertNotNull($qr->qr_hash);
    }

    /**
     * Test generate QR endpoint
     */
    public function test_generate_qr_endpoint()
    {
        $tool = ToolData::firstOrCreate(
            ['nama_tools' => 'Test Tool 2'],
            [
                'kategori_tools' => 'Test Category',
                'status' => 'aktif',
                'data_tools' => [],
            ]
        );

        $response = $this->actingAs($this->admin)
            ->postJson("/api/tool-data/{$tool->id}/generate-qr", [
                'expiry_days' => 30,
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'data' => ['id', 'qr_code', 'status', 'image_url'],
        ]);
    }

    /**
     * Test scan QR code
     */
    public function test_scan_qr_code()
    {
        $tool = ToolData::firstOrCreate(
            ['nama_tools' => 'Test Tool 3'],
            [
                'kategori_tools' => 'Test Category',
                'status' => 'aktif',
                'data_tools' => [],
                'last_month_update' => null, // Never updated
            ]
        );

        $qr = $this->qrCodeService->generateQRCode($tool, 30);

        $result = $this->qrCodeService->scanQRCode($qr->qr_code, $tool);

        $this->assertTrue($result['success']);
        $this->assertEquals('success', $result['status']);

        // Verify tool was updated
        $tool->refresh();
        $this->assertNotNull($tool->last_month_update);
    }

    /**
     * Test scan QR endpoint
     */
    public function test_scan_qr_endpoint()
    {
        $tool = ToolData::firstOrCreate(
            ['nama_tools' => 'Test Tool 4'],
            [
                'kategori_tools' => 'Test Category',
                'status' => 'aktif',
                'data_tools' => [],
                'last_month_update' => null,
            ]
        );

        $qr = $this->qrCodeService->generateQRCode($tool, 30);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/tool-data/{$tool->id}/scan-qr", [
                'qr_code' => $qr->qr_code,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    /**
     * Test get QR status
     */
    public function test_get_qr_status()
    {
        $tool = ToolData::firstOrCreate(
            ['nama_tools' => 'Test Tool 5'],
            [
                'kategori_tools' => 'Test Category',
                'status' => 'aktif',
                'data_tools' => [],
            ]
        );

        $qr = $this->qrCodeService->generateQRCode($tool, 30);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tool-data/{$tool->id}/qr-status");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'has_active_qr',
                'qr_status',
                'last_update',
                'can_update',
                'current_qr',
            ],
        ]);
    }

    /**
     * Test monthly update status
     */
    public function test_monthly_update_status()
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/tool-data/monthly-update-status');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'nama_tools',
                    'kategori_tools',
                    'last_update',
                    'can_update',
                    'status',
                ],
            ],
        ]);
    }

    /**
     * Test cannot scan twice in one month
     */
    public function test_cannot_scan_twice_in_one_month()
    {
        $tool = ToolData::create([
            'nama_tools' => 'Test Tool 6',
            'kategori_tools' => 'Test Category',
            'status' => 'aktif',
            'data_tools' => [],
            'last_month_update' => \Carbon\Carbon::now()->format('Y-m'),
        ]);

        $qr = $this->qrCodeService->generateQRCode($tool, 30);

        $result = $this->qrCodeService->scanQRCode($qr->qr_code, $tool);

        $this->assertFalse($result['success']);
        $this->assertEquals('not_due', $result['status']);
    }
}
