import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import Html5QrcodePlugin from '../components/QRScanner/Html5QrcodePlugin';

export default function QRScannerUpdate() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [scanMode, setScanMode] = useState(false);
  const [scannedTool, setScannedTool] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [manualToolsNumber, setManualToolsNumber] = useState('');

  // Handle QR code scan
  const handleQRScan = async (decodedText) => {
    try {
      // Extract tools_number from QR code
      // QR code format: tools_{id} or just the id
      let toolsNumber = decodedText;
      
      if (decodedText.includes('tools_')) {
        toolsNumber = decodedText.replace('tools_', '');
      }

      await fetchToolByNumber(toolsNumber);
      setScanMode(false);
    } catch (err) {
      setError('Gagal memproses QR Code: ' + err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Fetch tool by tools_number (ID or code like T261018)
  const fetchToolByNumber = async (toolsNumber) => {
    try {
      setLoading(true);
      setError(null);

      // Send as-is: could be numeric ID or string code
      const searchValue = isNaN(toolsNumber) ? toolsNumber : parseInt(toolsNumber);

      const response = await api.post('/tool-data/scan-qr', {
        tools_number: searchValue,
      });

      if (response.data.success) {
        setScannedTool(response.data.data);
        setEditData(response.data.data.data_tools || {});
      } else {
        setError(response.data.message || 'Tools tidak ditemukan');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal mencari tools';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual tools number input
  const handleManualSearch = async () => {
    if (!manualToolsNumber.trim()) {
      setError('Masukkan tools number atau kode tools');
      return;
    }
    await fetchToolByNumber(manualToolsNumber);
    setManualToolsNumber('');
  };

  // Handle update
  const handleUpdate = async () => {
    if (!scannedTool) return;

    try {
      setLoading(true);
      setError(null);

      // Use new instant update endpoint (NO 1-MONTH WAIT!)
      const response = await api.post(`/tool-data/${scannedTool.id}/update-instant`, {
        kondisi: editData.kondisi,
        catatan_keterangan: editData.catatan_keterangan,
        lokasi: editData.lokasi,
        field_engineer_name: editData.field_engineer_name,
        status_kepemilikan: editData.status_kepemilikan,
      });

      if (response.data.success) {
        setSuccessMessage('✅ Data berhasil diupdate INSTANT (tanpa tunggu 1 bulan!)');
        setTimeout(() => {
          setSuccessMessage(null);
          setScannedTool(null);
          setEditData({});
        }, 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal mengupdate data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle field change
  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/tools-data')}
            className="text-primary-600 hover:text-primary-700 mb-3 sm:mb-4 flex items-center gap-1 text-xs sm:text-sm font-medium"
          >
            <span className="material-icons text-lg">arrow_back</span>
            <span>Kembali</span>
          </button>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md p-4 sm:p-6 lg:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Scan QR Code</h1>
            <p className="text-xs sm:text-sm lg:text-base text-primary-100">Scan QR code atau masukkan kode tools untuk membuka form update data</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <span className="material-icons text-red-600 dark:text-red-400 flex-shrink-0 text-base sm:text-xl">error</span>
            <div className="min-w-0">
              <p className="text-red-800 dark:text-red-300 text-xs sm:text-sm font-medium break-words">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <span className="material-icons text-green-600 dark:text-green-400 flex-shrink-0 text-base sm:text-xl">check_circle</span>
            <div className="min-w-0">
              <p className="text-green-800 dark:text-green-300 text-xs sm:text-sm font-medium break-words">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scanner QR Code</h2>

              {!scanMode && !scannedTool ? (
                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => setScanMode(true)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
                  >
                    <span className="material-icons">qr_code_scanner</span>
                    <span className="hidden sm:inline">Buka Scanner</span>
                    <span className="sm:hidden">Scanner</span>
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">atau</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={manualToolsNumber}
                      onChange={(e) => setManualToolsNumber(e.target.value)}
                      placeholder="Masukkan kode tools (contoh: T0001)..."
                      className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    />
                    <button
                      onClick={handleManualSearch}
                      disabled={loading}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition whitespace-nowrap text-sm"
                    >
                      {loading ? 'Searching...' : 'Cari'}
                    </button>
                  </div>
                </div>
              ) : null}

              {scanMode && !scannedTool && (
                <div className="space-y-3 sm:space-y-4">
                  <Html5QrcodePlugin
                    fps={10}
                    qrbox={250}
                    disableFlip={false}
                    qrCodeSuccessCallback={handleQRScan}
                    qrCodeErrorCallback={() => {}}
                  />
                  <button
                    onClick={() => setScanMode(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                  >
                    Batal
                  </button>
                </div>
              )}

              {scannedTool && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-3 sm:p-4">
                    <p className="text-green-800 dark:text-green-300 text-xs sm:text-sm font-medium">
                      ✓ Tools: <span className="font-bold break-words">{scannedTool.nama_tools}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setScannedTool(null);
                      setEditData({});
                      setScanMode(false);
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                  >
                    Scan Tools Lain
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tool Details & Update Form */}
          <div className="lg:col-span-1">
            {scannedTool ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-3 sm:space-y-4 lg:sticky lg:top-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Update Data</h2>

                {/* Tool Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tools Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">#{scannedTool.tools_number}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nama Tools</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{scannedTool.nama_tools}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategori</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{scannedTool.kategori_tools}</p>
                  </div>
                </div>

                {/* Update Fields */}
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Kondisi</label>
                    <select
                      value={editData.kondisi || ''}
                      onChange={(e) => handleFieldChange('kondisi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">-- Pilih Kondisi --</option>
                      <option value="baik">Baik</option>
                      <option value="rusak">Rusak</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="hilang">Hilang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Merek/Tipe</label>
                    <input
                      type="text"
                      value={editData.merek_tipe || ''}
                      onChange={(e) => handleFieldChange('merek_tipe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Merek/Tipe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Nomor Seri</label>
                    <input
                      type="text"
                      value={editData.nomor_seri || ''}
                      onChange={(e) => handleFieldChange('nomor_seri', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Nomor Seri"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Lokasi Tools Saat Ini</label>
                    <input
                      type="text"
                      value={editData.lokasi || ''}
                      onChange={(e) => handleFieldChange('lokasi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Contoh: Jakarta Timur - Kantor Pusat"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Status Kepemilikan</label>
                    <select
                      value={editData.status_kepemilikan || ''}
                      onChange={(e) => handleFieldChange('status_kepemilikan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">-- Pilih Status --</option>
                      <option value="milik_perusahaan">Milik Perusahaan</option>
                      <option value="pribadi_fe">Pribadi FE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Field Engineer</label>
                    <input
                      type="text"
                      value={editData.field_engineer_name || ''}
                      onChange={(e) => handleFieldChange('field_engineer_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Nama Field Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Keterangan</label>
                    <textarea
                      value={editData.catatan_keterangan || ''}
                      onChange={(e) => handleFieldChange('catatan_keterangan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Catatan..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span className="hidden sm:inline">Menyimpan...</span>
                        <span className="sm:hidden">Simpan...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-lg">save</span>
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
