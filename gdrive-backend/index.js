import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Support multiple folders - read from environment variables
// Format: FOLDERS_CONFIG={"ba-sales":"1Ysen98mYKi9XtVU3sg8MN33OFH0GOlXd","ba-cr":"1FbINNBv6p8rWFbAVmZkuPYnaSw6R_6z0"}
// Or use individual vars: FOLDER_ID_BA_SALES, FOLDER_ID_BA_CR, etc.
const FOLDER_ID = process.env.FOLDER_ID; // Default folder (backward compatibility)
const FOLDERS_CONFIG = {
  'default': process.env.FOLDER_ID,
  'ba-sales': process.env.FOLDER_ID_BA_SALES || process.env.FOLDER_ID,
  'ba-cr': process.env.FOLDER_ID_BA_CR || process.env.FOLDER_ID
};

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// PENJELASAN SERVICE ACCOUNT SETUP
// ============================================
// Service Account adalah akun khusus Google yang:
// 1. Tidak memerlukan user login
// 2. Digunakan untuk akses terprogram
// 3. Memiliki private key untuk autentikasi
// 4. Ideal untuk backend applications

let driveClient = null;

// Initialize Google Drive Client
function initializeDriveClient() {
  try {
    // Baca file service-account.json
    const serviceAccountPath = path.join(__dirname, 'service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('ERROR: service-account.json tidak ditemukan!');
      console.error('Letakkan file di:', serviceAccountPath);
      process.exit(1);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    // Buat JWT auth client
    // JWT (JSON Web Token) adalah cara aman mengirim credentials
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'] // Hanya read-only
    });

    // Buat Google Drive API client
    driveClient = google.drive({ version: 'v3', auth });
    console.log('✓ Google Drive API client initialized');
  } catch (error) {
    console.error('Error initializing Drive client:', error.message);
    process.exit(1);
  }
}

// ============================================
// ENDPOINT: GET /api/files
// ============================================
// Fungsi ini mengambil file dari folder Google Drive
// Query parameters:
//   - folderId (optional): 'ba-sales', 'ba-cr', atau folder ID langsung
//   - Jika tidak ada folderId, gunakan FOLDER_ID default
app.get('/api/files', async (req, res) => {
  try {
    if (!driveClient) {
      return res.status(500).json({
        success: false,
        message: 'Drive client not initialized'
      });
    }

    // Get folderId dari query parameter atau gunakan default
    let folderId = req.query.folderId || 'default';
    let targetFolderId = FOLDERS_CONFIG[folderId] || folderId;

    // Jika target folder masih tidak ada, gunakan default
    if (!targetFolderId) {
      targetFolderId = FOLDER_ID;
    }

    if (!targetFolderId) {
      return res.status(400).json({
        success: false,
        message: 'FOLDER_ID not configured for ' + folderId
      });
    }

    // Query ke Google Drive API
    // 'FOLDER_ID' in parents = ambil file dalam folder ini
    // trashed = false = jangan ambil file yang sudah dihapus
    const response = await driveClient.files.list({
      q: `'${targetFolderId}' in parents and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, size, mimeType, modifiedTime)',
      pageSize: 100, // Maksimal 100 file per request
      orderBy: 'modifiedTime desc' // Sorting: terbaru duluan
    });

    const files = response.data.files || [];

    // Transform data agar lebih mudah dipakai frontend
    const transformedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      size: parseInt(file.size) || 0, // Dalam bytes
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime
    }));

    res.json({
      success: true,
      count: transformedFiles.length,
      files: transformedFiles
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files from Google Drive',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT: GET /api/folders
// ============================================
// Return list of available folders
app.get('/api/folders', (req, res) => {
  const folders = Object.entries(FOLDERS_CONFIG)
    .filter(([key]) => key !== 'default') // Exclude default
    .map(([key, folderId]) => ({
      id: key,
      folderId: folderId
    }));

  res.json({
    success: true,
    folders: folders
  });
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
initializeDriveClient();
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Default Google Drive Folder ID: ${FOLDER_ID}\n`);
  console.log('Available endpoints:');
  console.log('  GET /api/files?folderId=ba-sales   - Fetch files from BA-SALES folder');
  console.log('  GET /api/files?folderId=ba-cr      - Fetch files from BA-CR folder');
  console.log('  GET /api/files                      - Fetch files from default folder');
  console.log('  GET /api/folders                    - Get list of configured folders');
  console.log('  GET /health                         - Health check\n');
});
