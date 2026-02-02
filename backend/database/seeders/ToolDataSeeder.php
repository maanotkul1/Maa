<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ToolData;
use Carbon\Carbon;

class ToolDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tools = [
            [
                'nama_tools' => 'Laptop Dell XPS 13',
                'kategori_tools' => 'Komputer',
                'data_tools' => [
                    'merek_tipe' => 'Dell XPS 13 9320',
                    'nomor_seri' => 'DXP-2024-001',
                    'kondisi' => 'baik',
                    'status_kepemilikan' => 'milik_perusahaan',
                    'field_engineer_name' => 'John Doe',
                    'tanggal_terima' => '2024-01-15',
                    'catatan_keterangan' => 'Laptop development untuk FE team',
                ],
            ],
            [
                'nama_tools' => 'Monitor LG 27 Inch',
                'kategori_tools' => 'Monitor',
                'data_tools' => [
                    'merek_tipe' => 'LG 27UK850',
                    'nomor_seri' => 'LGM-2024-001',
                    'kondisi' => 'baik',
                    'status_kepemilikan' => 'milik_perusahaan',
                    'field_engineer_name' => 'Jane Smith',
                    'tanggal_terima' => '2024-02-20',
                    'catatan_keterangan' => 'Monitor 4K untuk editing',
                ],
            ],
            [
                'nama_tools' => 'Keyboard Mechanical RGB',
                'kategori_tools' => 'Keyboard',
                'data_tools' => [
                    'merek_tipe' => 'Corsair K95 Platinum',
                    'nomor_seri' => 'CRS-2024-005',
                    'kondisi' => 'rusak',
                    'status_kepemilikan' => 'pribadi_fe',
                    'field_engineer_name' => 'John Doe',
                    'tanggal_terima' => '2024-03-10',
                    'catatan_keterangan' => 'Beberapa key tidak responsif',
                ],
            ],
            [
                'nama_tools' => 'Mouse Logitech MX Master',
                'kategori_tools' => 'Mouse',
                'data_tools' => [
                    'merek_tipe' => 'Logitech MX Master 3',
                    'nomor_seri' => 'LGT-2024-003',
                    'kondisi' => 'perlu_perbaikan',
                    'status_kepemilikan' => 'milik_perusahaan',
                    'field_engineer_name' => 'Mike Johnson',
                    'tanggal_terima' => '2024-04-05',
                    'catatan_keterangan' => 'Scroll wheel perlu servicing',
                ],
            ],
            [
                'nama_tools' => 'USB-C Hub 7 in 1',
                'kategori_tools' => 'Aksesori',
                'data_tools' => [
                    'merek_tipe' => 'Anker USB-C Hub',
                    'nomor_seri' => 'ANK-2024-002',
                    'kondisi' => 'hilang',
                    'status_kepemilikan' => 'milik_perusahaan',
                    'field_engineer_name' => 'Sarah Wilson',
                    'tanggal_terima' => '2024-05-12',
                    'catatan_keterangan' => 'Hilang saat office trip',
                ],
            ],
            [
                'nama_tools' => 'Webcam Logitech C920',
                'kategori_tools' => 'Webcam',
                'data_tools' => [
                    'merek_tipe' => 'Logitech C920 HD Pro',
                    'nomor_seri' => 'LGT-2024-001',
                    'kondisi' => 'baik',
                    'status_kepemilikan' => 'milik_perusahaan',
                    'field_engineer_name' => 'David Brown',
                    'tanggal_terima' => '2024-06-18',
                    'catatan_keterangan' => 'Full HD untuk meeting',
                ],
            ],
        ];

        foreach ($tools as $toolData) {
            ToolData::create([
                'nama_tools' => $toolData['nama_tools'],
                'kategori_tools' => $toolData['kategori_tools'],
                'data_tools' => json_encode($toolData['data_tools']),
                'status' => 'aktif',
                'last_month_update' => Carbon::now()->format('Y-m'),
            ]);
        }
    }
}
