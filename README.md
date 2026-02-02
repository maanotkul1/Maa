# Job Management System - FTTH Network

Sistem manajemen pekerjaan untuk Field Engineer jaringan FTTH dengan desain modern menggunakan Laravel (Backend) dan React (Frontend).

## Fitur Utama

### Dashboard
- Total job hari ini
- Job selesai, on progress, pending/overdue
- Grafik job per status dan per Field Engineer (Admin)
- List job terbaru / job hari ini

### Job Management
- **Admin:**
  - Membuat job baru dengan detail lengkap
  - Edit, cancel, dan re-assign job
  - Monitor semua job
  - Filter dan search job

- **Field Engineer:**
  - Melihat job yang ditugaskan
  - Update status job (on progress, pending, done)
  - Upload foto pekerjaan (before, process, after)
  - Menambah catatan hasil pekerjaan
  - Timeline status job

### Tools Data Management dengan QR Code (NEW)
- **Admin:**
  - Membuat dan mengelola database tools/equipment
  - Generate unique QR codes untuk setiap tool
  - Monitor status update tools secara berkala (setiap 1 bulan)
  - Lihat riwayat scan dan update history
  
- **Field Engineer:**
  - Scan QR code untuk update status tool
  - Validasi automatic 1 bulan rule
  - View tools yang sudah diassign
  - Track riwayat scan personal

- **Features:**
  - QR Code generation dengan expiry date configurable
  - Monthly update enforcement
  - Scan history tracking (device type, IP, timestamp)
  - Dashboard monitoring status update
  - Real-time validation & status update
  - Error handling & notifications

### User Management (Admin)
- Manajemen user (Admin & FE)
- Edit profil user
- Ganti password
- Role & permission

## Teknologi

### Backend
- **Framework:** Laravel 12
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **API:** REST API

### Frontend
- **Framework:** React 19
- **Styling:** Tailwind CSS
- **Icons:** Google Material Icons
- **Charts:** Recharts
- **Routing:** React Router DOM
- **HTTP Client:** Axios

## Instalasi

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0
- XAMPP (atau web server lainnya)

### Backend Setup

1. **Masuk ke folder backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
composer install
```

3. **Copy file environment:**
```bash
copy .env.example .env
```

4. **Generate application key:**
```bash
php artisan key:generate
```

5. **Konfigurasi database di `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job_management
DB_USERNAME=root
DB_PASSWORD=
```

6. **Buat database:**
```sql
CREATE DATABASE job_management;
```

7. **Jalankan migrations:**
```bash
php artisan migrate
```

8. **Jalankan seeder (untuk data awal):**
```bash
php artisan db:seed
```

9. **Buat symbolic link untuk storage:**
```bash
php artisan storage:link
```

10. **Jalankan server:**
```bash
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### Frontend Setup

1. **Masuk ke folder frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Copy file environment:**
```bash
copy .env.example .env
```

4. **Konfigurasi API URL di `.env` (jika perlu):**
```env
VITE_API_URL=http://localhost:8000/api
```

5. **Jalankan development server:**
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Default Login

Setelah menjalankan seeder, Anda dapat login dengan:

**Admin:**
- Email: `admin@example.com`
- Password: `password`

**Field Engineer:**
- Email: `fe1@example.com` atau `fe2@example.com`
- Password: `password`

## Struktur Database

### Tabel Utama

- **users** - Data user (Admin & FE)
- **jobs** - Data pekerjaan
- **job_status_logs** - Histori perubahan status job
- **job_notes** - Catatan pekerjaan
- **job_photos** - Foto pekerjaan

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/fe` - FE dashboard data

### Jobs
- `GET /api/jobs` - List jobs (dengan filter)
- `GET /api/jobs/{id}` - Detail job
- `POST /api/jobs` - Create job (Admin)
- `PUT /api/jobs/{id}` - Update job (Admin)
- `POST /api/jobs/{id}/status` - Update status
- `POST /api/jobs/{id}/cancel` - Cancel job (Admin)
- `POST /api/jobs/{id}/notes` - Add note
- `POST /api/jobs/{id}/photos` - Upload photo
- `DELETE /api/jobs/{id}/photos/{photoId}` - Delete photo

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/field-engineers` - List FE (Admin)
- `GET /api/users/{id}` - Detail user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/{id}` - Update user
- `POST /api/users/{id}/change-password` - Change password
- `DELETE /api/users/{id}` - Deactivate user (Admin)

## Status Job

- **open** - Job baru, belum ditugaskan
- **assigned** - Sudah ditugaskan ke FE
- **on_progress** - Sedang dikerjakan
- **pending** - Tertunda (ada kendala)
- **done** - Selesai
- **canceled** - Dibatalkan
- **overdue** - Melewati deadline

## Flow Status Job

1. Admin membuat job → status: `open` atau `assigned`
2. FE mulai kerja → status: `on_progress`
3. Jika ada kendala → status: `pending`
4. Setelah selesai → status: `done`
5. Admin bisa cancel → status: `canceled`

## Fitur Tambahan yang Bisa Dikembangkan

- [ ] Geotagging & Map Integration (Google Maps)
- [ ] Check-in / Check-out di lokasi dengan GPS
- [ ] Notifikasi real-time (Web Push / Email)
- [ ] Upload dokumen (BA, form survey, dll)
- [ ] Export laporan ke Excel/PDF
- [ ] KPI Dashboard (jumlah job per FE, rata-rata waktu penyelesaian)
- [ ] Tagging & kategori lokasi
- [ ] Comment/Chat per job
- [ ] Role Supervisor/Team Leader
- [ ] Mobile App untuk QR Scanner native
- [ ] Batch QR Code generation
- [ ] Advanced analytics & compliance reports
- [ ] Email/WhatsApp notifications untuk update reminder

## Dokumentasi Fitur QR Code

Untuk detail lengkap tentang fitur QR Code Tools Management:

- **Setup Guide:** [QR_CODE_SETUP_GUIDE.md](./QR_CODE_SETUP_GUIDE.md)
- **Feature Documentation:** [QR_CODE_FEATURE_DOCUMENTATION.md](./QR_CODE_FEATURE_DOCUMENTATION.md)

### Quick Start QR Code Feature

1. **Admin Generate QR:**
   - Go to Tools Data > Select Tool
   - Click "Generate QR Code"
   - Set expiry days (default 30 hari)

2. **Field Engineer Scan QR:**
   - Go to tool detail
   - Click "Scan QR Code"
   - Scan atau paste QR code data
   - System validasi & update automatically

3. **Monitor Status:**
   - View dashboard dengan status semua tools
   - Filter by "Ready for Update" or "Waiting"
   - See compliance rate & next update schedule

## Lisensi

MIT License

## Kontribusi

Silakan buat issue atau pull request jika ingin berkontribusi.

