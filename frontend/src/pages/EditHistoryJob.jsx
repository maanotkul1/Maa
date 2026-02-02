import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

const KELUHAN_OPTIONS = [
  { value: 'wifi_lambat', label: '🐢 WiFi Lambat' },
  { value: 'sinyal_lemah', label: '📶 Sinyal Lemah' },
  { value: 'tidak_bisa_connect', label: '❌ Tidak Bisa Connect' },
  { value: 'disconnect_berulang', label: '🔄 Disconnect Berulang' },
  { value: 'tidak_dapat_ip', label: '🔌 Tidak Dapat IP' },
  { value: 'no_internet_access', label: '🌐 No Internet Access' },
  { value: 'interference_channel', label: '📡 Interference/Channel' },
  { value: 'overload_client', label: '👥 Overload Client' },
];

const TINDAKAN_OPTIONS = [
  { value: 'restart_device', label: '🔄 Restart Device' },
  { value: 'change_channel', label: '📊 Change Channel' },
  { value: 'change_channel_width', label: '📏 Change Channel Width' },
  { value: 'adjust_power', label: '⚡ Adjust Power' },
  { value: 're_position_ap', label: '📍 Re-position AP' },
  { value: 'reconfigure_ssid', label: '📝 Reconfigure SSID' },
  { value: 'firmware_update', label: '💾 Firmware Update' },
  { value: 'reset_interface', label: '🔧 Reset Interface' },
  { value: 'penambahan_ap', label: '➕ Penambahan AP' },
  { value: 'penggantian_perangkat', label: '🔄 Penggantian Perangkat' },
];

