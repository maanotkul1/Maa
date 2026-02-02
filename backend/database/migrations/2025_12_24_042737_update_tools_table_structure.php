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
        $driver = Schema::getConnection()->getDriverName();

        Schema::table('tools', function (Blueprint $table) use ($driver) {
            // Rename existing fields if needed
            // Keep kode_tool, nama_tool, kondisi
            
            // Add new fields for kategori/jenis tools
            if (!Schema::hasColumn('tools', 'kategori')) {
                if ($driver === 'sqlite') {
                    $table->string('kategori')->nullable()->after('nama_tool');
                } else {
                    $table->enum('kategori', ['alat_fo', 'alat_ukur', 'alat_listrik', 'alat_mekanik', 'apd', 'lainnya'])->nullable()->after('nama_tool');
                }
            }
            
            // Add new fields
            if (!Schema::hasColumn('tools', 'merek_tipe')) {
                $table->string('merek_tipe')->nullable()->after('kategori');
            }
            if (!Schema::hasColumn('tools', 'nomor_seri')) {
                $table->string('nomor_seri')->nullable()->after('merek_tipe');
            }
            if (!Schema::hasColumn('tools', 'status_kepemilikan')) {
                if ($driver === 'sqlite') {
                    $table->string('status_kepemilikan')->default('milik_perusahaan')->after('kondisi');
                } else {
                    $table->enum('status_kepemilikan', ['milik_perusahaan', 'pribadi_fe'])->default('milik_perusahaan')->after('kondisi');
                }
            }
            if (!Schema::hasColumn('tools', 'field_engineer_id')) {
                $table->unsignedBigInteger('field_engineer_id')->nullable()->after('status_kepemilikan');
            }

            // Optional: store FE name as plain text (frontend uses text input)
            if (!Schema::hasColumn('tools', 'field_engineer_name')) {
                $table->string('field_engineer_name')->nullable()->after('field_engineer_id');
            }

            if (!Schema::hasColumn('tools', 'tanggal_terima')) {
                $table->date('tanggal_terima')->nullable()->after('field_engineer_name');
            }
            if (!Schema::hasColumn('tools', 'tanggal_kalibrasi_terakhir')) {
                $table->date('tanggal_kalibrasi_terakhir')->nullable()->after('tanggal_terima');
            }
            if (!Schema::hasColumn('tools', 'tanggal_maintenance_terakhir')) {
                $table->date('tanggal_maintenance_terakhir')->nullable()->after('tanggal_kalibrasi_terakhir');
            }
            if (!Schema::hasColumn('tools', 'catatan_keterangan')) {
                $table->text('catatan_keterangan')->nullable()->after('tanggal_maintenance_terakhir');
            }
            if (!Schema::hasColumn('tools', 'foto_tool')) {
                $table->string('foto_tool')->nullable()->after('catatan_keterangan');
            }
            
            // Modify existing fields
            // Keep jenis_tool for backward compatibility, but kategori is the new field
            // Keep kondisi enum but update values: baik, rusak, maintenance, hilang
            // Remove or keep old fields: deskripsi, lokasi, tanggal_pembelian, harga, catatan
            
            // Add foreign key for field_engineer_id (skip for sqlite to avoid alter-table FK issues)
            if ($driver !== 'sqlite') {
                $table->foreign('field_engineer_id')->references('id')->on('users')->onDelete('set null');
            }
            
            // Add index
            if (Schema::hasColumn('tools', 'kategori')) {
                $table->index('kategori');
            }
            if (Schema::hasColumn('tools', 'status_kepemilikan')) {
                $table->index('status_kepemilikan');
            }
            if (Schema::hasColumn('tools', 'field_engineer_id')) {
                $table->index('field_engineer_id');
            }
        });
        
        // Update kondisi enum values if needed (baik, rusak, maintenance, hilang)
        // Note: For MySQL, we might need to alter the enum separately
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        Schema::table('tools', function (Blueprint $table) {
            if ($driver !== 'sqlite') {
                $table->dropForeign(['field_engineer_id']);
            }
            // Index drops are best-effort; ignore if they don't exist in some schemas
            try { $table->dropIndex(['kategori']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['status_kepemilikan']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['field_engineer_id']); } catch (\Throwable $e) {}
            
            $table->dropColumn([
                'kategori',
                'merek_tipe',
                'nomor_seri',
                'status_kepemilikan',
                'field_engineer_id',
                'field_engineer_name',
                'tanggal_terima',
                'tanggal_kalibrasi_terakhir',
                'tanggal_maintenance_terakhir',
                'catatan_keterangan',
                'foto_tool',
            ]);
        });
    }
};
