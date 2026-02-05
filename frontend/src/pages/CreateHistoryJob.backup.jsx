import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function CreateHistoryJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_type: 'instalasi',
    nama_client: '',
    tikor_odp_jb: '',
    port_odp: '',
    redaman: '',
    panjang_kabel: '',
    detail_action: '',
    tipe_cut: '',
    tikor_cut: '',
    tipe_kabel: '',
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
    field_engineer: '',
    tanggal_pekerjaan: new Date().toISOString().split('T')[0],
    tanggal_wireless: new Date().toISOString().split('T')[0],
    foto_rumah: null,
    foto_pemasangan: null,
    keterangan: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
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

      // Basic validations
      if (formData.job_type === 'instalasi') {
        if (!formData.nama_client?.trim()) {
          alert('Nama Client harus diisi!');
          setLoading(false);
          return;
        }
        if (!formData.panjang_kabel) {
          alert('Panjang Kabel harus diisi!');
          setLoading(false);
          return;
        }
      }

      // Add all fields to FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await api.post('/history-jobs', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/history-jobs');
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan data';
      alert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isInstalasi = formData.job_type === 'instalasi';
  const isTroubleshootingFo = formData.job_type === 'troubleshooting_fo';
  const isTroubleshootingWireless = formData.job_type === 'troubleshooting_wireless';

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
          {/* Job Type Selection */}
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
            {!isTroubleshootingWireless && (
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
            )}

            {isInstalasi && (
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

            {isTroubleshootingFo && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detail Action
                </label>
                <textarea
                  name="detail_action"
                  value={formData.detail_action}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {isTroubleshootingWireless && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_wireless"
                    value={formData.tanggal_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_client_wireless"
                    value={formData.nama_client_wireless}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
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
              </>
            )}

            {!isTroubleshootingWireless && (
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

          {/* Type Specific Section */}
          {isInstalasi && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Instalasi</h3>
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
          )}

          {isTroubleshootingFo && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Troubleshooting FO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          )}

          {isTroubleshootingWireless && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Troubleshooting Wireless</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}

          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Foto {isTroubleshootingWireless ? 'Before' : 'Rumah'}
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
                  Foto {isTroubleshootingWireless ? 'After' : 'Pemasangan'}
                </label>
                <input
                  type="file"
                  name="foto_pemasangan"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {!isTroubleshootingWireless && (
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

          {/* Buttons */}
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
