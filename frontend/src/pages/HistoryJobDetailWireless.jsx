import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function HistoryJobDetailWireless() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const peralatanFields = [
    { key: 'peralatan_radio', label: 'Radio' },
    { key: 'peralatan_kabel', label: 'Kabel' },
    { key: 'peralatan_adaptor', label: 'Adaptor' },
    { key: 'peralatan_poe', label: 'POE' },
    { key: 'peralatan_rj45', label: 'RJ45' },
    { key: 'peralatan_router_switch', label: 'Router/Switch' },
    { key: 'peralatan_ap', label: 'AP' },
    { key: 'peralatan_lainnya', label: 'Lainnya' },
  ];

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/history-jobs/${id}`);
      let jobData = response.data;
      
      // Convert string "0"/"1" to boolean for equipment fields
      peralatanFields.forEach(field => {
        if (jobData[field.key] !== undefined && jobData[field.key] !== null) {
          jobData[field.key] = jobData[field.key] === '1' || jobData[field.key] === 1 || jobData[field.key] === true;
        }
      });
      
      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Gagal memuat data job');
    } finally {
      setLoading(false);
    }
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

  if (!job) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <p className="text-gray-500 dark:text-gray-400">Job tidak ditemukan</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Link
              to="/history-jobs"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 inline-flex items-center gap-1 text-sm lg:text-base transition-colors"
            >
              <span className="material-icons text-lg">arrow_back</span>
              <span>Kembali ke History Jobs</span>
            </Link>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Detail Troubleshooting Wireless
              </h1>
              <p className="text-sm lg:text-base text-purple-600 dark:text-purple-400 font-semibold mt-2">
                {job.job_number}
              </p>
            </div>
          </div>
          {(isAdmin || 
            (job.field_engineer_1 && job.field_engineer_1.includes(user?.name)) ||
            (job.field_engineer_2 && job.field_engineer_2.includes(user?.name)) ||
            (job.field_engineer_3 && job.field_engineer_3.includes(user?.name))) && (
            <Link
              to={`/history-jobs/${id}/edit`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <span className="material-icons">edit</span>
              <span>Edit</span>
            </Link>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Basic Info Section */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 px-4 lg:px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-purple-600 dark:text-purple-400">info</span>
              Informasi Umum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Tipe Job
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  📡 Troubleshooting Wireless
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Status
                </label>
                <p className="text-lg font-bold capitalize">
                  {job.status === 'completed' && <span className="text-green-600 dark:text-green-400">✓ Selesai</span>}
                  {job.status === 'in_progress' && <span className="text-yellow-600 dark:text-yellow-400">⏳ Sedang Dikerjakan</span>}
                  {job.status === 'pending' && <span className="text-gray-600 dark:text-gray-400">○ Tertunda</span>}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Nama Client
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{job.nama_client}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Teknisi
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {job.field_engineer_1 && String(job.field_engineer_1).trim() !== '' ? String(job.field_engineer_1).trim() : '-'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Tanggal Pekerjaan
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(job.tanggal_pekerjaan).toLocaleDateString('id-ID')}
                </p>
              </div>
              {job.tikor_odp_jb && String(job.tikor_odp_jb).trim() !== '' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    POP
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{String(job.tikor_odp_jb).trim()}</p>
                </div>
              )}
              {job.redaman && String(job.redaman).trim() !== '' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Signal (dB)
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{String(job.redaman).trim()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Wireless Specific Data */}
          <div className="px-4 lg:px-6 py-6 space-y-8">
            {/* Catatan Teknisi */}
            {job.catatan_teknisi && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-purple-600 dark:text-purple-400">note</span>
                  Catatan Teknisi
                </h2>
                <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{job.catatan_teknisi}</p>
                </div>
              </div>
            )}

            {/* Lokasi & Area */}
            {(job.lokasi_site || job.area_ruangan) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-orange-600 dark:text-orange-400">location_on</span>
                  Lokasi & Area
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.lokasi_site && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📍 Lokasi Site
                      </label>
                      <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-gray-900 dark:text-white">{job.lokasi_site}</p>
                      </div>
                    </div>
                  )}
                  {job.area_ruangan && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        🏢 Area Ruangan
                      </label>
                      <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-gray-900 dark:text-white">{job.area_ruangan}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Peralatan yang Digunakan */}
            {peralatanFields.some(field => job[field.key]) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-icons text-purple-600 dark:text-purple-400">construction</span>
                  Kerusakan
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {peralatanFields.map(field => 
                    job[field.key] ? (
                      <div key={field.key} className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border-2 border-green-500 flex items-center gap-3">
                        <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
                        <span className="font-semibold text-green-700 dark:text-green-300">{field.label}</span>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Peralatan Lainnya Keterangan */}
                {job.peralatan_lainnya && job.peralatan_lainnya_keterangan && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      📝 Keterangan Peralatan Lainnya
                    </label>
                    <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{job.peralatan_lainnya_keterangan}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Catatan Umum */}
            {job.keterangan && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-blue-600 dark:text-blue-400">description</span>
                  Keterangan Umum
                </h2>
                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{job.keterangan}</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {(job.foto_rumah || job.foto_pemasangan) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-icons text-indigo-600 dark:text-indigo-400">image</span>
                  Dokumentasi Foto
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {job.foto_rumah && (
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Site
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-purple-500 transition-all">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${job.foto_rumah}`}
                          alt="Foto Site"
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                  {job.foto_pemasangan && (
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Troubleshooting
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-purple-500 transition-all">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${job.foto_pemasangan}`}
                          alt="Foto Troubleshooting"
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
