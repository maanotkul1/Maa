import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function CreateHistoryJob() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const KELUHAN_OPTIONS = [
    { value: 'wifi_lambat', label: 'WiFi Lambat' },
    { value: 'sinyal_lemah', label: 'Sinyal Lemah' },
    { value: 'tidak_bisa_connect', label: 'Tidak Bisa Connect' },
    { value: 'disconnect_berulang', label: 'Disconnect Berulang' },
    { value: 'tidak_dapat_ip', label: 'Tidak Dapat IP' },
    { value: 'no_internet_access', label: 'No Internet Access' },
    { value: 'interference_channel', label: 'Interference Channel' },
    { value: 'overload_client', label: 'Overload Client' },
  ];

  const TINDAKAN_OPTIONS = [
    { value: 'restart_device', label: 'Restart Device' },
    { value: 'change_channel', label: 'Change Channel' },
    { value: 'change_channel_width', label: 'Change Channel Width' },
    { value: 'adjust_power', label: 'Adjust Transmit Power' },
    { value: 're_position_ap', label: 'Re-position AP' },
    { value: 'reconfigure_ssid', label: 'Reconfigure SSID' },
    { value: 'firmware_update', label: 'Firmware Update' },
    { value: 'reset_interface', label: 'Reset Wireless Interface' },
    { value: 'penambahan_ap', label: 'Penambahan AP' },
    { value: 'penggantian_perangkat', label: 'Penggantian Perangkat' },
  ];
  const [formData, setFormData] = useState({
    job_type: 'instalasi',
    kategori_job: 'troubleshooting_fo', // New field
    nama_client: '',
    tikor_odp_jb: '',
    port_odp: '',
    redaman: '',
    field_engineer: '',
    tanggal_pekerjaan: new Date().toISOString().split('T')[0],
    // Instalasi fields
    panjang_kabel: '',
    // Troubleshooting FO fields
    detail_action: '',
    tipe_cut: '',
    tikor_cut: '',
    tipe_kabel: '',
    // Wireless Troubleshooting fields
    lokasi_site: '',
    area_ruangan: '',
    teknisi_id: user?.id || '',
    prioritas: 'medium',
    tanggal_waktu_pengerjaan: new Date().toISOString().slice(0, 16),
    jenis_perangkat: 'access_point',
    brand_perangkat: '',
    model_perangkat: '',
    ip_address_perangkat: '',
    ssid: '',
    interface_radio: 'dual_band',
    mac_address: '',
    keluhan_list: [],
    keluhan_detail: '',
    signal_strength_rssi: '',
    channel: '',
    channel_width: '',
    interference: '',
    jumlah_client: '',
    status_dhcp: 'not_checked',
    authentication_issue: '',
    log_error: '',
    ping_latency: '',
    packet_loss: '',
    tindakan_list: [],
    detail_tindakan_wireless: '',
    kondisi_setelah_tindakan: '',
    status_koneksi_wireless: 'unknown',
    status_internet: 'unknown',
    feedback_user: '',
    status_akhir: 'monitoring',
    escalation_reason: '',
    escalated_to: '',
    catatan_teknisi: '',
    rekomendasi_jangka_panjang: '',
    rencana_tindak_lanjut: '',
    keterangan: '',
    foto_rumah: null,
    foto_pemasangan: null,
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


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (fieldName, value) => {
    setFormData((prev) => {
      const currentList = prev[fieldName] || [];
      if (currentList.includes(value)) {
        return { ...prev, [fieldName]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [fieldName]: [...currentList, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // VALIDASI: Check required fields based on job type
      if (!formData.nama_client.trim()) {
        alert('❌ Nama Client harus diisi!');
        setLoading(false);
        return;
      }

      if (formData.job_type === 'instalasi' && !formData.panjang_kabel) {
        alert('❌ Panjang Kabel (meter) harus diisi!');
        setLoading(false);
        return;
      }

      if ((formData.job_type === 'troubleshooting_fo') && !formData.tikor_odp_jb) {
        alert('❌ Tikor ODP JB harus diisi!');
        setLoading(false);
        return;
      }

      // Common fields - ALWAYS SEND
      submitData.append('job_type', formData.job_type);
      submitData.append('nama_client', formData.nama_client);
      submitData.append('field_engineer_1', formData.field_engineer || '');
      submitData.append('tanggal_pekerjaan', formData.tanggal_pekerjaan);
      submitData.append('keterangan', formData.keterangan || '');

      // Handle based on job_type (not kategori_job!)
      if (formData.job_type === 'instalasi') {
        // INSTALASI - Required: panjang_kabel
        submitData.append('panjang_kabel', formData.panjang_kabel);
        submitData.append('tikor_odp_jb', formData.tikor_odp_jb || '');
        submitData.append('port_odp', formData.port_odp || '');
        submitData.append('redaman', formData.redaman || '');
        
      } else if (formData.job_type === 'troubleshooting_fo') {
        // TROUBLESHOOTING FO - Required: tikor_odp_jb
        submitData.append('tikor_odp_jb', formData.tikor_odp_jb);
        submitData.append('port_odp', formData.port_odp || '');
        submitData.append('redaman', formData.redaman || '');
        submitData.append('detail_action', formData.detail_action || '');
        submitData.append('tipe_cut', formData.tipe_cut || '');
        submitData.append('tikor_cut', formData.tikor_cut || '');
        submitData.append('tipe_kabel', formData.tipe_kabel || '');
        
      } else if (formData.job_type === 'troubleshooting_wireless') {
        // TROUBLESHOOTING WIRELESS - Simplified fields
        submitData.append('tikor_odp_jb', formData.tikor_odp_jb || '');
        submitData.append('lokasi_site', formData.lokasi_site || '');
        submitData.append('area_ruangan', formData.area_ruangan || '');
        submitData.append('teknisi_id', formData.teknisi_id || '');
        submitData.append('prioritas', formData.prioritas || 'medium');
        submitData.append('tanggal_waktu_pengerjaan', formData.tanggal_waktu_pengerjaan || '');
        submitData.append('catatan_teknisi', formData.catatan_teknisi || '');
        submitData.append('port_odp', formData.port_odp || '');
        submitData.append('redaman', formData.redaman || '');
        
        // Equipment fields - convert boolean to 1/0
        submitData.append('peralatan_radio', formData.peralatan_radio ? '1' : '0');
        submitData.append('peralatan_kabel', formData.peralatan_kabel ? '1' : '0');
        submitData.append('peralatan_adaptor', formData.peralatan_adaptor ? '1' : '0');
        submitData.append('peralatan_poe', formData.peralatan_poe ? '1' : '0');
        submitData.append('peralatan_rj45', formData.peralatan_rj45 ? '1' : '0');
        submitData.append('peralatan_router_switch', formData.peralatan_router_switch ? '1' : '0');
        submitData.append('peralatan_ap', formData.peralatan_ap ? '1' : '0');
        submitData.append('peralatan_lainnya', formData.peralatan_lainnya ? '1' : '0');
        submitData.append('peralatan_lainnya_keterangan', formData.peralatan_lainnya_keterangan || '');
      }

      // Photos
      if (formData.foto_rumah) {
        submitData.append('foto_rumah', formData.foto_rumah);
      }
      if (formData.foto_pemasangan) {
        submitData.append('foto_pemasangan', formData.foto_pemasangan);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await api.post('/history-jobs', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
        timeout: 30000,
      });

      clearTimeout(timeoutId);

      navigate('/history-jobs');
    } catch (error) {
      console.error('Error creating history job:', error);
      
      if (error.name === 'AbortError') {
        alert('❌ Upload timeout (>30s). Cek koneksi internet atau kurangi ukuran file');
      } else {
        // Extract error details
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || 'Gagal membuat history job';
        const errors = errorData?.errors || {};
        
        // Show specific field errors if available
        if (Object.keys(errors).length > 0) {
          let detailedMessage = '❌ Validation Errors:\n\n';
          Object.entries(errors).forEach(([field, messages]) => {
            detailedMessage += `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}\n`;
          });
          console.error('Validation errors:', errors);
          alert(detailedMessage);
        } else {
          alert(`❌ ${errorMessage}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Tambah History Job
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
            Tambah riwayat pekerjaan Field Engineer
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
              <option value="instalasi">📦 Instalasi</option>
              <option value="troubleshooting_fo">🔌 Troubleshooting FO</option>
              <option value="troubleshooting_wireless">📡 Troubleshooting Wireless</option>
            </select>
          </div>
        
        

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
            ) : formData.job_type === 'troubleshooting_wireless' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama POP <span className="text-red-500">*</span>
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
                    Panjang Kabel (meter) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="panjang_kabel"
                    value={formData.panjang_kabel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          ) : formData.job_type === 'troubleshooting_fo' ? (
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
              {/* DAMAGE SECTION */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Kerusakan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'peralatan_radio', label: 'Radio' },
                    { key: 'peralatan_kabel', label: 'Kabel' },
                    { key: 'peralatan_adaptor', label: 'Adaptor' },
                    { key: 'peralatan_poe', label: 'PoE (Power over Ethernet)' },
                    { key: 'peralatan_rj45', label: 'RJ45' },
                    { key: 'peralatan_router_switch', label: 'Router / Switch' },
                    { key: 'peralatan_ap', label: 'Access Point (AP)' },
                    { key: 'peralatan_lainnya', label: 'Lainnya' },
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
                
                {formData.peralatan_lainnya && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keterangan Kerusakan Lainnya
                    </label>
                    <input
                      type="text"
                      name="peralatan_lainnya_keterangan"
                      value={formData.peralatan_lainnya_keterangan}
                      onChange={handleChange}
                      placeholder="Jelaskan kerusakan lainnya..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
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
              ) : formData.job_type === 'troubleshooting_wireless' ? (
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
              {loading ? 'Menyimpan...' : 'Simpan'}
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

