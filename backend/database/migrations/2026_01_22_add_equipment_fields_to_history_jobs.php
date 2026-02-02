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
        Schema::table('history_jobs', function (Blueprint $table) {
            // Add equipment fields for troubleshooting wireless simplified form
            if (!Schema::hasColumn('history_jobs', 'peralatan_radio')) {
                $table->boolean('peralatan_radio')->default(false)->nullable()->after('catatan_teknisi');
                $table->boolean('peralatan_kabel')->default(false)->nullable()->after('peralatan_radio');
                $table->boolean('peralatan_adaptor')->default(false)->nullable()->after('peralatan_kabel');
                $table->boolean('peralatan_poe')->default(false)->nullable()->after('peralatan_adaptor');
                $table->boolean('peralatan_rj45')->default(false)->nullable()->after('peralatan_poe');
                $table->boolean('peralatan_router_switch')->default(false)->nullable()->after('peralatan_rj45');
                $table->boolean('peralatan_ap')->default(false)->nullable()->after('peralatan_router_switch');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            $columns = [
                'peralatan_radio',
                'peralatan_kabel',
                'peralatan_adaptor',
                'peralatan_poe',
                'peralatan_rj45',
                'peralatan_router_switch',
                'peralatan_ap',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('history_jobs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
