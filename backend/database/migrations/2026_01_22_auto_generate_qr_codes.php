<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools_data', function (Blueprint $table) {
            // Add QR code field if not exists
            if (!Schema::hasColumn('tools_data', 'qr_code')) {
                $table->text('qr_code')->nullable()->after('data_tools')->comment('Auto-generated QR code (SVG)');
            }

            // Add unique qr identifier
            if (!Schema::hasColumn('tools_data', 'qr_identifier')) {
                $table->string('qr_identifier')->unique()->nullable()->after('qr_code')->comment('Unique QR identifier (never changes)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools_data', function (Blueprint $table) {
            $table->dropColumn(['qr_code', 'qr_identifier']);
        });
    }
};
