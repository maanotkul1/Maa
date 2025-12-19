import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import MapView from '../components/MapView';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [odpStats, setOdpStats] = useState(null);
  const [odps, setOdps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    if (isAdmin) {
      fetchOdpStats();
      fetchOdps();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const endpoint = isAdmin ? '/dashboard/admin' : '/dashboard/fe';
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOdpStats = async () => {
    try {
      const response = await api.get('/odps/statistics');
      setOdpStats(response.data.data);
    } catch (error) {
      console.error('Error fetching ODP stats:', error);
    }
  };

  const fetchOdps = async () => {
    try {
      const response = await api.get('/odps?status=active');
      setOdps(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ODPs:', error);
    }
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

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <SummaryCard
            title="Total Hari Ini"
            value={summary.total_jobs_today || 0}
            icon="work"
            color="blue"
          />
          <SummaryCard
            title="Done"
            value={summary.jobs_done || 0}
            icon="check_circle"
            color="green"
          />
          <SummaryCard
            title="Open"
            value={summary.jobs_open || 0}
            icon="folder_open"
            color="gray"
          />
          <SummaryCard
            title="Waiting"
            value={summary.jobs_waiting || 0}
            icon="hourglass_empty"
            color="yellow"
          />
          <SummaryCard
            title="Re-schedule"
            value={summary.jobs_reschedule || 0}
            icon="event_repeat"
            color="red"
          />
        </div>

        {/* ODP Statistics - Admin Only */}
        {isAdmin && odpStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total ODP</p>
                  <p className="text-2xl font-bold">{odpStats.total || 0}</p>
                </div>
                <span className="material-icons text-3xl opacity-80">location_on</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">ODP Active</p>
                  <p className="text-2xl font-bold">{odpStats.active || 0}</p>
                </div>
                <span className="material-icons text-3xl opacity-80">check_circle</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Maintenance</p>
                  <p className="text-2xl font-bold">{odpStats.maintenance || 0}</p>
                </div>
                <span className="material-icons text-3xl opacity-80">build</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">ODP dengan Job Aktif</p>
                  <p className="text-2xl font-bold">{odpStats.with_active_jobs || 0}</p>
                </div>
                <span className="material-icons text-3xl opacity-80">work</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Jobs by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(charts.jobs_by_status || {}).map(([status, count]) => ({
                      name: status.replace('_', ' ').toUpperCase(),
                      value: count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(charts.jobs_by_status || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Jobs by Field Engineer</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.jobs_by_fe || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ODP Map - Admin Only */}
        {isAdmin && odps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <span className="material-icons text-purple-600">map</span>
              Peta Lokasi ODP
            </h2>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapView
                latitude={odps[0]?.latitude || -6.2}
                longitude={odps[0]?.longitude || 106.8}
                markers={odps.map(odp => ({
                  lat: parseFloat(odp.latitude),
                  lng: parseFloat(odp.longitude),
                  popup: `<b>${odp.kode_odp}</b><br/>${odp.nama_odp}<br/>${odp.jobs_count || 0} Jobs`
                }))}
                zoom={11}
                height="400px"
              />
            </div>
          </div>
        )}

        {/* Recent Jobs / Today's Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold mb-4 dark:text-white">
            {isAdmin ? 'Recent Jobs' : "Today's Jobs"}
          </h2>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {(isAdmin ? data?.recent_jobs : data?.today_jobs)?.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">No jobs</p>
            ) : (
              (isAdmin ? data?.recent_jobs : data?.today_jobs)?.map((job) => (
                <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400">No. {job.no}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{job.kategori || job.title || '-'}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    {isAdmin && <span>Petugas: {job.petugas_1 || '-'}</span>}
                    <span>{job.tanggal ? new Date(job.tanggal).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Kategori</th>
                  {isAdmin && <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Petugas</th>}
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {(isAdmin ? data?.recent_jobs : data?.today_jobs)?.map((job) => (
                  <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-mono text-sm dark:text-gray-300">{job.no}</td>
                    <td className="py-3 px-4 dark:text-white">{job.kategori || job.title || '-'}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 dark:text-gray-300">{job.petugas_1 || '-'}</td>
                    )}
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {job.tanggal ? new Date(job.tanggal).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <span className="material-icons text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    open: { label: 'Open', color: 'bg-gray-100 text-gray-700' },
    waiting: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-700' },
    done: { label: 'Done', color: 'bg-green-100 text-green-700' },
    're-schedule': { label: 'Re-schedule', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

