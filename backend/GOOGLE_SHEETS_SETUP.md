# Setup Google Sheets Integration

## Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Di menu navigasi, pilih **APIs & Services** > **Library**
4. Cari "Google Sheets API" dan klik **Enable**

## Langkah 2: Buat Service Account

1. Di Google Cloud Console, pilih **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **Service Account**
3. Isi nama service account (contoh: `job-management-sheets`)
4. Klik **Create and Continue**
5. Skip bagian role, klik **Continue**
6. Klik **Done**

## Langkah 3: Download Credentials JSON

1. Di halaman Credentials, klik service account yang baru dibuat
2. Pilih tab **Keys**
3. Klik **Add Key** > **Create new key**
4. Pilih **JSON** dan klik **Create**
5. File JSON akan terunduh otomatis

## Langkah 4: Simpan Credentials di Laravel

1. Rename file JSON yang diunduh menjadi `google-credentials.json`
2. Pindahkan file ke folder `storage/app/` di project Laravel:
   ```
   backend/storage/app/google-credentials.json
   ```

## Langkah 5: Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com/)
2. Buat spreadsheet baru
3. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## Langkah 6: Share Spreadsheet ke Service Account

1. Buka spreadsheet yang baru dibuat
2. Klik tombol **Share**
3. Masukkan email service account (dapat dilihat di file JSON, field `client_email`)
   - Contoh: `job-management-sheets@your-project.iam.gserviceaccount.com`
4. Pilih role **Editor**
5. Klik **Send**

## Langkah 7: Konfigurasi Environment

Tambahkan ke file `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

**Catatan:** 
- `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` dapat ditemukan di file `google-credentials.json`
- `GOOGLE_SPREADSHEET_ID` adalah ID dari URL spreadsheet Anda

## Langkah 8: Clear Config Cache

```bash
php artisan config:clear
php artisan cache:clear
```

## Penggunaan

### Otomatis
- Setiap kali job **dibuat**, data otomatis ditambahkan ke Google Sheets
- Setiap kali job **diupdate**, data di Google Sheets juga ter-update (tidak menambah baris baru)
- Setiap kali job **dihapus**, baris di Google Sheets dihapus

### Manual Sync
Untuk sync ulang semua data ke Google Sheets:
```
POST /api/jobs/sync-google-sheets
Authorization: Bearer {token}
```

## Struktur Kolom di Google Sheets

| Kolom | Deskripsi |
|-------|-----------|
| A | ID |
| B | No |
| C | Tanggal |
| D | Kategori |
| E | Req By |
| F | Tiket All BNET |
| G | ID-Nama/POP/ODP/JB |
| H | Tikor |
| I | Latitude |
| J | Longitude |
| K | Detail |
| L | Janji Datang |
| M | Petugas 1 |
| N | Petugas 2 |
| O | Petugas 3 |
| P | BA |
| Q | Status |
| R | Remarks |
| S | Created At |
| T | Updated At |

## Troubleshooting

### Error: Google Sheets not configured
- Pastikan file `google-credentials.json` ada di `storage/app/`
- Pastikan `GOOGLE_SPREADSHEET_ID` sudah diset di `.env`

### Error: Permission denied
- Pastikan spreadsheet sudah di-share ke email service account dengan role Editor

### Data tidak sinkron
- Jalankan manual sync: `POST /api/jobs/sync-google-sheets`

