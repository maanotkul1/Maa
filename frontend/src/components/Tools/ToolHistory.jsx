import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ToolHistory({ toolId, toolName, toolKode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (toolId) {
      fetchHistory();
    }
  }, [toolId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tools/${toolId}/history`);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Gagal mengambil data history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/tools/${toolId}/history/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `History-${toolKode}-${toolName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading history:', err);
      alert('Gagal download history');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          History Updates
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">Belum ada history updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record, index) => (
            <div
              key={record.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      {history.length - index}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.tanggal_update ? new Date(record.tanggal_update).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Tanggal tidak tersedia'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {record.created_at ? new Date(record.created_at).toLocaleString('id-ID') : ''}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  record.kondisi === 'baik' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  record.kondisi === 'rusak' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  record.kondisi === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                }`}>
                  {record.kondisi?.charAt(0).toUpperCase() + record.kondisi?.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kategori</p>
                  <p className="font-medium text-gray-900 dark:text-white">{record.kategori}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Merek/Tipe</p>
                  <p className="font-medium text-gray-900 dark:text-white">{record.merek_tipe || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Field Engineer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{record.field_engineer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Terima</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {record.tanggal_terima ? new Date(record.tanggal_terima).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              {record.catatan_keterangan && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Catatan:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{record.catatan_keterangan}</p>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update oleh: <span className="font-medium">{record.creator?.name || 'System'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
