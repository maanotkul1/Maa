import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import api from '../utils/api';

export default function JobTrash() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs-trash');
      setJobs(response.data.data || []);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    if (!confirm('Restore job ini?')) return;
    try {
      await api.post(`/jobs/${id}/restore`);
      fetchTrash();
    } catch (err) {
      alert('Gagal restore job');
    }
  };

  const handleForceDelete = async (id) => {
    if (!confirm('Hapus permanen job ini? Data tidak bisa dikembalikan!')) return;
    try {
      await api.delete(`/jobs/${id}/force`);
      fetchTrash();
    } catch (err) {
      alert('Gagal menghapus job');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-icons animate-spin text-4xl text-blue-500">refresh</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Job (Trash)</h1>
        <Link
          to="/jobs"
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          <span className="material-icons text-sm">arrow_back</span>
          Kembali
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <span className="material-icons text-6xl mb-4">delete_outline</span>
          <p>Tidak ada job di trash</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dihapus</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{job.no}</td>
                    <td className="px-4 py-3 text-sm">{job.tanggal}</td>
                    <td className="px-4 py-3 text-sm">{job.kategori}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{job.detail}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(job.deleted_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          title="Lihat Detail"
                        >
                          <span className="material-icons text-sm">visibility</span>
                          View
                        </Link>
                        <button
                          onClick={() => handleRestore(job.id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800"
                          title="Restore"
                        >
                          <span className="material-icons text-sm">restore</span>
                          Restore
                        </button>
                        <button
                          onClick={() => handleForceDelete(job.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          title="Hapus Permanen"
                        >
                          <span className="material-icons text-sm">delete_forever</span>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

