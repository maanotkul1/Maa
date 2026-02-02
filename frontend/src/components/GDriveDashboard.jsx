import { useEffect, useState } from 'react';
import axios from 'axios';

// ============================================
// PENJELASAN KOMPONEN GDriveDashboard
// ============================================
// Komponen ini menampilkan file dari multiple Google Drive folders
// Fitur:
// 1. Tab-based folder navigation
// 2. Fetch data saat halaman dibuka dan saat folder berubah
// 3. Tampilkan dalam tabel dengan sorting
// 4. Format ukuran file (B, KB, MB)
// 5. Tombol refresh manual per folder
// 6. Loading state dan error handling per folder

export default function GDriveDashboard() {
  // State untuk menyimpan folders
  const [folders, setFolders] = useState([
    {
      id: 'ba-sales',
      name: 'BA - SALES',
      files: [],
      loading: false,
      error: null,
      lastUpdated: null
    },
    {
      id: 'ba-cr',
      name: 'BA - CR',
      files: [],
      loading: false,
      error: null,
      lastUpdated: null
    }
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState('ba-sales');

  // URL backend (sesuaikan dengan environment)
  const API_URL = import.meta.env.VITE_GDRIVE_API || 'http://localhost:5000';

  // ============================================
  // Fungsi: Format ukuran file
  // ============================================
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ============================================
  // Fungsi: Format tanggal
  // ============================================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // ============================================
  // Fungsi: Fetch file dari folder tertentu
  // ============================================
  const fetchFolderFiles = async (folderId) => {
    // Update loading state
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, loading: true, error: null } : f
    ));

    try {
      const response = await axios.get(`${API_URL}/api/files?folderId=${folderId}`);

      if (response.data.success) {
        setFolders(prev => prev.map(f =>
          f.id === folderId
            ? { ...f, files: response.data.files || [], loading: false, lastUpdated: new Date() }
            : f
        ));
      } else {
        throw new Error(response.data.message || 'Failed to fetch files');
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setFolders(prev => prev.map(f =>
        f.id === folderId
          ? {
            ...f,
            loading: false,
            error: err.response?.data?.message || err.message || 'Failed to fetch files'
          }
          : f
      ));
    }
  };

  // Fetch data saat komponen dimount
  useEffect(() => {
    folders.forEach(folder => {
      fetchFolderFiles(folder.id);
    });
  }, []);

  // Get current selected folder
  const currentFolder = folders.find(f => f.id === selectedFolderId);

  // ============================================
  // RENDER: Loading State (Saat pertama kali)
  // ============================================
  if (currentFolder?.loading && currentFolder?.files.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Mengambil file dari Google Drive...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Main Component
  // ============================================
  return (
    <div className="w-full">
      {/* Folder Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-2">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                selectedFolderId === folder.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {folder.name}
              {folder.files.length > 0 && (
                <span className="ml-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                  {folder.files.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {currentFolder?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-semibold">Gagal memuat file</p>
          <p className="text-red-600 text-sm mt-1">{currentFolder.error}</p>
          <button
            onClick={() => fetchFolderFiles(selectedFolderId)}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentFolder?.name}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Total: {currentFolder?.files.length || 0} file
            {currentFolder?.lastUpdated && (
              <> • Diperbarui: {formatDate(currentFolder.lastUpdated)}</>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchFolderFiles(selectedFolderId)}
          disabled={currentFolder?.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentFolder?.loading ? 'Memperbarui...' : 'Refresh'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        {!currentFolder?.files || currentFolder.files.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {currentFolder?.loading ? 'Memuat...' : 'Tidak ada file dalam folder ini'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Nama File
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Ukuran
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Terakhir Diubah
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentFolder.files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-b-0"
                >
                  {/* Kolom: Nama File */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {file.mimeType?.includes('folder') ? '📁' : '📄'}
                      </span>
                      <a
                        href={`https://drive.google.com/file/d/${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline truncate font-medium"
                        title={file.name}
                      >
                        {file.name}
                      </a>
                    </div>
                  </td>

                  {/* Kolom: Ukuran */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                    {formatFileSize(file.size)}
                  </td>

                  {/* Kolom: Terakhir Diubah */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(file.modifiedTime)}
                  </td>

                  {/* Kolom: Tipe File */}
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {file.mimeType?.split('/')[1] || 'unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
