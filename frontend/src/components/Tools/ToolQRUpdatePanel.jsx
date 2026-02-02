import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ToolQRUpdatePanel({ toolId, toolName, isAdmin }) {
  const [qrStatus, setQrStatus] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  useEffect(() => {
    fetchQRStatus();
    fetchScanHistory();
  }, [toolId]);

  const fetchQRStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tool-data/${toolId}/qr-status`);
      setQrStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching QR status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScanHistory = async () => {
    try {
      const response = await api.get(`/tool-data/${toolId}/qr-scan-history?limit=10`);
      setScanHistory(response.data.data.histories || []);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const handleScanQR = async () => {
    if (!scannedCode.trim()) {
      alert('Silakan masukkan atau pindai QR Code');
      return;
    }

    try {
      setScanning(true);
      setScanMessage(null);

      const response = await api.post(`/tool-data/${toolId}/scan-qr`, {
        qr_code: scannedCode,
      });

      setScanMessage({
        type: 'success',
        message: response.data.message,
        nextScan: response.data.data.next_scan_date,
      });

      setScannedCode('');
      setScanMode(false);
      fetchQRStatus();
      fetchScanHistory();

      setTimeout(() => setScanMessage(null), 5000);
    } catch (error) {
      console.error('Error scanning QR:', error);
      setScanMessage({
        type: 'error',
        message: error.response?.data?.message || 'Gagal memproses QR Code',
      });
    } finally {
      setScanning(false);
    }
  };

  const getUpdateBadgeColor = () => {
    if (!qrStatus) return 'bg-gray-100 text-gray-700';
    if (qrStatus.can_update) return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getQRBadgeColor = () => {
    if (!qrStatus?.current_qr) return 'bg-gray-100 text-gray-700';
    if (qrStatus.current_qr.validity_days > 7) return 'bg-green-100 text-green-700';
    if (qrStatus.current_qr.validity_days > 0) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return <div className="text-center py-8">Loading QR status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">QR Code Update Management</h3>

      {/* Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Update Status */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">Update Status</h4>
          <div className="space-y-2">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getUpdateBadgeColor()}`}>
                {qrStatus?.can_update ? 'Siap untuk Update' : 'Belum Waktunya'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Update Terakhir: <span className="font-semibold text-gray-800">{qrStatus?.last_update}</span>
            </p>
            {!qrStatus?.can_update && (
              <p className="text-sm text-amber-600">
                Dapat diupdate dalam <span className="font-semibold">{qrStatus?.days_until_next_update} hari</span>
              </p>
            )}
            {qrStatus?.next_update_date && (
              <p className="text-sm text-gray-600">
                Update Berikutnya: <span className="font-semibold">{qrStatus.next_update_date}</span>
              </p>
            )}
          </div>
        </div>

        {/* QR Code Status */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">Status QR Code</h4>
          <div className="space-y-2">
            {qrStatus?.current_qr ? (
              <>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getQRBadgeColor()}`}>
                    Aktif (1 Bulan)
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Jumlah Scan: <span className="font-semibold">{qrStatus.current_qr.scan_count || 0}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Dibuat: <span className="font-semibold">{new Date(qrStatus.current_qr.generated_at).toLocaleDateString('id-ID')}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Berlaku Hingga: <span className="font-semibold">{new Date(qrStatus.current_qr.expires_at).toLocaleDateString('id-ID')}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">Belum ada QR Code</p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Display - Info saja, tidak ada generate */}
      {qrStatus?.current_qr && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-gray-700 mb-3">
            <span className="material-icons inline mr-2 text-lg">qr_code_2</span>
            QR Code untuk Scan Update
          </h4>
          <div className="flex justify-center">
            <img
              src={qrStatus.current_qr.image_url}
              alt="QR Code"
              className="w-48 h-48 border-2 border-blue-300 rounded-lg"
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            QR ini berlaku selama 1 bulan. Scan untuk update tools.
          </p>
        </div>
      )}

      {/* Scan Message */}
      {scanMessage && (
        <div
          className={`p-4 rounded-lg ${
            scanMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          <p className="font-semibold">{scanMessage.message}</p>
          {scanMessage.nextScan && (
            <p className="text-sm mt-2">Update berikutnya: {scanMessage.nextScan}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div>
          {!scanMode ? (
            <button
              onClick={() => setScanMode(true)}
              disabled={!qrStatus?.can_update}
              className={`w-full font-semibold py-2 rounded-lg transition ${
                qrStatus?.can_update
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Scan QR Code
            </button>
          ) : (
            <div className="space-y-3 border-2 border-purple-300 p-4 rounded-lg bg-purple-50">
              <h5 className="font-semibold text-gray-800">Input QR Code</h5>
              <input
                type="text"
                placeholder="Paste QR code atau masukkan data"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
                autoFocus
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleScanQR}
                  disabled={scanning || !scannedCode.trim()}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {scanning ? 'Memproses...' : 'Scan'}
                </button>
                <button
                  onClick={() => {
                    setScanMode(false);
                    setScannedCode('');
                    setScanMessage(null);
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Riwayat Scan (10 Terakhir)</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scanHistory.map((scan, idx) => (
              <div key={idx} className="flex justify-between items-start bg-gray-50 p-3 rounded border">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{scan.scanned_at}</p>
                  <p className="text-xs text-gray-600">{scan.device_type} - {scan.ip_address}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  scan.status === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
