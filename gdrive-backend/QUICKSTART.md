## 🚀 Google Drive Dashboard Backend

Node.js + Express server untuk mengambil file dari Google Drive.

### ⚡ Quick Start (5 min)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "PORT=5000" > .env
echo "FOLDER_ID=your_folder_id_here" >> .env

# 3. Letakkan service-account.json di folder ini
# Download dari Google Cloud Console

# 4. Share folder Google Drive ke service account email
# (cek di file service-account.json: client_email)

# 5. Start server
npm start

# Output: ✓ Server running on http://localhost:5000
```

### 📋 Setup Details

1. **Get Service Account JSON**
   - Go to: https://console.cloud.google.com/
   - Create Service Account
   - Download JSON key
   - Save as: `service-account.json`

2. **Configure Environment**
   ```
   PORT=5000
   FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
   ```

3. **Share Folder to Service Account**
   - Open folder in Google Drive
   - Click Share
   - Enter email from `service-account.json` (client_email field)
   - Permission: Viewer

4. **Get Folder ID**
   - Open folder in Google Drive
   - URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the ID part

### 🔌 API Endpoints

**GET /api/files**
Returns all files from Google Drive folder.

Response:
```json
{
  "success": true,
  "count": 3,
  "files": [
    {
      "id": "file_id",
      "name": "Document.pdf",
      "size": 2048576,
      "mimeType": "application/pdf",
      "modifiedTime": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**GET /health**
Health check.

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 🧪 Test API

```bash
# Get files
curl http://localhost:5000/api/files

# Health check
curl http://localhost:5000/health
```

### 📦 Dependencies

- `express` - Web framework
- `cors` - Cross-origin requests
- `googleapis` - Google API client
- `dotenv` - Environment variables

### 🔒 Security

✅ Credentials only on backend
✅ Read-only scope
✅ JWT authentication
✅ .env and service-account.json in .gitignore
✅ CORS enabled

### 🛠️ Troubleshooting

**"service-account.json not found"**
→ Download from Google Cloud, save in this folder

**"FOLDER_ID not set"**
→ Create .env with FOLDER_ID=your_id

**"403 Forbidden"**
→ Share folder to service account email

**"Port 5000 in use"**
→ Kill process: `taskkill /PID <PID> /F` (Windows)

### 📚 Documentation

- [README.md](./README.md) - Setup guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API details
- [dashboard.html](./dashboard.html) - Standalone UI

### 🔗 Related

Frontend component: `frontend/src/components/GDriveDashboard.jsx`

Full docs: `MASTER_INDEX.md` (root folder)

### 💡 Commands

```bash
npm start        # Run server
npm run dev      # Development mode (watch)
npm install      # Install dependencies
npm list         # List dependencies
```

### 🚀 Production

```bash
# Install production dependencies only
npm install --production

# Run on different port
PORT=8000 npm start
```

### ✅ Verify Setup

```bash
# Check if server running
curl http://localhost:5000/health

# Check API response
curl http://localhost:5000/api/files

# Should show JSON with files array
```

---

**Ready? Start backend with:**
```bash
npm install && npm start
```

**Then setup frontend in ../frontend/ folder**

See [MASTER_INDEX.md](../MASTER_INDEX.md) for complete guide.
