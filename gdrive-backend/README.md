# Google Drive Dashboard Backend

Backend Node.js + Express untuk menampilkan file dari Google Drive.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Service Account
1. Buat Service Account di Google Cloud Console
2. Download file `service-account.json`
3. Letakkan di root folder backend (sama dengan `index.js`)

### 3. Share Folder ke Service Account
1. Buka folder Google Drive yang ingin ditampilkan
2. Share ke email service account (cth: `xxx@xxx.iam.gserviceaccount.com`)
3. Copy Folder ID dari URL: `https://drive.google.com/drive/folders/FOLDER_ID`

### 4. Set Environment Variables
Buat file `.env`:
```
PORT=5000
FOLDER_ID=your_folder_id_here
```

### 5. Run Server
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### GET /api/files
Fetch semua file dalam 1 folder Google Drive

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "file_id",
      "name": "Dokumen.pdf",
      "size": 1024000,
      "modifiedTime": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Security Notes
- Service Account JSON tidak ter-expose ke frontend
- API Key disimpan di backend saja
- Hanya read-only permission
