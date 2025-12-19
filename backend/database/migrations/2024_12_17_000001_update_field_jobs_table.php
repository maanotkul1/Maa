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
        Schema::table('field_jobs', function (Blueprint $table) {
            // Rename and add new fields
            $table->string('no')->nullable()->after('id');
            $table->date('tanggal')->nullable()->after('no');
            $table->string('kategori')->nullable()->after('tanggal');
            $table->string('req_by')->nullable()->after('kategori');
            $table->string('tiket_all_bnet')->nullable()->after('req_by');
            $table->string('id_nama_pop_odp_jb')->nullable()->after('tiket_all_bnet');
            $table->text('tikor')->nullable()->after('id_nama_pop_odp_jb');
            $table->text('detail')->nullable()->after('tikor');
            $table->time('janji_datang')->nullable()->after('detail');
            $table->string('petugas_1')->nullable()->after('janji_datang');
            $table->string('petugas_2')->nullable()->after('petugas_1');
            $table->string('petugas_3')->nullable()->after('petugas_2');
            $table->string('ba')->nullable()->after('petugas_3');
            $table->text('remarks')->nullable()->after('ba');
            
            // Update status enum
            $table->enum('status', ['done', 're-schedule', 'waiting', 'open'])->default('open')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('field_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'no',
                'tanggal',
                'kategori',
                'req_by',
                'tiket_all_bnet',
                'id_nama_pop_odp_jb',
                'tikor',
                'detail',
                'janji_datang',
                'petugas_1',
                'petugas_2',
                'petugas_3',
                'ba',
                'remarks',
            ]);
            
            $table->enum('status', ['open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue'])->default('open')->change();
        });
    }
};

