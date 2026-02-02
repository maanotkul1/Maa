import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import { shortenCode, generateShortCode } from '../utils/formatters';

export default function HistoryJobs() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('instalasi'); // instalasi, troubleshooting-fo, troubleshooting-wireless
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    tanggal_dari: '',
    tanggal_sampai: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters, activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Set job_type based on active tab
      if (activeTab === 'instalasi') {
        params.append('job_type', 'instalasi');
      } else if (activeTab === 'troubleshooting-fo') {
        params.append('job_type', 'troubleshooting_fo');
      } else if (activeTab === 'troubleshooting-wireless') {
        params.append('job_type', 'troubleshooting_wireless');
      }
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.tanggal_dari) params.append('tanggal_dari', filters.tanggal_dari);
      if (filters.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai);

      const response = await api.get(`/history-jobs?${params.toString()}`);
      
      // Handle paginated response
      let jobsData;
      if (response.data.data) {
        // Paginated response
        jobsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        jobsData = response.data;
      } else {
        jobsData = [];
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching history jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus history job ini?')) {
      return;
    }

    try {
      await api.delete(`/history-jobs/${id}`);
      fetchJobs();
    } catch (error) {
      console.error('Error deleting history job:', error);
      alert(error.response?.data?.message || 'Gagal menghapus history job');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              History Job FE
            </h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
              Riwayat pekerjaan Field Engineer
            </p>
          </div>
          <Link
            to="/history-jobs/new"
            className="bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <span className="material-icons text-lg">add</span>
            <span>Tambah History Job</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border-b dark:border-gray-700">
          <div className="flex gap-0 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('instalasi');
                setFilters({ status: '', search: '', tanggal_dari: '', tanggal_sampai: '' });
              }}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'instalasi'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-lg">construction</span>
                Instalasi
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('troubleshooting-fo');
                setFilters({ status: '', search: '', tanggal_dari: '', tanggal_sampai: '' });
              }}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'troubleshooting-fo'
                  ? 'text-orange-600 dark:text-orange-400 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-lg">fiber_manual_record</span>
                Troubleshooting FO
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('troubleshooting-wireless');
                setFilters({ status: '', search: '', tanggal_dari: '', tanggal_sampai: '' });
              }}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'troubleshooting-wireless'
                  ? 'text-purple-600 dark:text-purple-400 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-icons text-lg">signal_cellular_4_bar</span>
                Troubleshooting Wireless
              </span>
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-b-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Semua Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Dari
              </label>
              <input
                type="date"
                value={filters.tanggal_dari}
                onChange={(e) => handleFilterChange('tanggal_dari', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Sampai
              </label>
              <input
                type="date"
                value={filters.tanggal_sampai}
                onChange={(e) => handleFilterChange('tanggal_sampai', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Cari job..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setFilters({ status: '', search: '', tanggal_dari: '', tanggal_sampai: '' })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Jobs List - Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
              Tidak ada history job ditemukan
            </div>
          ) : (
            jobs.map((job) => {
              const engineerDisplay = job.field_engineer_1 && String(job.field_engineer_1).trim() !== '' ? String(job.field_engineer_1).trim() : '-';
              
              return (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        activeTab === 'instalasi' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        activeTab === 'troubleshooting-fo' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {activeTab === 'instalasi' ? 'Instalasi' :
                         activeTab === 'troubleshooting-fo' ? 'Troubleshooting FO' :
                         'Troubleshooting Wireless'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" title={job.job_number}>
                        {shortenCode(job.job_number)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.nama_client}</h3>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="space-y-2 text-sm">
                  {/* Instalasi Fields */}
                  {activeTab === 'instalasi' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">location_on</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Tikor:</strong> {job.tikor_odp_jb || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">settings</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Port:</strong> {job.port_odp || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">signal_cellular_4_bar</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Redaman:</strong> {job.redaman ? `${job.redaman} dB` : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">straighten</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Kabel:</strong> {job.panjang_kabel ? `${job.panjang_kabel} m` : '-'}</span>
                      </div>
                    </>
                  )}

                  {/* Troubleshooting FO Fields */}
                  {activeTab === 'troubleshooting-fo' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">location_on</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Tikor:</strong> {job.tikor_odp_jb || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">settings</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Port:</strong> {job.port_odp || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">signal_cellular_4_bar</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Redaman:</strong> {job.redaman ? `${job.redaman} dB` : '-'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-icons text-gray-400 text-lg mt-0.5">info</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Action:</strong> {job.detail_action ? job.detail_action.substring(0, 50) + '...' : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">electrical_services</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Tipe Cut:</strong> {job.tipe_cut || '-'}</span>
                      </div>
                    </>
                  )}

                  {/* Troubleshooting Wireless Fields */}
                  {activeTab === 'troubleshooting-wireless' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">location_on</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>POP:</strong> {job.tikor_odp_jb || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-gray-400 text-lg">signal_cellular_4_bar</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Signal:</strong> {job.redaman || '-'}</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="material-icons text-gray-400 text-lg mt-0.5">person</span>
                    <div className="flex-1 text-gray-600 dark:text-gray-400 text-sm">
                      <strong>Teknisi:</strong> {engineerDisplay}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-lg">calendar_today</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(job.tanggal_pekerjaan)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/history-jobs/${job.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-icons text-lg">visibility</span>
                    <span>View</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => navigate(`/history-jobs/${job.id}/edit`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Jobs List - Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                activeTab === 'instalasi' ? 'bg-yellow-50 dark:bg-gray-700' :
                activeTab === 'troubleshooting-fo' ? 'bg-orange-50 dark:bg-gray-700' :
                'bg-purple-50 dark:bg-gray-700'
              }`}>
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Job Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Nama Client</th>
                  
                  {/* Instalasi Columns */}
                  {activeTab === 'instalasi' && (
                    <>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tikor ODP/JB</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Port ODP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Redaman (dB)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Panjang Kabel</th>
                    </>
                  )}
                  
                  {/* Troubleshooting FO Columns */}
                  {activeTab === 'troubleshooting-fo' && (
                    <>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tikor ODP/JB</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Port ODP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Redaman (dB)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Detail Action</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tipe Cut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tikor Cut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Tipe Kabel</th>
                    </>
                  )}
                  
                  {/* Troubleshooting Wireless Columns */}
                  {activeTab === 'troubleshooting-wireless' && (
                    <>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">POP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Signal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Catatan</th>
                    </>
                  )}
                  
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Teknisi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">Status</th>
                  <th className={`text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm sticky right-0 ${
                    activeTab === 'instalasi' ? 'bg-yellow-50 dark:bg-gray-700' :
                    activeTab === 'troubleshooting-fo' ? 'bg-orange-50 dark:bg-gray-700' :
                    'bg-purple-50 dark:bg-gray-700'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'instalasi' ? 10 : activeTab === 'troubleshooting-fo' ? 13 : 9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Tidak ada history job ditemukan
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(job.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 font-mono" title={job.job_number}>
                        {generateShortCode(job.id, job.created_at, 'J')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.nama_client}</td>
                      
                      {/* Instalasi Fields */}
                      {activeTab === 'instalasi' && (
                        <>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tikor_odp_jb || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.port_odp || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.redaman ? `${job.redaman} dB` : '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.panjang_kabel ? `${job.panjang_kabel} m` : '-'}</td>
                        </>
                      )}
                      
                      {/* Troubleshooting FO Fields */}
                      {activeTab === 'troubleshooting-fo' && (
                        <>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tikor_odp_jb || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.port_odp || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.redaman ? `${job.redaman} dB` : '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={job.detail_action}>{job.detail_action || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tipe_cut || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tikor_cut || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tipe_kabel || '-'}</td>
                        </>
                      )}
                      
                      {/* Troubleshooting Wireless Fields */}
                      {activeTab === 'troubleshooting-wireless' && (
                        <>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.tikor_odp_jb || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{job.redaman || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={job.catatan_teknisi}>{job.catatan_teknisi || '-'}</td>
                        </>
                      )}
                      
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {job.field_engineer_1 && String(job.field_engineer_1).trim() !== '' ? String(job.field_engineer_1).trim() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className={`py-3 px-4 sticky right-0 ${
                        activeTab === 'instalasi' ? 'bg-white dark:bg-gray-800' :
                        activeTab === 'troubleshooting-fo' ? 'bg-white dark:bg-gray-800' :
                        'bg-white dark:bg-gray-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/history-jobs/${job.id}`}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            title="View"
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </Link>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => navigate(`/history-jobs/${job.id}/edit`)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                title="Edit"
                              >
                                <span className="material-icons text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(job.id)}
                                className="text-red-600 hover:text-red-700 flex items-center gap-1"
                                title="Delete"
                              >
                                <span className="material-icons text-sm">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  };

  const config = statusConfig[status] || statusConfig.completed;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

