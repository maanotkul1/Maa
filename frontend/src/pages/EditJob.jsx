import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import MapView from '../components/MapView';

export default function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    odp_id: null,
    tanggal: '',
    kategori: '',
    req_by: '',
    tiket_all_bnet: '',
    id_nama_pop_odp_jb: '',
    tikor: '',
    latitude: '',
    longitude: '',
    detail: '',
    janji_datang: '',
    petugas_1: '',
    petugas_2: '',
    petugas_3: '',
    ba: false,
    status: 'open',
    remarks: '',
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const job = response.data;
      
      const tanggal = job.tanggal ? new Date(job.tanggal).toISOString().split('T')[0] : '';
      let janji_datang = '';
      if (job.janji_datang) {
        if (typeof job.janji_datang === 'string') {
          if (job.janji_datang.match(/^\d{2}:\d{2}$/)) {
            janji_datang = job.janji_datang;
          } else if (job.janji_datang.match(/^\d{2}:\d{2}:\d{2}/)) {
            janji_datang = job.janji_datang.substring(0, 5);
          } else if (job.janji_datang.includes('T') || job.janji_datang.includes(' ')) {
            try {
              const date = new Date(job.janji_datang);
              if (!isNaN(date.getTime())) {
                janji_datang = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              }
            } catch (e) {}
          } else if (job.janji_datang.includes(':')) {
            const timeMatch = job.janji_datang.match(/(\d{2}):(\d{2})/);
            if (timeMatch) janji_datang = `${timeMatch[1]}:${timeMatch[2]}`;
          }
        }
      }

      setFormData({
        odp_id: job.odp_id || null,
        tanggal,
        kategori: job.kategori || '',
        req_by: job.req_by || '',
        tiket_all_bnet: job.tiket_all_bnet || '',
        id_nama_pop_odp_jb: job.id_nama_pop_odp_jb || '',
        tikor: job.tikor || '',
        latitude: job.latitude ? job.latitude.toString() : '',
        longitude: job.longitude ? job.longitude.toString() : '',
        detail: job.detail || '',
        janji_datang,
        petugas_1: job.petugas_1 || '',
        petugas_2: job.petugas_2 || '',
        petugas_3: job.petugas_3 || '',
        ba: job.ba || false,
        status: job.status || 'open',
        remarks: job.remarks || '',
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Failed to load job');
      navigate('/jobs');
    } finally {
      setFetching(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        janji_datang: formData.janji_datang || null,
      };
      await api.put(`/jobs/${id}`, payload);
      navigate('/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert(error.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (lat, lng) => {
    setFormData({ 
      ...formData, 
      latitude: lat.toString(),
      longitude: lng.toString(),
      tikor: `${lat}, ${lng}`
    });
  };

  if (fetching) {
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
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        <div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 flex items-center gap-1 text-sm lg:text-base"
          >
            <span className="material-icons text-lg">arrow_back</span>
            <span>Back to Jobs</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Edit Job</h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Update job information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal *</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Kategori job"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Req By</label>
              <input
                type="text"
                value={formData.req_by}
                onChange={(e) => setFormData({ ...formData, req_by: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Requested by"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiket All BNET</label>
              <input
                type="text"
                value={formData.tiket_all_bnet}
                onChange={(e) => setFormData({ ...formData, tiket_all_bnet: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Nomor tiket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID-Nama/POP/ODP/JB</label>
              <input
                type="text"
                value={formData.id_nama_pop_odp_jb}
                onChange={(e) => setFormData({ ...formData, id_nama_pop_odp_jb: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="ID-Nama/POP/ODP/JB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tikor (Koordinat)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => {
                      const lat = e.target.value;
                      const lng = formData.longitude;
                      setFormData({ 
                        ...formData, 
                        latitude: lat,
                        tikor: (lat && lng) ? `${lat}, ${lng}` : formData.tikor
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => {
                      const lng = e.target.value;
                      const lat = formData.latitude;
                      setFormData({ 
                        ...formData, 
                        longitude: lng,
                        tikor: (lat && lng) ? `${lat}, ${lng}` : formData.tikor
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <MapView
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                height="300px"
                editable={true}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detail</label>
              <textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Janji Datang (Jam)</label>
              <input
                type="time"
                value={formData.janji_datang}
                onChange={(e) => setFormData({ ...formData, janji_datang: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="open">Open</option>
                <option value="waiting">Waiting</option>
                <option value="re-schedule">Re-Schedule</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Petugas 1</label>
              <input
                type="text"
                value={formData.petugas_1}
                onChange={(e) => setFormData({ ...formData, petugas_1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Petugas 2</label>
              <input
                type="text"
                value={formData.petugas_2}
                onChange={(e) => setFormData({ ...formData, petugas_2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Petugas 3</label>
              <input
                type="text"
                value={formData.petugas_3}
                onChange={(e) => setFormData({ ...formData, petugas_3: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ba}
                  onChange={(e) => setFormData({ ...formData, ba: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  BA (Berita Acara) - Sudah Diterima
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">check</span>
                  <span>Update Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