export default function EditHistoryJob() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_type: 'instalasi',
    kategori_job: 'troubleshooting_fo',
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
    // Wireless Troubleshooting Fields
    lokasi_site: '',
    area_ruangan: '',
    prioritas: 'medium',
    tanggal_waktu_pengerjaan: '',
    jenis_perangkat: 'access_point',
    brand_perangkat: '',
    model_perangkat: '',
    ip_address_perangkat: '',
    ssid: '',
    interface_radio: '2_4ghz',
    mac_address: '',
    keluhan_list: [],
    keluhan_detail: '',
    signal_strength_rssi: '',
    channel: '',
    channel_width: '',
    jumlah_client: '',
    status_dhcp: 'not_checked',
    ping_latency: '',
    packet_loss: '',
    interference: '',
    authentication_issue: '',
    log_error: '',
    tindakan_list: [],
    detail_tindakan_wireless: '',
    status_koneksi_wireless: 'unknown',
    status_internet: 'unknown',
    kondisi_setelah_tindakan: '',
    feedback_user: '',
    status_akhir: 'solved',
    escalation_reason: '',
    escalated_to: '',
    catatan_teknisi: '',
    rekomendasi_jangka_panjang: '',
    rencana_tindak_lanjut: '',
    // Equipment fields for simplified wireless troubleshooting
    peralatan_radio: false,
    peralatan_kabel: false,
    peralatan_adaptor: false,
    peralatan_poe: false,
    peralatan_rj45: false,
    peralatan_router_switch: false,
    peralatan_ap: false,
    peralatan_lainnya: false,
    peralatan_lainnya_keterangan: '',
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
        kategori_job: job.kategori_job || 'troubleshooting_fo',
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
        foto_rumah: null,
        foto_pemasangan: null,
        // Wireless fields
        lokasi_site: job.lokasi_site || '',
        area_ruangan: job.area_ruangan || '',
        prioritas: job.prioritas || 'medium',
        tanggal_waktu_pengerjaan: job.tanggal_waktu_pengerjaan || '',
        jenis_perangkat: job.jenis_perangkat || 'access_point',
        brand_perangkat: job.brand_perangkat || '',
        model_perangkat: job.model_perangkat || '',
        ip_address_perangkat: job.ip_address_perangkat || '',
        ssid: job.ssid || '',
        interface_radio: job.interface_radio || '2_4ghz',
        mac_address: job.mac_address || '',
        keluhan_list: job.keluhan_list ? (Array.isArray(job.keluhan_list) ? job.keluhan_list : JSON.parse(job.keluhan_list)) : [],
        keluhan_detail: job.keluhan_detail || '',
        signal_strength_rssi: job.signal_strength_rssi || '',
        channel: job.channel || '',
        channel_width: job.channel_width || '',
        jumlah_client: job.jumlah_client || '',
        status_dhcp: job.status_dhcp || 'not_checked',
        ping_latency: job.ping_latency || '',
        packet_loss: job.packet_loss || '',
        interference: job.interference || '',
        authentication_issue: job.authentication_issue || '',
        log_error: job.log_error || '',
        tindakan_list: job.tindakan_list ? (Array.isArray(job.tindakan_list) ? job.tindakan_list : JSON.parse(job.tindakan_list)) : [],
        detail_tindakan_wireless: job.detail_tindakan_wireless || '',
        status_koneksi_wireless: job.status_koneksi_wireless || 'unknown',
        status_internet: job.status_internet || 'unknown',
        kondisi_setelah_tindakan: job.kondisi_setelah_tindakan || '',
        feedback_user: job.feedback_user || '',
        status_akhir: job.status_akhir || 'solved',
        escalation_reason: job.escalation_reason || '',
        escalated_to: job.escalated_to || '',
        catatan_teknisi: job.catatan_teknisi || '',
        rekomendasi_jangka_panjang: job.rekomendasi_jangka_panjang || '',
        rencana_tindak_lanjut: job.rencana_tindak_lanjut || '',
        // Equipment fields
        peralatan_radio: job.peralatan_radio ? true : false,
        peralatan_kabel: job.peralatan_kabel ? true : false,
        peralatan_adaptor: job.peralatan_adaptor ? true : false,
        peralatan_poe: job.peralatan_poe ? true : false,
        peralatan_rj45: job.peralatan_rj45 ? true : false,
        peralatan_router_switch: job.peralatan_router_switch ? true : false,
        peralatan_ap: job.peralatan_ap ? true : false,
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Gagal memuat data job');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append('job_type', formData.job_type);
      submitData.append('kategori_job', formData.kategori_job || '');
      submitData.append('nama_client', formData.nama_client);
      submitData.append('field_engineer_1', formData.field_engineer || '');
      submitData.append('tanggal_pekerjaan', formData.tanggal_pekerjaan);
      if (formData.keterangan) submitData.append('keterangan', formData.keterangan);

      // Conditional fields based on job type and category
      if (formData.job_type === 'instalasi' || 
          (formData.job_type === 'troubleshooting' && formData.kategori_job === 'troubleshooting_fo')) {
        // For Instalasi and Troubleshooting FO
        submitData.append('tikor_odp_jb', formData.tikor_odp_jb || '');
        submitData.append('port_odp', formData.port_odp || '');
        if (formData.redaman) submitData.append('redaman', formData.redaman);
      } else {
        // For Troubleshooting Wireless
        if (formData.port_odp) submitData.append('port_odp', formData.port_odp); // POP is optional
        if (formData.redaman) submitData.append('redaman', formData.redaman); // Signal is optional
      }

      if (formData.job_type === 'instalasi') {
        if (formData.panjang_kabel) submitData.append('panjang_kabel', formData.panjang_kabel);
      } else if (formData.job_type === 'troubleshooting') {
        if (formData.kategori_job === 'troubleshooting_fo') {
          if (formData.detail_action) submitData.append('detail_action', formData.detail_action);
          if (formData.tipe_cut) submitData.append('tipe_cut', formData.tipe_cut);
          if (formData.tikor_cut) submitData.append('tikor_cut', formData.tikor_cut);
          if (formData.tipe_kabel) submitData.append('tipe_kabel', formData.tipe_kabel);
        } else {
          // Wireless troubleshooting (simplified)
          submitData.append('lokasi_site', formData.lokasi_site || '');
          submitData.append('area_ruangan', formData.area_ruangan || '');
          submitData.append('prioritas', formData.prioritas || 'medium');
          submitData.append('tanggal_waktu_pengerjaan', formData.tanggal_waktu_pengerjaan || '');
          submitData.append('catatan_teknisi', formData.catatan_teknisi || '');
          
          // Equipment fields
          submitData.append('peralatan_radio', formData.peralatan_radio ? '1' : '0');
          submitData.append('peralatan_kabel', formData.peralatan_kabel ? '1' : '0');
          submitData.append('peralatan_adaptor', formData.peralatan_adaptor ? '1' : '0');
          submitData.append('peralatan_poe', formData.peralatan_poe ? '1' : '0');
          submitData.append('peralatan_rj45', formData.peralatan_rj45 ? '1' : '0');
          submitData.append('peralatan_router_switch', formData.peralatan_router_switch ? '1' : '0');
          submitData.append('peralatan_ap', formData.peralatan_ap ? '1' : '0');
          submitData.append('peralatan_lainnya', formData.peralatan_lainnya ? '1' : '0');
          if (formData.peralatan_lainnya_keterangan) {
            submitData.append('peralatan_lainnya_keterangan', formData.peralatan_lainnya_keterangan);
          }
        }
      }

      if (formData.foto_rumah && typeof formData.foto_rumah !== 'string') submitData.append('foto_rumah', formData.foto_rumah);
      if (formData.foto_pemasangan && typeof formData.foto_pemasangan !== 'string') submitData.append('foto_pemasangan', formData.foto_pemasangan);

      await api.put(`/history-jobs/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
              <option value="instalasi">Instalasi</option>
              <option value="troubleshooting">Troubleshooting</option>
            </select>
          </div>

          {/* Kategori Job - Troubleshooting */}
          {formData.job_type === 'troubleshooting' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori Troubleshooting <span className="text-red-500">*</span>
              </label>
              <select
                name="kategori_job"
                value={formData.kategori_job}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="troubleshooting_fo">🔌 Troubleshooting FO</option>
                <option value="troubleshooting_wireless">📡 Troubleshooting Wireless</option>
              </select>
            </div>
          )}

          {/* Common Fields */}
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

            {formData.job_type === 'instalasi' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tikor ODP/JB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tikor_odp_jb"
                    value={formData.tikor_odp_jb}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port ODP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="port_odp"
                    value={formData.port_odp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
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
            ) : formData.kategori_job === 'troubleshooting_fo' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    POP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="port_odp"
                    value={formData.port_odp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signal
                  </label>
                  <input
                    type="text"
                    name="redaman"
                    value={formData.redaman}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    POP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tikor_odp_jb"
                    value={formData.tikor_odp_jb}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port ODP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="port_odp"
                    value={formData.port_odp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teknisi
              </label>
              <input
                type="text"
                name="field_engineer"
                value={formData.field_engineer}
                onChange={handleChange}
                placeholder="Nama Teknisi"
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
          </div>

          {/* Type-specific Fields */}
          {formData.job_type === 'instalasi' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Instalasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Panjang Kabel (meter)
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
              </div>
            </div>
          ) : formData.kategori_job === 'troubleshooting_fo' ? (
            // Troubleshooting FO Form
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Troubleshooting FO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detail Action
                  </label>
                  <textarea
                    name="detail_action"
                    value={formData.detail_action}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipe Cut
                  </label>
                  <input
                    type="text"
                    name="tipe_cut"
                    value={formData.tipe_cut}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tikor Cut
                  </label>
                  <input
                    type="text"
                    name="tikor_cut"
                    value={formData.tikor_cut}
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
                    name="tipe_kabel"
                    value={formData.tipe_kabel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Troubleshooting Wireless - Simplified Form
            <div className="space-y-6">
              {/* EQUIPMENT SECTION */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Peralatan Yang Digunakan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'peralatan_radio', label: 'Radio' },
                    { key: 'peralatan_kabel', label: 'Kabel' },
                    { key: 'peralatan_adaptor', label: 'Adaptor' },
                    { key: 'peralatan_poe', label: 'PoE (Power over Ethernet)' },
                    { key: 'peralatan_rj45', label: 'RJ45' },
                    { key: 'peralatan_router_switch', label: 'Router / Switch' },
                    { key: 'peralatan_ap', label: 'Access Point (AP)' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <input 
                        type="checkbox" 
                        checked={formData[item.key]} 
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CATATAN SECTION */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Catatan Pekerjaan</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan Teknisi</label>
                  <textarea 
                    name="catatan_teknisi" 
                    value={formData.catatan_teknisi} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Tulis catatan hasil pekerjaan dan kondisi di lapangan..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </div>
            </div>
          )}

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
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Pemasangan
                    </label>
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              ) : formData.kategori_job === 'troubleshooting_wireless' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Before Pengerjaan
                    </label>
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto After Pengerjaan
                    </label>
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Rumah
                    </label>
                    <input
                      type="file"
                      name="foto_rumah"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Pemasangan
                    </label>
                    <input
                      type="file"
                      name="foto_pemasangan"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Keterangan */}
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
