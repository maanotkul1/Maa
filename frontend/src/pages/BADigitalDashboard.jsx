import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';

export default function BADigitalDashboard() {
  const { user } = useAuth();
  const [folders, setFolders] = useState([
    {
      id: 'folder1',
      name: 'BA - SALES',
      driveLink: 'https://drive.google.com/drive/folders/1Ysen98mYKi9XtVU3sg8MN33OFH0GOlXd',
      files: [],
      loading: false,
      error: null
    },
    {
      id: 'folder2',
      name: 'BA - CR',
      driveLink: 'https://drive.google.com/drive/folders/1Ysen98mYKi9XtVU3sg8MN33OFH0GOlXd',
      files: [],
      loading: false,
      error: null
    }
  ]);

  const [selectedFolder, setSelectedFolder] = useState('folder1');

  const fetchFolderFiles = async (folderId) => {
    // Update loading state
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, loading: true, error: null } : f
    ));

    try {
      // Call your gdrive backend API
      const response = await fetch(`http://localhost:5000/api/files?folderId=${folderId}`);
      
      if (!response.ok) {
        throw new Error('Gagal fetch file dari Google Drive');
      }

      const data = await response.json();

      // Update files
      setFolders(prev => prev.map(f =>
        f.id === folderId 
          ? { ...f, files: data.files || [], loading: false }
          : f
      ));
    } catch (error) {
      console.error('Error fetching folder files:', error);
      setFolders(prev => prev.map(f =>
        f.id === folderId
          ? { ...f, error: error.message, loading: false }
          : f
      ));
    }
  };

  useEffect(() => {
    // Fetch files for selected folder
    fetchFolderFiles(selectedFolder);
  }, [selectedFolder]);

  const currentFolder = folders.find(f => f.id === selectedFolder);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">BA Digital Dashboard</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">View and manage files from shared Google Drive folder</p>
          </div>
        </div>

        {/* Folder Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedFolder === folder.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        {/* Folder Content */}
        {currentFolder && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentFolder.name}</h2>
              <a
                href={currentFolder.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-icons text-base">open_in_new</span>
                Open in Drive
              </a>
            </div>

            {currentFolder.loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : currentFolder.error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <p className="text-red-600 dark:text-red-400 font-medium">Error: {currentFolder.error}</p>
              </div>
            ) : currentFolder.files.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Folder ini belum memiliki file</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Nama File</th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Ukuran</th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Diubah</th>
                      <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentFolder.files.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-icons text-gray-400 text-base">
                              {file.mimeType?.includes('folder') ? 'folder' : 'description'}
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">
                          {file.size ? formatFileSize(file.size) : '-'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(file.modifiedTime)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <a
                            href={`https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                          >
                            <span className="material-icons text-base">open_in_new</span>
                            <span className="hidden sm:inline">Buka</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
