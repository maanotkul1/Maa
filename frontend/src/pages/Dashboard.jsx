import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { shortenCode } from '../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardRes = await api.get('/dashboard/admin');
      setData(dashboardRes.data);
      // Don't fetch separate tool-data/statistics - use data from dashboard instead
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData, refreshKey]);

  // Listen for auth changes to refresh dashboard
  useEffect(() => {
    const handleAuthUpdate = () => {
      if (user?.id) {
        fetchDashboardData();
      }
    };

    window.addEventListener('authUserUpdated', handleAuthUpdate);
    return () => window.removeEventListener('authUserUpdated', handleAuthUpdate);
  }, [user?.id, fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  // Helper function to get job type label and color
  const getJobTypeLabel = (jobType) => {
    const types = {
      instalasi: { label: 'Instalasi', color: 'purple' },
      troubleshooting_fo: { label: 'Troubleshooting FO', color: 'cyan' },
      troubleshooting_wireless: { label: 'Troubleshooting Wireless', color: 'indigo' },
    };
    return types[jobType] || { label: jobType, color: 'gray' };
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[color] || colors.gray;
  };

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  // Get tools summary directly from dashboard summary
  const toolsSummary = {
    total_tools: summary.total_tools || 0,
    tools_baik: summary.tools_baik || 0,
    tools_rusak: summary.tools_rusak || 0,
    tools_perlu_perbaikan: summary.tools_perlu_perbaikan || 0,
    tools_hilang: summary.tools_hilang || 0,
    tools_assigned: summary.tools_assigned || 0,
  };

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
            title="Refresh dashboard data"
          >
            <span className="material-icons text-base">refresh</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* History Jobs Summary Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">History Job FE</h2>
            <Link
              to="/history-jobs"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium whitespace-nowrap ml-2"
            >
              Kelola →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-6">
            <SummaryCard
              title="Total Semua"
              value={summary.total_history_jobs || 0}
              icon="history"
              color="blue"
              to="/history-jobs"
            />
            <SummaryCard
              title="Completed"
              value={summary.history_jobs_completed || 0}
              percentage={data?.percentages?.history_jobs?.completed}
              icon="check_circle"
              color="green"
              to="/history-jobs"
            />
            <SummaryCard
              title="Instalasi"
              value={summary.history_jobs_instalasi || 0}
              percentage={data?.percentages?.history_jobs?.instalasi}
              icon="build"
              color="purple"
              to="/history-jobs"
            />
            <SummaryCard
              title="Troubleshooting FO"
              value={summary.history_jobs_fo || 0}
              percentage={data?.percentages?.history_jobs?.fo}
              icon="person"
              color="cyan"
              to="/history-jobs"
            />
            <SummaryCard
              title="Troubleshooting Wireless"
              value={summary.history_jobs_wireless || 0}
              percentage={data?.percentages?.history_jobs?.wireless}
              icon="wifi_outlined"
              color="indigo"
              to="/history-jobs"
            />
          </div>
        </div>

        {/* Tools Data Management Summary Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">Tools Data Management</h2>
            <Link
              to="/tools-data"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium whitespace-nowrap ml-2"
            >
              Kelola →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-6">
            <SummaryCard
              title="Total Tools"
              value={toolsSummary.total_tools}
              icon="apps"
              color="blue"
              to="/tools-data"
            />
            <SummaryCard
              title="Baik"
              value={toolsSummary.tools_baik}
              percentage={toolsSummary.total_tools > 0 ? Math.round((toolsSummary.tools_baik / toolsSummary.total_tools) * 100) : 0}
              icon="check_circle"
              color="green"
              to="/tools-data"
            />
            <SummaryCard
              title="Rusak"
              value={toolsSummary.tools_rusak}
              percentage={toolsSummary.total_tools > 0 ? Math.round((toolsSummary.tools_rusak / toolsSummary.total_tools) * 100) : 0}
              icon="error"
              color="red"
              to="/tools-data"
            />
            <SummaryCard
              title="Maintenance"
              value={toolsSummary.tools_perlu_perbaikan}
              percentage={toolsSummary.total_tools > 0 ? Math.round((toolsSummary.tools_perlu_perbaikan / toolsSummary.total_tools) * 100) : 0}
              icon="build"
              color="yellow"
              to="/tools-data"
            />
            <SummaryCard
              title="Hilang"
              value={toolsSummary.tools_hilang}
              percentage={toolsSummary.total_tools > 0 ? Math.round((toolsSummary.tools_hilang / toolsSummary.total_tools) * 100) : 0}
              icon="warning"
              color="gray"
              to="/tools-data"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">History Jobs by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(charts.history_jobs_by_status || {}).map(([status, count]) => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
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
                  {Object.entries(charts.history_jobs_by_status || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">History Jobs by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(charts.history_jobs_by_type || {}).map(([type, count]) => {
                    let label = type;
                    if (type === 'instalasi') label = 'Instalasi';
                    else if (type === 'troubleshooting_fo') label = 'Troubleshooting FO';
                    else if (type === 'troubleshooting_wireless') label = 'Troubleshooting Wireless';
                    return { name: label, value: count };
                  })}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(charts.history_jobs_by_type || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {summary.total_tools > 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Tools by Kondisi</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(charts.tools_by_kondisi || {}).map(([kondisi, count]) => ({
                  name: kondisi === 'baik' ? 'Baik' : kondisi === 'rusak' ? 'Rusak' : kondisi === 'perlu_perbaikan' ? 'Perlu Perbaikan' : 'Hilang',
                  count: count,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-center h-96">
              <p className="text-gray-600 dark:text-gray-400">Belum ada data tools</p>
            </div>
          )}
        </div>

        {/* Recent History Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold dark:text-white">Recent History Jobs</h2>
            <Link
              to="/history-jobs"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {data?.recent_history_jobs?.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">No history jobs</p>
            ) : (
              data?.recent_history_jobs?.map((job) => {
                const jobTypeInfo = getJobTypeLabel(job.job_type);
                return (
                  <Link key={job.id} to={`/history-jobs/${job.id}`}>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400" title={job.job_number}>
                          {shortenCode(job.job_number)}
                        </p>
                        <StatusBadge status={job.status} />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{job.nama_client || '-'}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded font-semibold ${getColorClass(jobTypeInfo.color)}`}>
                          {jobTypeInfo.label}
                        </span>
                        <span>{job.tanggal_pekerjaan ? new Date(job.tanggal_pekerjaan).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Job Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Nama Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Tipe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_history_jobs?.map((job) => {
                  const jobTypeInfo = getJobTypeLabel(job.job_type);
                  return (
                    <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-mono text-sm dark:text-gray-300">
                        <Link to={`/history-jobs/${job.id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          <span title={job.job_number}>{shortenCode(job.job_number)}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 dark:text-white">{job.nama_client || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getColorClass(jobTypeInfo.color)}`}>
                          {jobTypeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {job.tanggal_pekerjaan ? new Date(job.tanggal_pekerjaan).toLocaleDateString('id-ID') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SummaryCard({ title, value, icon, color, to, percentage }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
  };

  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm block ${
        to ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {percentage !== undefined && percentage !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{percentage}%</p>
          )}
        </div>
        <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <span className="material-icons text-lg sm:text-2xl">{icon}</span>
        </div>
      </div>
    </Wrapper>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  };

  const config = statusConfig[status] || statusConfig.completed;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
