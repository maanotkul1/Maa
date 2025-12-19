<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('field_jobs', function (Blueprint $table) {
            $table->foreignId('odp_id')->nullable()->after('id')->constrained('odps')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('field_jobs', function (Blueprint $table) {
            $table->dropForeign(['odp_id']);
            $table->dropColumn('odp_id');
        });
    }
};

