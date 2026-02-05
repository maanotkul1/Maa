import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

// Input component styles
const INPUT_CLASS = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white';
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

// Input Field Component
function InputField({ label, required = false, ...props }) {
  return (
    <div>
      <label className={LABEL_CLASS}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input {...props} className={INPUT_CLASS} />
    </div>
  );
}

// Textarea Field Component
function TextareaField({ label, required = false, rows = 3, ...props }) {
  return (
    <div>
      <label className={LABEL_CLASS}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea rows={rows} {...props} className={INPUT_CLASS} />
    </div>
  );
}

// Select Field Component
function SelectField({ label, required = false, options, ...props }) {
  return (
    <div>
      <label className={LABEL_CLASS}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select {...props} className={INPUT_CLASS} required={required}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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
    tanggal_fo: new Date().toISOString().split('T')[0],
    nama_client_fo: '',
    odp_pop_fo: '',
    suspect_fo: '',
    action_fo: '',
    petugas_fe_fo: '',
    jam_datang_fo: '',
    jam_selesai_fo: '',
    note_fo: '',
    field_engineer: '',
    tanggal_pekerjaan: new Date().toISOString().split('T')[0],
    tanggal_wireless: new Date().toISOString().split('T')[0],
    foto_rumah: null,
    foto_pemasangan: null,
    keterangan: '',
  });

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

      // Validation based on job type
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
        if (!formData.tanggal_pekerjaan) {
          alert('Tanggal Pekerjaan harus diisi!');
          setLoading(false);
          return;
        }
      } else if (formData.job_type === 'troubleshooting_fo') {
        if (!formData.nama_client_fo?.trim()) {
          alert('Nama Client harus diisi!');
          setLoading(false);
          return;
        }
        if (!formData.tanggal_fo) {
          alert('Tanggal harus diisi!');
          setLoading(false);
          return;
        }
      } else if (formData.job_type === 'troubleshooting_wireless') {
        if (!formData.nama_client_wireless?.trim()) {
          alert('Nama Client harus diisi!');
          setLoading(false);
          return;
        }
        if (!formData.tanggal_wireless) {
          alert('Tanggal harus diisi!');
          setLoading(false);
          return;
        }
      }

      // Add fields based on job type
      submitData.append('job_type', formData.job_type);

      if (formData.job_type === 'instalasi') {
        submitData.append('nama_client', formData.nama_client);
        submitData.append('tanggal_pekerjaan', formData.tanggal_pekerjaan);
        submitData.append('panjang_kabel', formData.panjang_kabel);
        if (formData.tikor_odp_jb) submitData.append('tikor_odp_jb', formData.tikor_odp_jb);
        if (formData.port_odp) submitData.append('port_odp', formData.port_odp);
        if (formData.redaman) submitData.append('redaman', formData.redaman);
        if (formData.field_engineer) submitData.append('field_engineer_1', formData.field_engineer);
        if (formData.keterangan) submitData.append('keterangan', formData.keterangan);
      } else if (formData.job_type === 'troubleshooting_fo') {
        submitData.append('tanggal_fo', formData.tanggal_fo);
        submitData.append('nama_client_fo', formData.nama_client_fo);
        if (formData.odp_pop_fo) submitData.append('odp_pop_fo', formData.odp_pop_fo);
        if (formData.suspect_fo) submitData.append('suspect_fo', formData.suspect_fo);
        if (formData.action_fo) submitData.append('action_fo', formData.action_fo);
        if (formData.petugas_fe_fo) submitData.append('petugas_fe_fo', formData.petugas_fe_fo);
        if (formData.jam_datang_fo) submitData.append('jam_datang_fo', formData.jam_datang_fo);
        if (formData.jam_selesai_fo) submitData.append('jam_selesai_fo', formData.jam_selesai_fo);
        if (formData.note_fo) submitData.append('note_fo', formData.note_fo);
      } else if (formData.job_type === 'troubleshooting_wireless') {
        submitData.append('tanggal_wireless', formData.tanggal_wireless);
        submitData.append('nama_client_wireless', formData.nama_client_wireless);
        if (formData.odp_pop_wireless) submitData.append('odp_pop_wireless', formData.odp_pop_wireless);
        if (formData.suspect_wireless) submitData.append('suspect_wireless', formData.suspect_wireless);
        if (formData.action_wireless) submitData.append('action_wireless', formData.action_wireless);
        if (formData.redaman_signal_wireless) submitData.append('redaman_signal_wireless', formData.redaman_signal_wireless);
        if (formData.tipe_kabel_wireless) submitData.append('tipe_kabel_wireless', formData.tipe_kabel_wireless);
        if (formData.petugas_fe_wireless) submitData.append('petugas_fe_wireless', formData.petugas_fe_wireless);
        if (formData.jam_datang) submitData.append('jam_datang', formData.jam_datang);
        if (formData.jam_selesai) submitData.append('jam_selesai', formData.jam_selesai);
        if (formData.note_wireless) submitData.append('note_wireless', formData.note_wireless);
      }

      // Add photos for all types
      if (formData.foto_rumah) submitData.append('foto_rumah', formData.foto_rumah);
      if (formData.foto_pemasangan) submitData.append('foto_pemasangan', formData.foto_pemasangan);

      const response = await api.post('/history-jobs', submitData);

      alert('Data berhasil disimpan!');
      navigate('/history-jobs');
    } catch (error) {
      console.error('Error:', error);
      let errorMsg = 'Gagal menyimpan data';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors)
          .flat()
          .join('\n');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      alert('Error: ' + errorMsg);
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
          <SelectField
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            label="Tipe Job"
            required
            options={[
              { value: 'instalasi', label: 'Instalasi' },
              { value: 'troubleshooting_fo', label: 'Troubleshooting FO' },
              { value: 'troubleshooting_wireless', label: 'Troubleshooting Wireless' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isTroubleshootingWireless && !isTroubleshootingFo && (
              <InputField
                type="text"
                name="nama_client"
                value={formData.nama_client}
                onChange={handleChange}
                label="Nama Client"
                required
              />
            )}

            {isInstalasi && (
              <>
                <InputField
                  type="text"
                  name="tikor_odp_jb"
                  value={formData.tikor_odp_jb}
                  onChange={handleChange}
                  label="Tikor ODP/JB"
                />
                <InputField
                  type="text"
                  name="port_odp"
                  value={formData.port_odp}
                  onChange={handleChange}
                  label="Port ODP"
                />
                <InputField
                  type="number"
                  step="0.01"
                  name="redaman"
                  value={formData.redaman}
                  onChange={handleChange}
                  label="Redaman"
                />
              </>
            )}

            {isTroubleshootingWireless && (
              <>
                <InputField
                  type="date"
                  name="tanggal_wireless"
                  value={formData.tanggal_wireless}
                  onChange={handleChange}
                  label="Tanggal"
                />
                <InputField
                  type="text"
                  name="nama_client_wireless"
                  value={formData.nama_client_wireless}
                  onChange={handleChange}
                  label="Nama Client"
                />
                <InputField
                  type="text"
                  name="odp_pop_wireless"
                  value={formData.odp_pop_wireless}
                  onChange={handleChange}
                  label="ODP/POP"
                />
                <InputField
                  type="text"
                  name="suspect_wireless"
                  value={formData.suspect_wireless}
                  onChange={handleChange}
                  label="Suspect"
                />
                <InputField
                  type="text"
                  name="action_wireless"
                  value={formData.action_wireless}
                  onChange={handleChange}
                  label="Action"
                />
                <InputField
                  type="text"
                  name="redaman_signal_wireless"
                  value={formData.redaman_signal_wireless}
                  onChange={handleChange}
                  label="Redaman/Signal"
                />
                <InputField
                  type="text"
                  name="tipe_kabel_wireless"
                  value={formData.tipe_kabel_wireless}
                  onChange={handleChange}
                  label="Tipe Kabel"
                />
                <InputField
                  type="text"
                  name="petugas_fe_wireless"
                  value={formData.petugas_fe_wireless}
                  onChange={handleChange}
                  label="Petugas FE"
                />
                <InputField
                  type="time"
                  name="jam_datang"
                  value={formData.jam_datang}
                  onChange={handleChange}
                  label="Jam Datang"
                />
                <InputField
                  type="time"
                  name="jam_selesai"
                  value={formData.jam_selesai}
                  onChange={handleChange}
                  label="Jam Selesai"
                />
                <div className="md:col-span-2">
                  <TextareaField
                    name="note_wireless"
                    value={formData.note_wireless}
                    onChange={handleChange}
                    label="Note"
                    rows={3}
                  />
                </div>
              </>
            )}

            {isInstalasi && (
              <>
                <InputField
                  type="text"
                  name="field_engineer"
                  value={formData.field_engineer}
                  onChange={handleChange}
                  label="Teknisi"
                />
                <InputField
                  type="date"
                  name="tanggal_pekerjaan"
                  value={formData.tanggal_pekerjaan}
                  onChange={handleChange}
                  label="Tanggal Pekerjaan"
                />
              </>
            )}
          </div>

          {isInstalasi && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Instalasi</h3>
              <InputField
                type="number"
                step="0.01"
                name="panjang_kabel"
                value={formData.panjang_kabel}
                onChange={handleChange}
                label="Panjang Kabel (meter)"
              />
            </div>
          )}

          {isTroubleshootingFo && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Troubleshooting FO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField
                  type="date"
                  name="tanggal_fo"
                  value={formData.tanggal_fo}
                  onChange={handleChange}
                  label="Tanggal"
                />
                <InputField
                  type="text"
                  name="nama_client_fo"
                  value={formData.nama_client_fo}
                  onChange={handleChange}
                  label="Nama Client"
                />
                <InputField
                  type="text"
                  name="odp_pop_fo"
                  value={formData.odp_pop_fo}
                  onChange={handleChange}
                  label="ODP/POP"
                />
                <InputField
                  type="text"
                  name="suspect_fo"
                  value={formData.suspect_fo}
                  onChange={handleChange}
                  label="Suspect"
                />
                <InputField
                  type="text"
                  name="action_fo"
                  value={formData.action_fo}
                  onChange={handleChange}
                  label="Action"
                />
                <InputField
                  type="text"
                  name="petugas_fe_fo"
                  value={formData.petugas_fe_fo}
                  onChange={handleChange}
                  label="Petugas FE"
                />
                <InputField
                  type="time"
                  name="jam_datang_fo"
                  value={formData.jam_datang_fo}
                  onChange={handleChange}
                  label="Jam Datang"
                />
                <InputField
                  type="time"
                  name="jam_selesai_fo"
                  value={formData.jam_selesai_fo}
                  onChange={handleChange}
                  label="Jam Selesai"
                />
              </div>
              <TextareaField
                name="note_fo"
                value={formData.note_fo}
                onChange={handleChange}
                label="Note"
                rows={3}
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Foto Rumah</label>
                <input
                  type="file"
                  name="foto_rumah"
                  accept="image/*"
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Foto Pemasangan</label>
                <input
                  type="file"
                  name="foto_pemasangan"
                  accept="image/*"
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {!isTroubleshootingWireless && !isTroubleshootingFo && (
            <TextareaField
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              label="Keterangan"
              rows={4}
            />
          )}

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
