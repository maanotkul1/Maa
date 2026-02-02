# Google Drive Backend API Documentation

## Overview
Backend sederhana menggunakan Node.js + Express untuk mengambil file dari Google Drive folder menggunakan Service Account authentication.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: Google Service Account (JWT)
- **API**: Google Drive API v3
- **Permission**: drive.readonly (read-only)

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP Request
       │ GET /api/files
       │
┌──────▼──────────────────┐
│   Backend (Express)     │
│                         │
│  ┌─────────────────┐   │
│  │ Middleware      │   │
│  │ - CORS enabled  │   │
│  │ - JSON parser   │   │
│  └─────────────────┘   │
│                         │
│  ┌─────────────────┐   │
│  │ GET /api/files  │   │
│  │ - Read JWT key  │   │
│  │ - Auth to GCP   │   │
│  │ - Query Drive   │   │
│  └─────────────────┘   │
└──────┬──────────────────┘
       │ HTTP Response
       │ JSON Data
       │
┌──────▼───────────────┐
│  Google Drive API v3 │
└─────────────────────┘
```

## Setup

### 1. Environment Variables (.env)
```
PORT=5000
FOLDER_ID=your_google_drive_folder_id
```

### 2. Service Account JSON
Letakkan `service-account.json` di root folder backend.

Struktur file:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "gdrive@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## API Endpoints

### GET /api/files
Mengambil semua file dalam 1 folder Google Drive.

**Request:**
```
GET /api/files HTTP/1.1
Host: localhost:5000
```

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "files": [
    {
      "id": "1abc2def3ghi4jkl5mno6pqr7stu8vwx",
      "name": "Report 2024.pdf",
      "size": 2048576,
      "mimeType": "application/pdf",
      "modifiedTime": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "2xyz9abc0def1ghi2jkl3mno4pqr5stu",
      "name": "Budget Spreadsheet.xlsx",
      "size": 512000,
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "modifiedTime": "2024-01-14T15:20:00.000Z"
    }
  ]
}
```

**Response Error (500):**
```json
{
  "success": false,
  "message": "Error fetching files from Google Drive",
  "error": "Invalid Credentials"
}
```

### GET /health
Health check endpoint.

**Request:**
```
GET /health HTTP/1.1
Host: localhost:5000
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Code Explanation

### 1. Service Account Authentication

```javascript
const auth = new google.auth.JWT({
  email: serviceAccount.client_email,      // Email service account
  key: serviceAccount.private_key,          // Private key untuk signing JWT
  scopes: ['https://www.googleapis.com/auth/drive.readonly'] // Hanya read-only
});
```

**Penjelasan:**
- **JWT (JSON Web Token)**: Metode autentikasi aman tanpa user login
- **Scopes**: Permission apa saja yang diizinkan (di sini hanya read)
- **Private Key**: Digunakan untuk sign JWT token

### 2. Query Google Drive

```javascript
await driveClient.files.list({
  q: `'${FOLDER_ID}' in parents and trashed = false`,
  spaces: 'drive',
  fields: 'files(id, name, size, mimeType, modifiedTime)',
  pageSize: 100,
  orderBy: 'modifiedTime desc'
});
```

**Penjelasan:**
- **q**: Query string (cari file dalam folder + tidak trash)
- **spaces**: Namespace (drive = Google Drive)
- **fields**: Data apa saja yang diambil
- **pageSize**: Max 100 file per request
- **orderBy**: Sorting (terbaru duluan)

### 3. CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors());
```

**Penjelasan:**
- Memungkinkan frontend (domain berbeda) memanggil backend
- Misal: Frontend di localhost:3000, Backend di localhost:5000
- Tanpa CORS, browser akan block request

### 4. Error Handling

```javascript
try {
  // Fetch files
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error fetching files',
    error: error.message
  });
}
```

**Penjelasan:**
- Catch semua error yang mungkin terjadi
- Return JSON response agar mudah di-parse frontend
- Log error ke console untuk debugging

## Common Errors & Solutions

### Error: "Missing required scope"
**Cause**: Service account tidak punya drive.readonly scope
**Solution**: 
1. Go to Google Cloud Console
2. Enable Google Drive API
3. Recreate service account key

### Error: "Permission denied for this file"
**Cause**: Folder Google Drive tidak di-share ke service account email
**Solution**:
1. Open folder di Google Drive
2. Click Share
3. Masukkan email service account dari file service-account.json
4. Share dengan akses "Viewer"

### Error: "FOLDER_ID not set"
**Cause**: Environment variable FOLDER_ID tidak ada di .env
**Solution**:
1. Buat file .env di root backend folder
2. Tambahkan: `FOLDER_ID=your_folder_id`
3. Restart backend

### Error: "CORS error" di browser
**Cause**: Backend CORS not enabled atau URL salah
**Solution**:
1. Pastikan backend running: `npm start`
2. Pastikan port 5000 accessible
3. Check VITE_GDRIVE_API di frontend .env

## Performance Tips

### 1. Caching
Tambah Redis caching untuk reduce API calls:

```javascript
// Cache selama 5 menit
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Sebelum fetch
if (cache.has('files') && Date.now() - cache.get('files').time < CACHE_TTL) {
  return res.json(cache.get('files').data);
}
```

### 2. Pagination
Untuk folder dengan banyak file:

```javascript
const pageSize = req.query.pageSize || 50;
const pageToken = req.query.pageToken;

const response = await driveClient.files.list({
  pageSize,
  pageToken,
  // ... other params
});

res.json({
  files: response.data.files,
  nextPageToken: response.data.nextPageToken
});
```

### 3. Filtering
Filter berdasarkan tipe file:

```javascript
// Hanya PDF & Excel
const q = `'${FOLDER_ID}' in parents and 
           trashed = false and 
           (mimeType = 'application/pdf' or 
            mimeType = 'application/vnd.ms-excel')`;
```

## Security Best Practices

✅ **Do:**
- Simpan service-account.json di backend saja
- Gunakan .env untuk secrets
- Add .gitignore untuk secrets files
- Validate folder ID di backend
- Use read-only scope

❌ **Don't:**
- Commit service-account.json ke Git
- Expose API keys ke frontend
- Use API keys untuk autentikasi
- Allow write access jika tidak perlu
- Trust client-side folder ID validation

## Deployment

### 1. Environment Setup
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan production values
FOLDER_ID=production_folder_id
PORT=5000
```

### 2. Deploy Options
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`
- **AWS/GCP**: Docker container

### 3. Important
- Upload service-account.json separately (tidak via Git)
- Set environment variables di hosting platform
- Update frontend VITE_GDRIVE_API ke production URL

## Testing

### Test Backend
```bash
curl http://localhost:5000/api/files
```

### Test Frontend
```jsx
import GDriveDashboard from './components/GDriveDashboard';

function App() {
  return <GDriveDashboard />;
}
```

### Test with Frontend HTML
Buka file `dashboard.html` di browser (jika sudah dibuat).
