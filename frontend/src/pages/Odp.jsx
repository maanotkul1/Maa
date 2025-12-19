import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import MapView from '../components/MapView';

export default function Odp() {
  const { user } = useAuth();
  const [odps, setOdps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOdp, setEditingOdp] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', area: '' });
  const [areas, setAreas] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'map'
  const [formData, setFormData] = useState({
    kode_odp: '',
    nama_odp: '',
    area_cluster: '',
    alamat: '',
    latitude: '',
    longitude: '',
    status: 'active',
    keterangan: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOdps();
    fetchAreas();
  }, [filters]);

  const fetchOdps = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.area) params.append('area', filters.area);

      const response = await api.get(`/odps?${params.toString()}`);
      setOdps(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ODPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await api.get('/odps/areas');
      setAreas(response.data.data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingOdp) {
        await api.put(`/odps/${editingOdp.id}`, formData);
      } else {
        await api.post('/odps', formData);
      }
      setShowModal(false);
      resetForm();
      fetchOdps();
      fetchAreas();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan ODP');
    }
  };

  const handleEdit = (odp) => {
    setEditingOdp(odp);
    setFormData({
      kode_odp: odp.kode_odp,
      nama_odp: odp.nama_odp,
      area_cluster: odp.area_cluster || '',
      alamat: odp.alamat || '',
      latitude: odp.latitude,
      longitude: odp.longitude,
      status: odp.status,
      keterangan: odp.keterangan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus ODP ini?')) return;
    try {
      await api.delete(`/odps/${id}`);
      fetchOdps();
    } catch (error) {
      alert('Gagal menghapus ODP');
    }
  };

  const resetForm = () => {
    setEditingOdp(null);
    setFormData({
      kode_odp: '',
      nama_odp: '',
      area_cluster: '',
      alamat: '',
      latitude: '',
      longitude: '',
      status: 'active',
      keterangan: '',
    });
    setError('');
  };

  const handleLocationChange = (lat, lng) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const StatusBadge = ({ status }) => {
    const config = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    };
    const c = config[status] || config.active;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
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

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Master Data ODP</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Kelola titik lokasi ODP</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'map' : 'table')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-lg">{viewMode === 'table' ? 'map' : 'table_chart'}</span>
              <span>{viewMode === 'table' ? 'Map View' : 'Table View'}</span>
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-lg">add</span>
              <span>Tambah ODP</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Cari ODP..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area</label>
              <select
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Semua Area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', status: '', area: '' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="h-[500px]">
              <MapView
                latitude={odps[0]?.latitude || -6.2}
                longitude={odps[0]?.longitude || 106.8}
                markers={odps.map(odp => ({
                  lat: parseFloat(odp.latitude),
                  lng: parseFloat(odp.longitude),
                  popup: `<b>${odp.kode_odp}</b><br/>${odp.nama_odp}<br/>${odp.alamat || ''}`
                }))}
                zoom={12}
              />
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {odps.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada ODP ditemukan
                </div>
              ) : (
                odps.map((odp) => (
                  <div key={odp.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{odp.kode_odp}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{odp.nama_odp}</p>
                      </div>
                      <StatusBadge status={odp.status} />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {odp.area_cluster && (
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-lg">location_city</span>
                          <span>{odp.area_cluster}</span>
                        </div>
                      )}
                      {odp.alamat && (
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-lg">place</span>
                          <span className="truncate">{odp.alamat}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-lg">work</span>
                        <span>{odp.jobs_count || 0} Jobs</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(odp)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <span className="material-icons text-lg">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(odp.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <span className="material-icons text-lg">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Kode ODP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Nama ODP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Area</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Alamat</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Koordinat</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Jobs</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {odps.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Tidak ada ODP ditemukan
                        </td>
                      </tr>
                    ) : (
                      odps.map((odp) => (
                        <tr key={odp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{odp.kode_odp}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{odp.nama_odp}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{odp.area_cluster || '-'}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">{odp.alamat || '-'}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-xs font-mono">
                            {odp.latitude}, {odp.longitude}
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={odp.status} /></td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{odp.jobs_count || 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://www.google.com/maps?q=${odp.latitude},${odp.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700"
                                title="Buka di Google Maps"
                              >
                                <span className="material-icons text-sm">map</span>
                              </a>
                              <button
                                onClick={() => handleEdit(odp)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Edit"
                              >
                                <span className="material-icons text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(odp.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Hapus"
                              >
                                <span className="material-icons text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">
                {editingOdp ? 'Edit ODP' : 'Tambah ODP Baru'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kode ODP *</label>
                      <input
                        type="text"
                        value={formData.kode_odp}
                        onChange={(e) => setFormData({ ...formData, kode_odp: e.target.value })}
                        required
                        placeholder="ODP-XXX-XXX"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama ODP *</label>
                    <input
                      type="text"
                      value={formData.nama_odp}
                      onChange={(e) => setFormData({ ...formData, nama_odp: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area / Cluster</label>
                    <input
                      type="text"
                      value={formData.area_cluster}
                      onChange={(e) => setFormData({ ...formData, area_cluster: e.target.value })}
                      placeholder="Contoh: Jakarta Selatan"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alamat</label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keterangan</label>
                    <textarea
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                {/* Map */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Lokasi di Peta (Klik untuk menentukan titik)
                  </label>
                  <div className="h-[350px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <MapView
                      latitude={formData.latitude || -6.2}
                      longitude={formData.longitude || 106.8}
                      onLocationChange={handleLocationChange}
                      editable={true}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingOdp ? 'Update ODP' : 'Simpan ODP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

