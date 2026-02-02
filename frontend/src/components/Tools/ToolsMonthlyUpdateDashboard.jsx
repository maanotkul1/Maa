import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ToolsMonthlyUpdateDashboard() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, ready, waiting

  useEffect(() => {
    fetchMonthlyUpdateStatus();
  }, []);

  const fetchMonthlyUpdateStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tool-data/monthly-update-status');
      setTools(response.data.data);
    } catch (error) {
      console.error('Error fetching monthly update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTools = () => {
    if (filterStatus === 'all') return tools;
    return tools.filter(tool => tool.status === filterStatus);
  };

  const getStatusBadge = (status) => {
    return status === 'ready_for_update'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  const getProgressColor = (canUpdate) => {
    return canUpdate ? 'bg-green-500' : 'bg-yellow-500';
  };

  const filteredTools = getFilteredTools();
  const readyCount = tools.filter(t => t.can_update).length;
  const totalCount = tools.length;

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Monthly Update Dashboard</h3>
        <button
          onClick={fetchMonthlyUpdateStatus}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-gray-600 text-sm font-semibold">Total Tools</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalCount}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-gray-600 text-sm font-semibold">Siap Update</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {readyCount}
            <span className="text-lg"> / {totalCount}</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(readyCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <p className="text-gray-600 text-sm font-semibold">Menunggu</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {totalCount - readyCount}
            <span className="text-lg"> / {totalCount}</span>
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 border-b pb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterStatus === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          onClick={() => setFilterStatus('ready_for_update')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterStatus === 'ready_for_update'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Siap Update ({readyCount})
        </button>
        <button
          onClick={() => setFilterStatus('waiting')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterStatus === 'waiting'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Menunggu ({totalCount - readyCount})
        </button>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        {filteredTools.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Tidak ada tools</p>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{tool.nama_tools}</h4>
                  <p className="text-sm text-gray-600">{tool.kategori_tools}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                    tool.status
                  )}`}
                >
                  {tool.status === 'ready_for_update' ? 'Siap Update' : 'Menunggu'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Update Terakhir</p>
                  <p className="text-sm font-semibold text-gray-800">{tool.last_update}</p>
                </div>

                {!tool.can_update && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Sisa Hari</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-amber-600">
                        {tool.days_remaining} hari
                      </p>
                      <div className="flex-1 bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(0, Math.min(100, (30 - tool.days_remaining) / 30 * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  {tool.has_qr ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      QR Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      No QR
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
