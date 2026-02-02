import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function ToolsDataDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [tool, setTool] = useState(null);
  const [activeTab, setActiveTab] = useState('data');
  const [history, setHistory] = useState([]);
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    fetchToolDetail();
    fetchHistory();
    fetchRecaps();
  }, [id]);

  const fetchToolDetail = async () => {
    try {
      const response = await api.get(`/tool-data/${id}`);
      setTool(response.data.data);
      setEditData(response.data.data);
    } catch (error) {
      console.error('Error fetching tool:', error);
      navigate('/tools-data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/tool-data/${id}/history`);
      setHistory(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchRecaps = async () => {
    try {
      const response = await api.get(`/tool-data/${id}/rekap-bulanan`);
      setRecaps(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching recaps:', error);
    }
  };

  const handleUpdate = async () => {
    setUpdateError(null);

    try {
      await api.put(`/tool-data/${id}`, {
        ...editData,
        keterangan: 'Update dari detail view',
      });
      alert('Tools berhasil diperbarui');
      setEditMode(false);
      fetchToolDetail();
      fetchHistory();
    } catch (error) {
      console.error('Error updating tool:', error);
      const errorMsg = error.response?.data?.error || 'Gagal memperbarui tools';
      setUpdateError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/tool-data/${id}`);
      alert('Tools berhasil dihapus');
      setShowDeleteConfirm(false);
      navigate('/tools-data');
    } catch (error) {
      console.error('Error deleting tool:', error);
      const apiMessage = error.response?.data?.message;
      alert(apiMessage || error.message || 'Gagal menghapus tools');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowQRCode = async () => {
    try {
      setQrLoading(true);
      const response = await api.get(`/tool-data/${id}/qr-code`);
      if (response.data.success) {
        setQrImage(response.data.data);
        setShowQRModal(true);
      } else {
        alert('Gagal load QR code');
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      alert('Gagal load QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQRCode = async () => {
    try {
      const response = await api.get(`/tool-data/${id}/qr-code/download`, {
        responseType: 'blob',
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const kodeTools = tool.data_tools?.kode_tool || `T${String(tool.id).padStart(7, '0')}`;
      link.setAttribute('download', `QR_${kodeTools}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Gagal download QR code');
    }
  };

  const getActionBadge = (aksi) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-700',
      UPDATE: 'bg-blue-100 text-blue-700',
      DELETE: 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1 rounded-full text-sm ${colors[aksi]}`}>{aksi}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!tool) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-red-600">Tools tidak ditemukan</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate('/tools-data')}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-1 text-sm font-medium"
          >
            <span className="material-icons text-lg">arrow_back</span>
            Kembali
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{tool.nama_tools}</h1>
                  <p className="text-primary-100 text-lg">{tool.kategori_tools}</p>
                  <p className="text-primary-100 text-sm mt-2">Tools Number: <span className="font-bold">{tool.data_tools?.kode_tool || `#${tool.id}`}</span></p>
                </div>
                {isAdmin && !editMode && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <span className="material-icons">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={handleShowQRCode}
                      disabled={qrLoading}
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2 transition whitespace-nowrap disabled:opacity-50"
                    >
                      <span className="material-icons">{qrLoading ? 'hourglass_empty' : 'qr_code_2'}</span>
                      {qrLoading ? 'Loading...' : 'QR Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t dark:border-gray-700">
              <div className="p-4 border-r dark:border-gray-700 last:border-r-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</p>
                <p className="text-2xl font-bold">
                  {tool.data_tools?.kondisi ? (
                    <span className={
                      tool.data_tools.kondisi === 'baik' ? 'text-green-600' :
                      tool.data_tools.kondisi === 'rusak' ? 'text-red-600' :
                      tool.data_tools.kondisi === 'maintenance' ? 'text-yellow-600' : 'text-gray-600'
                    }>
                      {tool.data_tools.kondisi.charAt(0).toUpperCase() + tool.data_tools.kondisi.slice(1)}
                    </span>
                  ) : '-'}
                </p>
              </div>
              <div className="p-4 border-r dark:border-gray-700 last:border-r-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Kepemilikan</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tool.data_tools?.status_kepemilikan === 'milik_perusahaan' ? 'Milik Perusahaan' : 'Pribadi FE'}
                </p>
              </div>
              <div className="p-4 border-r dark:border-gray-700 last:border-r-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Terakhir Update</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.last_month_update || 'Belum pernah'}</p>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Dibuat Pada</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(tool.created_at)}</p>
              </div>
            </div>


          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 bg-white dark:bg-gray-800 rounded-t-lg px-6 overflow-x-auto">
            {['data', 'history', 'recaps'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'data' && <span className="flex items-center gap-2"><span className="material-icons text-lg">article</span>Data Aktif</span>}
                {tab === 'history' && <span className="flex items-center gap-2"><span className="material-icons text-lg">history</span>History Perubahan ({history.length})</span>}
                {tab === 'recaps' && <span className="flex items-center gap-2"><span className="material-icons text-lg">calendar_month</span>Rekap Bulanan ({recaps.length})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'data' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {editMode ? (
              <div className="space-y-6">
                {updateError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg flex items-start gap-3">
                    <span className="material-icons text-red-600 dark:text-red-400 flex-shrink-0">error</span>
                    <p className="text-red-800 dark:text-red-300 text-sm">{updateError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Tools</label>
                  {tool.data_tools?.foto_tool && (
                    <div className="mb-4">
                      <img 
                        src={`http://localhost:8000/storage/${tool.data_tools.foto_tool}`} 
                        alt="Tools" 
                        className="max-w-sm max-h-64 rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Foto saat ini</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Format: JPG, PNG (max 2MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Tools</label>
                  <input
                    type="text"
                    value={editData.nama_tools || ''}
                    onChange={(e) => setEditData({ ...editData, nama_tools: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                  <input
                    type="text"
                    value={editData.kategori_tools || ''}
                    onChange={(e) => setEditData({ ...editData, kategori_tools: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Merek / Tipe</label>
                    <input
                      type="text"
                      value={editData.data_tools?.merek_tipe || ''}
                      onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, merek_tipe: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Seri</label>
                    <input
                      type="text"
                      value={editData.data_tools?.nomor_seri || ''}
                      onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, nomor_seri: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kondisi</label>
                    <select
                      value={editData.data_tools?.kondisi || 'baik'}
                      onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, kondisi: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak">Rusak</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="hilang">Hilang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Kepemilikan</label>
                    <select
                      value={editData.data_tools?.status_kepemilikan || 'milik_perusahaan'}
                      onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, status_kepemilikan: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="milik_perusahaan">Milik Perusahaan</option>
                      <option value="pribadi_fe">Pribadi FE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Digunakan oleh (Field Engineer)</label>
                  <input
                    type="text"
                    value={editData.data_tools?.field_engineer_name || ''}
                    onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, field_engineer_name: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Terima</label>
                  <input
                    type="date"
                    value={editData.data_tools?.tanggal_terima || ''}
                    onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, tanggal_terima: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan / Keterangan</label>
                  <textarea
                    value={editData.data_tools?.catatan_keterangan || ''}
                    onChange={(e) => setEditData({ ...editData, data_tools: { ...editData.data_tools, catatan_keterangan: e.target.value } })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">check</span>
                    Simpan Perubahan
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditData(tool);
                      setUpdateError(null);
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">close</span>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Photo Section */}
                {tool.data_tools?.foto_tool && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-icons text-primary-600">image</span>
                      Foto Tools
                    </h3>
                    <div className="flex justify-center">
                      <img 
                        src={`http://localhost:8000/storage/${tool.data_tools.foto_tool}`} 
                        alt={tool.nama_tools}
                        className="max-w-full max-h-96 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Tools Details Grid */}
                <div className="space-y-6">
                  <div className="pb-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-icons text-primary-600">info</span>
                      Informasi Utama
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Merek / Tipe</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{tool.data_tools?.merek_tipe || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Nomor Seri</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{tool.data_tools?.nomor_seri || '-'}</p>
                    </div>
                  </div>

                  <div className="pt-6 pb-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-icons text-primary-600">build</span>
                      Status & Kepemilikan
                    </h3>
                  </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Kondisi</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      tool.data_tools?.kondisi === 'baik' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      tool.data_tools?.kondisi === 'rusak' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      tool.data_tools?.kondisi === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {tool.data_tools?.kondisi ? tool.data_tools.kondisi.charAt(0).toUpperCase() + tool.data_tools.kondisi.slice(1) : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status Kepemilikan</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {tool.data_tools?.status_kepemilikan === 'milik_perusahaan' ? 'Milik Perusahaan' : 'Pribadi FE'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Digunakan oleh</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{tool.data_tools?.field_engineer_name || '-'}</p>
                </div>

                <div className="md:col-span-2 pt-6 pb-6 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary-600">calendar_today</span>
                    Informasi Tambahan
                  </h3>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Tanggal Terima</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {tool.data_tools?.tanggal_terima ? new Date(tool.data_tools.tanggal_terima).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Usia Tools</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {tool.data_tools?.tanggal_terima ? Math.floor((new Date() - new Date(tool.data_tools.tanggal_terima)) / (1000 * 60 * 60 * 24)) + ' hari' : '-'}
                  </p>
                </div>

                {tool.data_tools?.catatan_keterangan && (
                  <div className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-icons text-primary-600">notes</span>
                      Catatan / Keterangan
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{tool.data_tools.catatan_keterangan}</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <span className="material-icons text-6xl text-gray-300 dark:text-gray-600 justify-center mb-2 block">history</span>
                <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat perubahan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h, idx) => (
                  <div key={h.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="pt-1">
                          {getActionBadge(h.aksi)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{h.keterangan}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Oleh: <span className="font-medium">{h.user?.name || 'System'}</span> ({h.user?.email || '-'})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                            <span className="material-icons text-sm">schedule</span>
                            {formatDate(h.tanggal_aksi)}
                          </p>
                          
                          {/* Show changes if UPDATE action */}
                          {h.aksi === 'UPDATE' && (h.data_lama || h.data_baru) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Perubahan Data:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {/* Check nama_tools */}
                                {h.data_lama?.nama_tools !== h.data_baru?.nama_tools && (
                                  <div className="col-span-2">
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Nama:</span>
                                      <br/>
                                      <span className="line-through text-red-600">"{h.data_lama?.nama_tools}"</span>
                                      <span className="text-green-600">→ "{h.data_baru?.nama_tools}"</span>
                                    </p>
                                  </div>
                                )}
                                
                                {/* Check status */}
                                {h.data_lama?.status !== h.data_baru?.status && (
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Status:</span>
                                      <br/>
                                      <span className="line-through text-red-600">{h.data_lama?.status}</span>
                                      <span className="text-green-600">→ {h.data_baru?.status}</span>
                                    </p>
                                  </div>
                                )}
                                
                                {/* Check data_tools fields */}
                                {h.data_lama?.data_tools?.kondisi !== h.data_baru?.data_tools?.kondisi && (
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Kondisi:</span>
                                      <br/>
                                      <span className="line-through text-red-600">{h.data_lama?.data_tools?.kondisi}</span>
                                      <span className="text-green-600">→ {h.data_baru?.data_tools?.kondisi}</span>
                                    </p>
                                  </div>
                                )}
                                
                                {h.data_lama?.data_tools?.merek_tipe !== h.data_baru?.data_tools?.merek_tipe && (
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Merek:</span>
                                      <br/>
                                      <span className="line-through text-red-600">{h.data_lama?.data_tools?.merek_tipe}</span>
                                      <span className="text-green-600">→ {h.data_baru?.data_tools?.merek_tipe}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">#{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recaps' && (
          <div className="space-y-4">
            {recaps.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <span className="material-icons text-6xl text-gray-300 dark:text-gray-600 justify-center mb-2 block">calendar_month</span>
                <p className="text-gray-500 dark:text-gray-400">Belum ada rekap bulanan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recaps.map((recap) => (
                  <div key={recap.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{recap.bulan_tahun}</p>
                      </div>
                      <span className="material-icons text-primary-600 dark:text-primary-400">calendar_check</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Perubahan dalam bulan</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{recap.total_perubahan_dalam_bulan}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="material-icons text-sm">access_time</span>
                          {formatDate(recap.tanggal_rekap)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">QR Code Tools</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {qrImage && (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex justify-center">
                  <img src={qrImage.qr_image} alt="QR Code" className="w-64 h-64" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Tools:</span> {qrImage.nama_tools}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Kode:</span> {qrImage.kode_tool}
                  </p>
                </div>

                <button
                  onClick={handleDownloadQRCode}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <span className="material-icons">download</span>
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
