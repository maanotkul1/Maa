import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function HistoryJobDetailFO() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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
    
    // Jika path sudah dimulai dengan http, return langsung
    if (photoPath.startsWith('http')) {
      console.log('Photo URL (http):', photoPath);
      return photoPath;
    }
    
    // Construct full URL
    let fullUrl;
    if (photoPath.startsWith('/storage')) {
      fullUrl = `${baseUrl}${photoPath}`;
    } else {
      fullUrl = `${baseUrl}/storage/${photoPath}`;
    }
    
    console.log('Photo path:', photoPath, 'Full URL:', fullUrl);
    return fullUrl;
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
                Detail Troubleshooting FO
              </h1>
              <p className="text-sm lg:text-base text-orange-600 dark:text-orange-400 font-semibold mt-2">
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
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 px-4 lg:px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-orange-600 dark:text-orange-400">info</span>
              Informasi Umum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Tipe Job
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  🔌 Troubleshooting FO
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
            </div>
          </div>

          {/* Troubleshooting FO Specific Data */}
          <div className="px-4 lg:px-6 py-6 space-y-8">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-icons text-orange-600 dark:text-orange-400">assignment</span>
                Detail
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Tanggal Pekerjaan
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(job.tanggal_fo).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Nama Client
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{job.nama_client_fo}</p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    ODP/POP
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {job.odp_pop_fo || '-'}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Suspect
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {job.suspect_fo || '-'}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Action
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {job.action_fo || '-'}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Petugas FE
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {job.petugas_fe_fo || '-'}
                  </p>
                </div>
              </div>

              {/* Waktu Section */}
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-blue-600 dark:text-blue-400">schedule</span>
                  Waktu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Jam Datang
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {job.jam_datang_fo || '-'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Jam Selesai
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {job.jam_selesai_fo || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {job.note_fo && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-purple-600 dark:text-purple-400">note</span>
                    Catatan
                  </h3>
                  <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{job.note_fo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Photos */}
            {(job.foto_rumah || job.foto_pemasangan) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-icons text-purple-600 dark:text-purple-400">image</span>
                  Dokumentasi Foto
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {job.foto_rumah && (
                    <div
                      className="group cursor-pointer"
                      onClick={() =>
                        setSelectedImage({
                          src: getImageUrl(job.foto_rumah),
                          title: "Foto Rumah",
                        })
                      }
                    >
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Rumah
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-500 transition-all shadow-md hover:shadow-lg">
                        <img
                          src={getImageUrl(job.foto_rumah)}
                          alt="Foto Rumah"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23444%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2218%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
                          }}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Klik untuk memperbesar
                      </p>
                    </div>
                  )}
                  {job.foto_pemasangan && (
                    <div
                      className="group cursor-pointer"
                      onClick={() =>
                        setSelectedImage({
                          src: getImageUrl(job.foto_pemasangan),
                          title: "Foto Troubleshooting",
                        })
                      }
                    >
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        📸 Foto Troubleshooting
                      </label>
                      <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-500 transition-all shadow-md hover:shadow-lg">
                        <img
                          src={getImageUrl(job.foto_pemasangan)}
                          alt="Foto Troubleshooting"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23444%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2218%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
                          }}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Klik untuk memperbesar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image Modal */}
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
                    className="absolute top-4 right-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-2 transition-colors z-10"
                  >
                    <span className="material-icons">close</span>
                  </button>
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="max-w-full max-h-screen object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
