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
            // Make these fields nullable for wireless troubleshooting
            $table->string('tikor_odp_jb')->nullable()->change();
            $table->string('port_odp')->nullable()->change();
            $table->string('redaman')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            $table->string('tikor_odp_jb')->nullable(false)->change();
            $table->string('port_odp')->nullable(false)->change();
        });
    }
};
