import { useEffect, useState } from 'react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function Jobs() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  // Hide columns after "Detail" by default
  const [hiddenColumns, setHiddenColumns] = useState(new Set([
    'janji_datang',
    'petugas_1',
    'petugas_2',
    'petugas_3',
    'ba',
    'status',
    'remarks'
  ]));
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Define all columns
  const allColumns = [
    { key: 'no', label: 'No', width: '60px' },
    { key: 'tanggal', label: 'Tanggal', width: '100px' },
    { key: 'kategori', label: 'Kategori', width: '120px' },
    { key: 'req_by', label: 'Req By', width: '100px' },
    { key: 'tiket_all_bnet', label: 'Tiket All BNET', width: '130px' },
    { key: 'id_nama_pop_odp_jb', label: 'ID-Nama/POP/ODP/JB', width: '180px' },
    { key: 'tikor', label: 'Tikor', width: '150px' },
    { key: 'detail', label: 'Detail', width: '200px' },
    { key: 'janji_datang', label: 'Janji Datang', width: '120px' },
    { key: 'petugas_1', label: 'Petugas 1', width: '120px' },
    { key: 'petugas_2', label: 'Petugas 2', width: '120px' },
    { key: 'petugas_3', label: 'Petugas 3', width: '120px' },
    { key: 'ba', label: 'BA', width: '80px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'remarks', label: 'Remarks', width: '150px' },
  ];

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (columnKey) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    if (typeof time === 'string' && time.includes(':')) {
      return time.substring(0, 5); // HH:mm
    }
    return time;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group jobs by date (based on tanggal field - creation date)
  const groupJobsByDate = (jobs) => {
    const grouped = {};
    jobs.forEach((job) => {
      // Use tanggal field as the grouping key (this is the date when job was created/scheduled)
      const dateKey = job.tanggal ? formatDate(job.tanggal) : 'No Date';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(job);
    });
    
    // Sort jobs within each date group by 'no' ascending (1, 2, 3, ...)
    // If no is the same, sort by created_at then id to ensure consistent ordering
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        // Parse no as integer, handle string, number, and null cases
        let noA = 0;
        let noB = 0;
        
        if (a.no !== null && a.no !== undefined && a.no !== '') {
          noA = typeof a.no === 'number' ? a.no : parseInt(String(a.no).replace(/\D/g, ''), 10) || 0;
        }
        
        if (b.no !== null && b.no !== undefined && b.no !== '') {
          noB = typeof b.no === 'number' ? b.no : parseInt(String(b.no).replace(/\D/g, ''), 10) || 0;
        }
        
        // If no is different, sort by no
        if (noA !== noB) {
          return noA - noB;
        }
        
        // If no is the same, sort by created_at (older first)
        if (a.created_at && b.created_at) {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
          }
        }
        
        // If still same, sort by id (older first)
        return (a.id || 0) - (b.id || 0);
      });
    });
    
    // Sort dates in descending order (newest first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateB - dateA;
    });
    
    const sortedGrouped = {};
    sortedKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });
    
    return sortedGrouped;
  };

  const groupedJobs = groupJobsByDate(jobs);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col.key));

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Job Management' : 'My Jobs'}
            </h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Manage and track field engineer jobs</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Link
                to="/jobs-trash"
                className="bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <span className="material-icons text-lg">delete_outline</span>
                <span>Riwayat</span>
              </Link>
              <Link
                to="/jobs/new"
                className="bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                <span className="material-icons text-lg">add</span>
                <span>Create Job</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search jobs..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="waiting">Waiting</option>
                <option value="re-schedule">Re-Schedule</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Jobs - Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
              No jobs found
            </div>
          ) : (
            Object.keys(groupedJobs).map((dateKey) => (
              <React.Fragment key={`mobile-group-${dateKey}`}>
                {/* Date Header for Mobile */}
                <div className="bg-gray-600 dark:bg-gray-700 rounded-xl p-3">
                  <h3 className="font-semibold text-white text-sm">{dateKey}</h3>
                </div>
                {groupedJobs[dateKey].map((job, index) => (
                  <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">No: {index + 1}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.kategori || 'Job'}</h3>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                <div className="space-y-2 text-sm">
                  {job.tanggal && (
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-lg">calendar_today</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(job.tanggal).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {job.req_by && (
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-lg">person</span>
                      <span className="text-gray-600">Req By: {job.req_by}</span>
                    </div>
                  )}
                  {job.tikor && (
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-gray-400 text-lg mt-0.5">location_on</span>
                      <span className="text-gray-600 line-clamp-2">{job.tikor}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-icons text-lg">visibility</span>
                    <span>View</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    </>
                  )}
                </div>
                  </div>
                ))}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Jobs - Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Job List</h2>
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
              >
                <span className="material-icons text-lg">view_column</span>
                <span>Columns</span>
              </button>
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-2 min-w-[200px] max-h-96 overflow-y-auto">
                  {allColumns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-50 dark:bg-gray-700">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap"
                      style={{ minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap sticky right-0 bg-yellow-50 dark:bg-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  Object.keys(groupedJobs).map((dateKey) => (
                    <React.Fragment key={`group-${dateKey}`}>
                      <tr className="bg-gray-600 dark:bg-gray-700">
                        {visibleColumns.map((col, index) => {
                          const tanggalIndex = visibleColumns.findIndex(c => c.key === 'tanggal');
                          if (index < tanggalIndex) {
                            return <td key={col.key} className="bg-gray-600 dark:bg-gray-700"></td>;
                          }
                          if (col.key === 'tanggal') {
                            const remainingCols = visibleColumns.length - tanggalIndex + 1; // +1 for Actions column
                            return (
                              <td key={col.key} colSpan={remainingCols} className="py-2 px-4 font-semibold text-white text-sm bg-gray-600 dark:bg-gray-700">
                                {dateKey}
                              </td>
                            );
                          }
                          return null;
                        })}
                      </tr>
                      {groupedJobs[dateKey].map((job, index) => (
                        <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          {visibleColumns.map((col) => (
                            <td key={col.key} className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {col.key === 'no' && (index + 1)}
                              {col.key === 'tanggal' && (job.tanggal ? formatDate(job.tanggal) : '-')}
                              {col.key === 'kategori' && (job.kategori || '-')}
                              {col.key === 'req_by' && (job.req_by || '-')}
                              {col.key === 'tiket_all_bnet' && (job.tiket_all_bnet || '-')}
                              {col.key === 'id_nama_pop_odp_jb' && (job.id_nama_pop_odp_jb || '-')}
                              {col.key === 'tikor' && (job.tikor || '-')}
                              {col.key === 'detail' && (
                                <div className="max-w-xs truncate" title={job.detail}>
                                  {job.detail || '-'}
                                </div>
                              )}
                              {col.key === 'janji_datang' && formatTime(job.janji_datang)}
                              {col.key === 'petugas_1' && (job.petugas_1 || '-')}
                              {col.key === 'petugas_2' && (job.petugas_2 || '-')}
                              {col.key === 'petugas_3' && (job.petugas_3 || '-')}
                              {col.key === 'ba' && (
                                job.ba ? (
                                  <span className="inline-flex items-center gap-1 text-green-600">
                                    <span className="material-icons text-sm">check_circle</span>
                                    <span>Yes</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-400">No</span>
                                )
                              )}
                              {col.key === 'status' && <StatusBadge status={job.status} />}
                              {col.key === 'remarks' && (
                                <div className="max-w-xs truncate" title={job.remarks}>
                                  {job.remarks || '-'}
                                </div>
                              )}
                            </td>
                          ))}
                          <td className="py-3 px-4 sticky right-0 bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/jobs/${job.id}`}
                                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                title="View"
                              >
                                <span className="material-icons text-sm">visibility</span>
                              </Link>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    title="Edit"
                                  >
                                    <span className="material-icons text-sm">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(job.id)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                                    title="Delete"
                                  >
                                    <span className="material-icons text-sm">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    open: { label: 'Open', color: 'bg-gray-100 text-gray-700' },
    waiting: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-700' },
    're-schedule': { label: 'Re-Schedule', color: 'bg-orange-100 text-orange-700' },
    done: { label: 'Done', color: 'bg-green-100 text-green-700' },
    assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
    on_progress: { label: 'On Progress', color: 'bg-yellow-100 text-yellow-700' },
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700' },
    canceled: { label: 'Canceled', color: 'bg-red-100 text-red-700' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
