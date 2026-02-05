import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import QRScanner from '../components/QRScanner';
import { generateShortCode } from '../utils/formatters';

export default function ToolsData() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    kategori_tools: '',
    month: '',
    search: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanMessage, setQrScanMessage] = useState(null);
  const [qrScanning, setQrScanning] = useState(false);
  const [scannedToolData, setScannedToolData] = useState(null);

  // List nama teknisi/engineer
  const TECHNICIAN_LIST = [
    'Ade Firman',
    'Ade Kamasifa',
    'Ajat Sudrajat',
    'Angga Tinarya',
    'Dika Ridwani Fauzi',
    'Ega M. Hidayat',
    'M. Putra Widianata',
    'Mahaqi Putra Ramadhan',
    'Muhammad Acep Suryana',
    'Muhammad Nur Kafi',
    'Nazril Ibrahim',
    'Nur Rohman',
    'Rahmat Hidayat',
    'Reza Dwi Saputra',
    'Rian Afriansyah',
    'Rudi Nuraziz Iskandar',
    'Zabal Noval Ramdani',
  ];

  const [formData, setFormData] = useState({
    nama_tools: '',
    kategori_tools: '',
    merek_tipe: '',
    nomor_seri: '',
    kondisi: 'baik',
    status_kepemilikan: 'milik_perusahaan',
    field_engineer_name: '',
    tanggal_terima: '',
    catatan_keterangan: '',
    foto_tool: null,
  });

  useEffect(() => {
    fetchToolsData();
  }, [filters]);

  const fetchToolsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/tool-data/?${params.toString()}`);
      setToolsData(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching tools data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateTool = async () => {
    if (!formData.nama_tools || !formData.kategori_tools) {
      alert('Nama dan kategori tools harus diisi');
      return;
    }

    try {
      const submitData = new FormData();
      
      // Informasi Utama
      submitData.append('nama_tools', formData.nama_tools);
      submitData.append('kategori_tools', formData.kategori_tools);
      if (formData.merek_tipe) submitData.append('merek_tipe', formData.merek_tipe);
      if (formData.nomor_seri) submitData.append('nomor_seri', formData.nomor_seri);
      
      // Status & Kepemilikan
      submitData.append('kondisi', formData.kondisi);
      submitData.append('status_kepemilikan', formData.status_kepemilikan);
      if (formData.field_engineer_name) submitData.append('field_engineer_name', formData.field_engineer_name);
      
      // Informasi Tambahan
      if (formData.tanggal_terima) submitData.append('tanggal_terima', formData.tanggal_terima);
      if (formData.catatan_keterangan) submitData.append('catatan_keterangan', formData.catatan_keterangan);
      
      // Dokumentasi
      if (formData.foto_tool) submitData.append('foto_tool', formData.foto_tool);

      await api.post('/tool-data', submitData);
      
      alert('Tools berhasil dibuat');
      setShowModal(false);
      setFormData({
        nama_tools: '',
        kategori_tools: '',
        merek_tipe: '',
        nomor_seri: '',
        kondisi: 'baik',
        status_kepemilikan: 'milik_perusahaan',
        field_engineer_name: '',
        tanggal_terima: '',
        catatan_keterangan: '',
        foto_tool: null,
      });
      fetchToolsData();
    } catch (error) {
      console.error('Error creating tool:', error);
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      const apiErrorsStr = apiErrors ? JSON.stringify(apiErrors) : '';
      alert(apiMessage || apiErrorsStr || error.message || 'Gagal membuat tools');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      console.log(`File selected for ${name}:`, files[0].name, files[0].size);
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingId(selectedDeleteId);
      await api.delete(`/tool-data/${selectedDeleteId}`);
      alert('Tools berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedDeleteId(null);
      fetchToolsData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      const apiMessage = error.response?.data?.message;
      alert(apiMessage || error.message || 'Gagal menghapus tools');
    } finally {
      setDeletingId(null);
    }
  };

  const handleQRScan = async (scannedCode) => {
    if (!scannedCode.trim()) {
      setQrScanMessage({
        type: 'error',
        message: 'QR Code tidak valid',
      });
      return;
    }

    try {
      setQrScanning(true);
      setQrScanMessage(null);

      const response = await api.post('/tool-data/scan-qr-direct', {
        qr_code: scannedCode,
      });

      const toolData = response.data.data;

      setScannedToolData(toolData);
      
      setQrScanMessage({
        type: 'success',
        message: response.data.message || 'QR Code berhasil dipindai!',
        toolName: toolData?.tool_name,
      });

      setShowQRScanner(false);
      fetchToolsData();

      setTimeout(() => setQrScanMessage(null), 8000);
    } catch (error) {
      console.error('Error scanning QR:', error);
      setQrScanMessage({
        type: 'error',
        message: error.response?.data?.message || 'Gagal memproses QR Code',
      });
    } finally {
      setQrScanning(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'aktif') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Aktif</span>;
    }
    return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Non-Aktif</span>;
  };

  const formatLastUpdate = (lastMonthUpdate) => {
    if (!lastMonthUpdate) return 'Belum pernah diupdate';
    const [year, month] = lastMonthUpdate.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
  };

  if (loading && !toolsData.length) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Tools Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manajemen data tools, troubleshooting wireless, dan monitoring jaringan</p>
          </div>
        </div>

        {/* Content */}
        <>
            {/* Tools Data Content */}
            <div className="flex justify-end items-start mb-6 gap-3">
              <button
                onClick={() => navigate('/tools-data/scan-qr')}
                className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <span className="material-icons">qr_code_scanner</span>
                Scan QR Code
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <span className="material-icons">add</span>
                  Tambah Tools
                </button>
              )}
            </div>

            {/* Statistics */}
            

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="material-icons text-lg">filter_list</span>
            Filter & Pencarian
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <input
                type="text"
                placeholder="Cari nama tools..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif</option>
              </select>
            </div>
            <div>
              <input
                type="month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            </div>
            </div>

            {/* Tools List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b-2 border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Tools Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Nama Tools</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Merek / Tipe</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Nomor Seri</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Kondisi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Kepemilikan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Digunakan oleh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {toolsData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-icons text-5xl text-gray-300 dark:text-gray-600 mb-2">inventory_2</span>
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada tools ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  toolsData.map((tool) => (
                  <tr key={tool.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(tool.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {tool.data_tools?.kode_tool || generateShortCode(tool.id, tool.created_at, 'T')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{tool.nama_tools}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{tool.kategori_tools}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tool.data_tools?.merek_tipe || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tool.data_tools?.nomor_seri || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        tool.data_tools?.kondisi === 'baik' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        tool.data_tools?.kondisi === 'rusak' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        tool.data_tools?.kondisi === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {tool.data_tools?.kondisi ? tool.data_tools.kondisi.charAt(0).toUpperCase() + tool.data_tools.kondisi.slice(1) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tool.data_tools?.status_kepemilikan === 'milik_perusahaan' ? '🏢 Perusahaan' : '👤 FE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tool.data_tools?.field_engineer_name || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tools-data/${tool.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline transition"
                        >
                          <span className="material-icons text-lg">open_in_new</span>
                          Lihat
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClick(tool.id)}
                            disabled={deletingId === tool.id}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="material-icons text-lg">
                              {deletingId === tool.id ? 'hourglass_empty' : 'delete'}
                            </span>
                            {deletingId === tool.id ? 'Hapus...' : 'Hapus'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
        </>
      </div>

      {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tambah Tools Baru</h2>
                
                <div className="space-y-6">
                  {/* Informasi Utama */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Utama</h3>
                    <div className="space-y-4">
                      {/* Nama Tool */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nama Tools <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nama_tools"
                          value={formData.nama_tools}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Kategori / Jenis Tools */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kategori / Jenis Tools <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="kategori_tools"
                          value={formData.kategori_tools}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          <option value="alat_fo">Alat FO</option>
                          <option value="alat_ukur">Alat Ukur</option>
                          <option value="alat_listrik">Alat Listrik</option>
                          <option value="alat_mekanik">Alat Mekanik</option>
                          <option value="apd">APD</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Merek / Tipe */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Merek / Tipe
                        </label>
                        <input
                          type="text"
                          name="merek_tipe"
                          value={formData.merek_tipe}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Contoh: Fluke, Klein Tools, dll"
                        />
                      </div>

                      {/* Nomor Seri */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nomor Seri
                        </label>
                        <input
                          type="text"
                          name="nomor_seri"
                          value={formData.nomor_seri}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nomor seri tools (opsional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Kepemilikan */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status & Kepemilikan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kondisi Tools */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kondisi Tools <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="kondisi"
                          value={formData.kondisi}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="baik">Baik</option>
                          <option value="rusak">Rusak</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="hilang">Hilang</option>
                        </select>
                      </div>

                      {/* Status Kepemilikan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status Kepemilikan <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="status_kepemilikan"
                          value={formData.status_kepemilikan}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="milik_perusahaan">Milik Perusahaan</option>
                          <option value="pribadi_fe">Pribadi FE</option>
                        </select>
                      </div>

                      {/* Digunakan oleh (Field Engineer) */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Digunakan oleh (PIC) - Nama
                        </label>
                        <select
                          name="field_engineer_name"
                          value={formData.field_engineer_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Pilih Nama Teknisi</option>
                          {TECHNICIAN_LIST.map((name, index) => (
                            <option key={index} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Tambahan */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Tambahan</h3>
                    <div className="space-y-4">
                      {/* Tanggal Terima Tools */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tanggal Terima Tools
                        </label>
                        <input
                          type="date"
                          name="tanggal_terima"
                          value={formData.tanggal_terima}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Catatan / Keterangan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Catatan / Keterangan
                        </label>
                        <textarea
                          name="catatan_keterangan"
                          value={formData.catatan_keterangan}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Catatan atau keterangan tambahan tentang tools..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dokumentasi */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dokumentasi</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Foto Tools
                      </label>
                      <input
                        type="file"
                        name="foto_tool"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      {formData.foto_tool && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          File: {formData.foto_tool.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleCreateTool}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <span className="material-icons text-red-600 dark:text-red-400">warning</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Hapus Tools?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Anda yakin ingin menghapus tools ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === selectedDeleteId}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-lg">
                    {deletingId === selectedDeleteId ? 'hourglass_empty' : 'delete'}
                  </span>
                  {deletingId === selectedDeleteId ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-icons">qr_code_scanner</span>
                  Scan QR Code untuk Update Tools
                </h3>
                <button
                  onClick={() => setShowQRScanner(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="mb-4">
                <QRScanner
                  onScanSuccess={(scannedCode) => {
                    handleQRScan(scannedCode);
                  }}
                  onClose={() => setShowQRScanner(false)}
                />
              </div>

              <button
                onClick={() => setShowQRScanner(false)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* QR Scan Success/Error Message */}
        {scannedToolData && qrScanMessage && (
          <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-2xl border max-w-lg animate-in fade-in slide-in-from-top ${
            qrScanMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`material-icons text-2xl flex-shrink-0 ${
                    qrScanMessage.type === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {qrScanMessage.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      qrScanMessage.type === 'success'
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-red-900 dark:text-red-300'
                    }`}>
                      {qrScanMessage.message}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setScannedToolData(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Tool Details */}
              {qrScanMessage.type === 'success' && (
                <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg mt-3">
                  {/* Tools Number & Name */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TOOLS NUMBER</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">#{scannedToolData.tool_number}</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                      {scannedToolData.tool_name}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kategori</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {scannedToolData.kategori_tools}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        scannedToolData.status === 'aktif'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {scannedToolData.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kondisi</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {scannedToolData.kondisi}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Merek/Tipe</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {scannedToolData.merek_tipe}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nomor Seri</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {scannedToolData.nomor_seri}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kepemilikan</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {scannedToolData.status_kepemilikan === 'milik_perusahaan' 
                            ? 'Perusahaan' 
                            : 'FE'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Teknisi/FE</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {scannedToolData.field_engineer_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Update Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Update Terakhir</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                      {scannedToolData.last_update || 'Belum pernah diupdate'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Scan berikutnya: {scannedToolData.next_scan_date}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </MainLayout>
  );
}
