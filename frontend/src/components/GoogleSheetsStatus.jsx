// File: src/components/GoogleSheetsStatus.jsx
// Komponen untuk menampilkan status Google Sheets di dashboard

import { useEffect, useState } from 'react';
import useGoogleSheets from '../hooks/useGoogleSheets';

export default function GoogleSheetsStatus() {
  const { checkStatus, syncAll, loading, status, error } = useGoogleSheets();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await syncAll();
      alert('✓ Data berhasil di-sync ke Google Sheets!');
      checkStatus();
    } catch (err) {
      alert('✗ Error saat sync: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!status?.configured) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="text-red-600">⚠️</div>
          <div>
            <p className="font-semibold text-red-800">Google Sheets Not Configured</p>
            <p className="text-sm text-red-600">
              Silakan setup Google Sheets integration. Lihat dokumentasi untuk langkah-langkahnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-green-600">✓</div>
          <div>
            <p className="font-semibold text-green-800">Google Sheets Connected</p>
            <p className="text-sm text-green-600">Data otomatis tersimpan ke Google Sheets</p>
          </div>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={loading || syncing}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            syncing
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
