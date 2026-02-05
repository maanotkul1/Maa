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
        // For SQLite, we need to modify the schema to allow NULL values for specific columns
        // Since SQLite has limited ALTER TABLE support, we'll use pragma directives
        if (DB::getDriverName() === 'sqlite' && Schema::hasTable('history_jobs_old')) {
            // Disable foreign keys temporarily
            DB::statement('PRAGMA foreign_keys = OFF;');

            try {
                // Get the current table schema
                $columns = DB::select('PRAGMA table_info(history_jobs)');

                // Build new CREATE TABLE statement with nullable columns
                $createTableSQL = 'CREATE TABLE history_jobs_new (';
                $columnDefs = [];

                foreach ($columns as $col) {
                    $colDef = $col->name . ' ' . $col->type;

                    // Make specific columns nullable
                    if (in_array($col->name, ['nama_client', 'tanggal_pekerjaan', 'field_engineer_1'])) {
                        // Remove NOT NULL if it exists and make nullable
                        if ($col->notnull) {
                            $colDef = str_replace(' NOT NULL', '', $colDef);
                        }
                    } else {
                        // Keep existing constraints for other columns
                        if ($col->notnull) {
                            $colDef .= ' NOT NULL';
                        }
                    }

                    if ($col->pk) {
                        $colDef .= ' PRIMARY KEY';
                    }

                    $columnDefs[] = $colDef;
                }

                $createTableSQL .= implode(', ', $columnDefs) . ')';

                // Rename old table
                DB::statement('ALTER TABLE history_jobs RENAME TO history_jobs_old;');

                // Create new table with nullable columns
                DB::statement($createTableSQL);

                // Copy data back
                DB::statement('INSERT INTO history_jobs SELECT * FROM history_jobs_old;');

                // Drop old table
                DB::statement('DROP TABLE history_jobs_old;');

                // Re-enable foreign keys
                DB::statement('PRAGMA foreign_keys = ON;');
            } catch (\Exception $e) {
                DB::statement('PRAGMA foreign_keys = ON;');
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting is not practical for SQLite table recreation
    }
};
