import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import MainLayout from "../components/Layout/MainLayout";

export default function HistoryJobDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/history-jobs/${ id }`);
      setJob(response.data);
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Gagal memuat data job");
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeLabel = (jobType) => {
    const types = {
      instalasi: { label: " Instalasi", color: "yellow" },
      troubleshooting_fo: { label: " Troubleshooting FO", color: "orange" },
      troubleshooting_wireless: {
        label: " Troubleshooting Wireless",
        color: "purple",
      },
    };
    return types[jobType] || { label: "Unknown", color: "gray" };
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      completed: { label: " Selesai", color: "green" },
      in_progress: { label: " Sedang Dikerjakan", color: "yellow" },
      pending: { label: " Tertunda", color: "gray" },
    };
    return statusMap[status] || { label: status, color: "gray" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
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

  const FieldCard = ({ label, value }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </label>
      <p className="text-gray-900 dark:text-white font-semibold text-lg">{value || "-"}</p>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <p className="text-red-500 dark:text-red-400">{error}</p>
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

  const jobTypeInfo = getJobTypeLabel(job.job_type);
  const statusInfo = getStatusLabel(job.status);

  const fields = [];
  fields.push({ label: "Tipe Job", value: jobTypeInfo.label, section: "Umum" });
  fields.push({ label: "Status", value: statusInfo.label, section: "Umum" });

  // Nama Client hanya untuk Instalasi dan Wireless
  if (job.job_type === "troubleshooting_wireless") {
    fields.push({
      label: "Nama Client",
      value: job.nama_client_wireless,
      section: "Umum",
    });
  } else if (job.job_type === "instalasi") {
    fields.push({ label: "Nama Client", value: job.nama_client, section: "Umum" });
  }
  // Tidak tambahkan Nama Client untuk troubleshooting_fo - masuk ke Detail section

  if (job.job_type === "instalasi") {
    if (job.tikor_odp_jb)
      fields.push({
        label: "Tikor ODP/JB",
        value: job.tikor_odp_jb,
        section: "Lokasi",
      });
    if (job.port_odp)
      fields.push({ label: "Port ODP", value: job.port_odp, section: "Lokasi" });
    if (job.redaman)
      fields.push({
        label: "Redaman",
        value: `${ job.redaman } dB`,
        section: "Teknis",
      });
    if (job.field_engineer_1)
      fields.push({
        label: "Teknisi",
        value: String(job.field_engineer_1).trim(),
        section: "Teknis",
      });
    if (job.tanggal_pekerjaan)
      fields.push({
        label: "Tanggal Pekerjaan",
        value: formatDate(job.tanggal_pekerjaan),
        section: "Teknis",
      });
  }

  if (job.job_type === "instalasi") {
    if (job.panjang_kabel)
      fields.push({
        label: "Panjang Kabel",
        value: `${ job.panjang_kabel } m`,
        section: "Detail",
      });
  }

  if (job.job_type === "troubleshooting_fo") {
    // Tidak tambahkan Tikor ODP/JB dan Port ODP untuk FO
    if (job.tanggal_fo)
      fields.push({
        label: "Tanggal Pekerjaan",
        value: formatDate(job.tanggal_fo),
        section: "Detail",
      });
    if (job.nama_client_fo)
      fields.push({
        label: "Nama Client",
        value: job.nama_client_fo,
        section: "Detail",
      });
    if (job.odp_pop_fo)
      fields.push({
        label: "ODP/POP",
        value: job.odp_pop_fo,
        section: "Detail",
      });
    if (job.suspect_fo)
      fields.push({
        label: "Suspect",
        value: job.suspect_fo,
        section: "Detail",
      });
    if (job.action_fo)
      fields.push({
        label: "Action",
        value: job.action_fo,
        section: "Detail",
      });
    if (job.petugas_fe_fo)
      fields.push({
        label: "Petugas FE",
        value: job.petugas_fe_fo,
        section: "Detail",
      });
    if (job.jam_datang_fo)
      fields.push({
        label: "Jam Datang",
        value: job.jam_datang_fo,
        section: "Waktu",
      });
    if (job.jam_selesai_fo)
      fields.push({
        label: "Jam Selesai",
        value: job.jam_selesai_fo,
        section: "Waktu",
      });
  }

  if (job.job_type === "troubleshooting_wireless") {
    if (job.tanggal_wireless)
      fields.push({
        label: "Tanggal Pekerjaan",
        value: formatDate(job.tanggal_wireless),
        section: "Detail",
      });
    if (job.odp_pop_wireless)
      fields.push({
        label: "ODP/POP",
        value: job.odp_pop_wireless,
        section: "Detail",
      });
    if (job.suspect_wireless)
      fields.push({
        label: "Suspect/Penyebab",
        value: job.suspect_wireless,
        section: "Detail",
      });
    if (job.action_wireless)
      fields.push({
        label: "Action/Tindakan",
        value: job.action_wireless,
        section: "Detail",
      });
    if (job.redaman_signal_wireless)
      fields.push({
        label: "Redaman/Signal",
        value: job.redaman_signal_wireless,
        section: "Detail",
      });
    if (job.tipe_kabel_wireless)
      fields.push({
        label: "Tipe Kabel",
        value: job.tipe_kabel_wireless,
        section: "Detail",
      });
    if (job.petugas_fe_wireless)
      fields.push({
        label: "Petugas FE",
        value: job.petugas_fe_wireless,
        section: "Detail",
      });
    if (job.jam_datang)
      fields.push({
        label: "Jam Datang",
        value: job.jam_datang,
        section: "Waktu",
      });
    if (job.jam_selesai)
      fields.push({
        label: "Jam Selesai",
        value: job.jam_selesai,
        section: "Waktu",
      });
  }

  const noteText =
    job.job_type === "troubleshooting_wireless"
      ? job.note_wireless
      : job.job_type === "troubleshooting_fo"
      ? job.note_fo
      : job.keterangan;

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 space-y-6">
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
                Detail History Job
              </h1>
              <p
                className={`text-sm lg:text-base font-semibold mt-2 ${
                  jobTypeInfo.color === "yellow"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : jobTypeInfo.color === "orange"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-purple-600 dark:text-purple-400"
                }`}
              >
                {job.job_number}
              </p>
            </div>
          </div>
          {(isAdmin ||
            (job.field_engineer_1 &&
              job.field_engineer_1.includes(user?.name)) ||
            (job.field_engineer_2 &&
              job.field_engineer_2.includes(user?.name)) ||
            (job.field_engineer_3 &&
              job.field_engineer_3.includes(user?.name))) && (
            <Link
              to={`/history-jobs/${ id }/edit`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <span className="material-icons">edit</span>
              <span>Edit</span>
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-8 space-y-8">
            {["Umum", "Lokasi", "Teknis", "Detail", "Waktu"].map((section) => {
              const sectionFields = fields.filter((f) => f.section === section);
              if (sectionFields.length === 0) return null;

              const sectionIcons = {
                Umum: "info",
                Lokasi: "location_on",
                Teknis: "settings",
                Detail: "description",
                Waktu: "schedule",
              };

              return (
                <div key={section}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-icons">{sectionIcons[section]}</span>
                    {section}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sectionFields.map((field, idx) => (
                      <FieldCard
                        key={idx}
                        label={field.label}
                        value={field.value}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {noteText && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons">note</span>
                  Catatan & Keterangan
                </h2>
                <div className="bg-blue-50 dark:bg-gray-700 p-5 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {noteText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(job.foto_rumah || job.foto_pemasangan) && (
            <div className="px-4 lg:px-6 py-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-icons text-indigo-600 dark:text-indigo-400">
                  image
                </span>
                Dokumentasi Foto
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {job.foto_rumah && (
                  <div
                    className="group cursor-pointer"
                    onClick={() =>
                      setSelectedImage({
                        src: getImageUrl(job.foto_rumah),
                        title: "Foto Site",
                      })
                    }
                  >
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                       Foto Site
                    </label>
                    <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all shadow-md hover:shadow-lg">
                      <img
                        src={getImageUrl(job.foto_rumah)}
                        alt="Foto Site"
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
                        title: "Foto Pekerjaan",
                      })
                    }
                  >
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                       Foto Pekerjaan
                    </label>
                    <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all shadow-md hover:shadow-lg">
                      <img
                        src={getImageUrl(job.foto_pemasangan)}
                        alt="Foto Pekerjaan"
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
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23444%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2245%25%22 font-size=%2224%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%22.3em%22%3EGambar tidak dapat dimuat%3C/text%3E%3Ctext x=%2250%25%22 y=%2255%25%22 font-size=%2218%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EPeriksa console untuk detail%3C/text%3E%3C/svg%3E";
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
