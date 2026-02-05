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
  const [selectedImage, setSelectedImage] = useState(null);

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
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Gagal memuat data job');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return "";
    
    // Get base origin from VITE_API_URL or default
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    // Remove /api suffix if present
    baseUrl = baseUrl.replace(/\/api\/?$/, '');
    
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    
    if (photoPath.startsWith('/storage')) {
      return `${baseUrl}${photoPath}`;
    }
    
    return `${baseUrl}/storage/${photoPath}`;
  };
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
                <p className="text-lg font-bold text-gray-900 dark:text-white">{job.nama_client_wireless}</p>
              </div>
            </div>
          </div>

          {/* Wireless Specific Data */}
          <div className="px-4 lg:px-6 py-8 space-y-8">
            {/* Informasi Teknis Wireless */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-icons text-purple-600 dark:text-purple-400">router</span>
                Informasi Teknis Wireless
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {job.tanggal_wireless && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-3">
                      📅 Tanggal Pekerjaan
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{new Date(job.tanggal_wireless).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
                {job.nama_client_wireless && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-3">
                      👤 Nama Client
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.nama_client_wireless}</p>
                  </div>
                )}
                {job.odp_pop_wireless && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-3">
                      📍 ODP/POP
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.odp_pop_wireless}</p>
                  </div>
                )}
                {job.suspect_wireless && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-3">
                      🔍 Suspect/Penyebab
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.suspect_wireless}</p>
                  </div>
                )}
                {job.action_wireless && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-red-200 dark:border-red-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide mb-3">
                      ⚙️ Action/Tindakan
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.action_wireless}</p>
                  </div>
                )}
                {job.redaman_signal_wireless && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-3">
                      📊 Redaman/Signal
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.redaman_signal_wireless}</p>
                  </div>
                )}
                {job.tipe_kabel_wireless && (
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-pink-200 dark:border-pink-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-3">
                      🔌 Tipe Kabel
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.tipe_kabel_wireless}</p>
                  </div>
                )}
                {job.petugas_fe_wireless && (
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-cyan-200 dark:border-cyan-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-3">
                      👨‍🔧 Petugas FE
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.petugas_fe_wireless}</p>
                  </div>
                )}
                {job.jam_datang && (
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-3">
                      🕐 Jam Datang
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.jam_datang}</p>
                  </div>
                )}
                {job.jam_selesai && (
                  <div className="bg-gradient-to-br from-lime-50 to-lime-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-lime-200 dark:border-lime-700 hover:shadow-md transition-shadow">
                    <label className="block text-xs font-bold text-lime-700 dark:text-lime-300 uppercase tracking-wide mb-3">
                      🕒 Jam Selesai
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{job.jam_selesai}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Note Wireless */}
            {job.note_wireless && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-blue-600 dark:text-blue-400">note</span>
                  Catatan & Keterangan
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed font-medium">{job.note_wireless}</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {(job.foto_rumah || job.foto_pemasangan) && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-icons text-indigo-600 dark:text-indigo-400">image</span>
                  Dokumentasi Foto
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {job.foto_rumah && (
                    <div className="group cursor-pointer" onClick={() => setSelectedImage({ src: getImageUrl(job.foto_rumah), title: 'Foto Site' })}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Site
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all shadow-md hover:shadow-lg">
                        <img
                          src={getImageUrl(job.foto_rumah)}
                          alt="Foto Site"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23444%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2218%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
                          }}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Klik untuk memperbesar</p>
                    </div>
                  )}
                  {job.foto_pemasangan && (
                    <div className="group cursor-pointer" onClick={() => setSelectedImage({ src: getImageUrl(job.foto_pemasangan), title: 'Foto Troubleshooting' })}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Troubleshooting
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all shadow-md hover:shadow-lg">
                        <img
                          src={getImageUrl(job.foto_pemasangan)}
                          alt="Foto Troubleshooting"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23444%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2218%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
                          }}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Klik untuk memperbesar</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              title="Tutup"
            >
              <span className="material-icons text-3xl">close</span>
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-4xl max-h-screen w-auto h-auto rounded-lg"
              onError={(e) => {
                console.error('Modal image failed to load:', e.target.src);
                e.target.src = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23444%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2224%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2218%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
              }}
            />
            <p className="text-white text-center mt-4 text-sm">
              {selectedImage.title}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
