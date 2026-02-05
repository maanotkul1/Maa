import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function EditHistoryJob() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_type: 'instalasi',
    nama_client: '',
    tikor_odp_jb: '',
    port_odp: '',
    redaman: '',
    field_engineer: '',
    tanggal_pekerjaan: '',
    panjang_kabel: '',
    detail_action: '',
    tipe_cut: '',
    tikor_cut: '',
    tipe_kabel: '',
    keterangan: '',
    foto_rumah: null,
    foto_pemasangan: null,
    tanggal_wireless: '',
    nama_client_wireless: '',
    odp_pop_wireless: '',
    suspect_wireless: '',
    action_wireless: '',
    redaman_signal_wireless: '',
    tipe_kabel_wireless: '',
    petugas_fe_wireless: '',
    jam_datang: '',
    jam_selesai: '',
    note_wireless: '',
    tanggal_fo: '',
    nama_client_fo: '',
    odp_pop_fo: '',
    suspect_fo: '',
    action_fo: '',
    petugas_fe_fo: '',
    jam_datang_fo: '',
    jam_selesai_fo: '',
    note_fo: '',
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/history-jobs/${id}`);
      const job = response.data;
      setFormData({
        job_type: job.job_type,
        nama_client: job.nama_client || '',
        tikor_odp_jb: job.tikor_odp_jb || '',
        port_odp: job.port_odp || '',
        redaman: job.redaman || '',
        field_engineer: job.field_engineer_1 || '',
        tanggal_pekerjaan: job.tanggal_pekerjaan || '',
        panjang_kabel: job.panjang_kabel || '',
        detail_action: job.detail_action || '',
        tipe_cut: job.tipe_cut || '',
        tikor_cut: job.tikor_cut || '',
        tipe_kabel: job.tipe_kabel || '',
        keterangan: job.keterangan || '',
        foto_rumah: job.foto_rumah || null,
        foto_pemasangan: job.foto_pemasangan || null,
        tanggal_wireless: job.tanggal_wireless || '',
        nama_client_wireless: job.nama_client_wireless || '',
        odp_pop_wireless: job.odp_pop_wireless || '',
        suspect_wireless: job.suspect_wireless || '',
        action_wireless: job.action_wireless || '',
        redaman_signal_wireless: job.redaman_signal_wireless || '',
        tipe_kabel_wireless: job.tipe_kabel_wireless || '',
        petugas_fe_wireless: job.petugas_fe_wireless || '',
        jam_datang: job.jam_datang || '',
        jam_selesai: job.jam_selesai || '',
        note_wireless: job.note_wireless || '',
        tanggal_fo: job.tanggal_fo || '',
        nama_client_fo: job.nama_client_fo || '',
        odp_pop_fo: job.odp_pop_fo || '',
        suspect_fo: job.suspect_fo || '',
        action_fo: job.action_fo || '',
        petugas_fe_fo: job.petugas_fe_fo || '',
        jam_datang_fo: job.jam_datang_fo || '',
        jam_selesai_fo: job.jam_selesai_fo || '',
        note_fo: job.note_fo || '',
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Gagal memuat data job');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append('job_type', formData.job_type);
      
      if (formData.job_type === 'instalasi') {
        // INSTALASI
        submitData.append('nama_client', formData.nama_client);
        submitData.append('field_engineer_1', formData.field_engineer || '');
        submitData.append('tanggal_pekerjaan', formData.tanggal_pekerjaan);
        submitData.append('keterangan', formData.keterangan || '');
        submitData.append('tikor_odp_jb', formData.tikor_odp_jb || '');
        submitData.append('port_odp', formData.port_odp || '');
        submitData.append('redaman', formData.redaman || '');
        submitData.append('panjang_kabel', formData.panjang_kabel || '');
        
      } else if (formData.job_type === 'troubleshooting_fo') {
        // TROUBLESHOOTING FO - new simplified fields
        submitData.append('tanggal_fo', formData.tanggal_fo || '');
        submitData.append('nama_client_fo', formData.nama_client_fo || '');
        submitData.append('odp_pop_fo', formData.odp_pop_fo || '');
        submitData.append('suspect_fo', formData.suspect_fo || '');
        submitData.append('action_fo', formData.action_fo || '');
        submitData.append('petugas_fe_fo', formData.petugas_fe_fo || '');
        submitData.append('jam_datang_fo', formData.jam_datang_fo || '');
        submitData.append('jam_selesai_fo', formData.jam_selesai_fo || '');
        submitData.append('note_fo', formData.note_fo || '');
        
      } else if (formData.job_type === 'troubleshooting_wireless') {
        // TROUBLESHOOTING WIRELESS - new simplified fields (NO common fields)
        submitData.append('tanggal_wireless', formData.tanggal_wireless || '');
        submitData.append('nama_client_wireless', formData.nama_client_wireless || '');
        submitData.append('odp_pop_wireless', formData.odp_pop_wireless || '');
        submitData.append('suspect_wireless', formData.suspect_wireless || '');
        submitData.append('action_wireless', formData.action_wireless || '');
        submitData.append('redaman_signal_wireless', formData.redaman_signal_wireless || '');
        submitData.append('tipe_kabel_wireless', formData.tipe_kabel_wireless || '');
        submitData.append('petugas_fe_wireless', formData.petugas_fe_wireless || '');
        submitData.append('jam_datang', formData.jam_datang || '');
        submitData.append('jam_selesai', formData.jam_selesai || '');
        submitData.append('note_wireless', formData.note_wireless || '');
      }

      if (formData.foto_rumah && typeof formData.foto_rumah !== 'string') submitData.append('foto_rumah', formData.foto_rumah);
      if (formData.foto_pemasangan && typeof formData.foto_pemasangan !== 'string') submitData.append('foto_pemasangan', formData.foto_pemasangan);

      console.log('Submit FormData contents:');
      for (let pair of submitData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      await api.put(`/history-jobs/${id}`, submitData);

      navigate('/history-jobs');
    } catch (error) {
      console.error('Error updating history job:', error);
      alert(error.response?.data?.message || 'Gagal mengupdate history job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <button
            onClick={() => navigate('/history-jobs')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 flex items-center gap-1 text-sm lg:text-base"
          >
            <span className="material-icons text-lg">arrow_back</span>
            <span>Kembali ke History Jobs</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Edit History Job
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
            Edit riwayat pekerjaan Field Engineer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 space-y-6">
          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Job <span className="text-red-500">*</span>
            </label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="instalasi">🏠 Instalasi</option>
              <option value="troubleshooting_fo">🔌 Troubleshooting FO</option>
              <option value="troubleshooting_wireless">📡 Troubleshooting Wireless</option>
            </select>
          </div>

          {/* Common Fields - hanya untuk instalasi */}
          {formData.job_type === 'instalasi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_client"
                  value={formData.nama_client}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {formData.job_type === 'instalasi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tikor ODP/JB
                    </label>
                    <input
                      type="text"
                      name="tikor_odp_jb"
                      value={formData.tikor_odp_jb}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port ODP
                    </label>
                    <input
                      type="text"
                      name="port_odp"
                      value={formData.port_odp}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Redaman (dB)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="redaman"
                      value={formData.redaman}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}

              {formData.job_type === 'troubleshooting_fo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tikor ODP/JB
                    </label>
                    <input
                      type="text"
                      name="tikor_odp_jb"
                      value={formData.tikor_odp_jb}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port ODP
                    </label>
                    <input
                      type="text"
                      name="port_odp"
                      value={formData.port_odp}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Redaman (dB)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="redaman"
                      value={formData.redaman}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}

              {formData.job_type === 'instalasi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teknisi
                    </label>
                    <input
                      type="text"
                      name="field_engineer"
                      value={formData.field_engineer}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal_pekerjaan"
                      value={formData.tanggal_pekerjaan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Type-specific Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.job_type === 'instalasi' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Panjang Kabel
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="panjang_kabel"
                    value={formData.panjang_kabel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}

            {formData.job_type === 'troubleshooting_fo' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="tanggal_fo"
                    value={formData.tanggal_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Client
                  </label>
                  <input
                    type="text"
                    name="nama_client_fo"
                    value={formData.nama_client_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ODP/POP
                  </label>
                  <input
                    type="text"
                    name="odp_pop_fo"
                    value={formData.odp_pop_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suspect
                  </label>
                  <input
                    type="text"
                    name="suspect_fo"
                    value={formData.suspect_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action
                  </label>
                  <input
                    type="text"
                    name="action_fo"
                    value={formData.action_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Petugas FE
                  </label>
                  <input
                    type="text"
                    name="petugas_fe_fo"
                    value={formData.petugas_fe_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jam Datang
                  </label>
                  <input
                    type="time"
                    name="jam_datang_fo"
                    value={formData.jam_datang_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    name="jam_selesai_fo"
                    value={formData.jam_selesai_fo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note
                  </label>
                  <textarea
                    name="note_fo"
                    value={formData.note_fo}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}

            {formData.job_type === 'troubleshooting_wireless' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="tanggal_wireless"
                    value={formData.tanggal_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Client
                  </label>
                  <input
                    type="text"
                    name="nama_client_wireless"
                    value={formData.nama_client_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ODP/POP
                  </label>
                  <input
                    type="text"
                    name="odp_pop_wireless"
                    value={formData.odp_pop_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suspect
                  </label>
                  <input
                    type="text"
                    name="suspect_wireless"
                    value={formData.suspect_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action
                  </label>
                  <input
                    type="text"
                    name="action_wireless"
                    value={formData.action_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Redaman/Signal
                  </label>
                  <input
                    type="text"
                    name="redaman_signal_wireless"
                    value={formData.redaman_signal_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipe Kabel
                  </label>
                  <input
                    type="text"
                    name="tipe_kabel_wireless"
                    value={formData.tipe_kabel_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Petugas FE
                  </label>
                  <input
                    type="text"
                    name="petugas_fe_wireless"
                    value={formData.petugas_fe_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jam Datang
                  </label>
                  <input
                    type="time"
                    name="jam_datang"
                    value={formData.jam_datang}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    name="jam_selesai"
                    value={formData.jam_selesai}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note
                  </label>
                  <textarea
                    name="note_wireless"
                    value={formData.note_wireless}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.job_type === 'instalasi' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Rumah
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_rumah === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_rumah}`}
                          alt="Current foto_rumah"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_rumah && typeof formData.foto_rumah !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_rumah.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Pemasangan
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_pemasangan === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_pemasangan}`}
                          alt="Current foto_pemasangan"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_pemasangan && typeof formData.foto_pemasangan !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_pemasangan.name}</p>
                    )}
                  </div>
                </>
              ) : formData.job_type === 'troubleshooting_wireless' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Before Pengerjaan
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_rumah === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_rumah}`}
                          alt="Current foto_rumah"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_rumah && typeof formData.foto_rumah !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_rumah.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto After Pengerjaan
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_pemasangan === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_pemasangan}`}
                          alt="Current foto_pemasangan"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_pemasangan && typeof formData.foto_pemasangan !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_pemasangan.name}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Rumah
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_rumah === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_rumah}`}
                          alt="Current foto_rumah"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_rumah && typeof formData.foto_rumah !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_rumah.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Pemasangan
                    </label>
                    {/* Show current photo if exists */}
                    {typeof formData.foto_pemasangan === 'string' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">Foto saat ini:</p>
                        <img 
                          src={`http://localhost:8000/storage/${formData.foto_pemasangan}`}
                          alt="Current foto_pemasangan"
                          className="max-w-full h-auto max-h-32 rounded"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.foto_pemasangan && typeof formData.foto_pemasangan !== 'string' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Foto baru dipilih: {formData.foto_pemasangan.name}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {formData.job_type === 'instalasi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/history-jobs')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
