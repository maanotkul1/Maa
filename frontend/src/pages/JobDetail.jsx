import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import MapView from '../components/MapView';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isFE } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ new_status: '', note: '' });
  const [noteForm, setNoteForm] = useState({ note_type: 'progress', content: '' });
  const [photoForm, setPhotoForm] = useState({ photo: null, caption: '', photo_type: 'other' });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/status`, statusForm);
      setShowStatusModal(false);
      setStatusForm({ new_status: '', note: '' });
      fetchJob();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/notes`, noteForm);
      setShowNoteModal(false);
      setNoteForm({ note_type: 'progress', content: '' });
      fetchJob();
    } catch (error) {
      console.error('Error adding note:', error);
      alert(error.response?.data?.message || 'Failed to add note');
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoForm.photo) {
      alert('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('photo', photoForm.photo);
    formData.append('caption', photoForm.caption);
    formData.append('photo_type', photoForm.photo_type);

    try {
      await api.post(`/jobs/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowPhotoModal(false);
      setPhotoForm({ photo: null, caption: '', photo_type: 'other' });
      fetchJob();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(error.response?.data?.message || 'Failed to upload photo');
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

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
        </div>
      </MainLayout>
    );
  }

  const canEdit = isAdmin || (isFE && job.assigned_fe_id === user.id);

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate('/jobs')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 flex items-center gap-1 text-sm lg:text-base"
            >
              <span className="material-icons text-lg">arrow_back</span>
              <span>Back to Jobs</span>
            </button>
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">{job.title}</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Job Number: {job.job_number}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm lg:text-base"
              >
                <span className="material-icons text-lg">update</span>
                <span className="hidden sm:inline">Update Status</span>
                <span className="sm:hidden">Update</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* ODP Info */}
            {job.odp && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 lg:p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
                <h2 className="text-lg lg:text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <span className="material-icons">location_on</span>
                  Lokasi ODP
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-600 dark:text-blue-400">Kode ODP</label>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{job.odp.kode_odp}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-600 dark:text-blue-400">Nama ODP</label>
                    <p className="font-medium text-blue-900 dark:text-blue-200">{job.odp.nama_odp}</p>
                  </div>
                  {job.odp.area_cluster && (
                    <div>
                      <label className="text-sm text-blue-600 dark:text-blue-400">Area</label>
                      <p className="font-medium text-blue-900 dark:text-blue-200">{job.odp.area_cluster}</p>
                    </div>
                  )}
                  {job.odp.alamat && (
                    <div className="sm:col-span-2">
                      <label className="text-sm text-blue-600 dark:text-blue-400">Alamat ODP</label>
                      <p className="font-medium text-blue-900 dark:text-blue-200">{job.odp.alamat}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${job.odp.latitude},${job.odp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span className="material-icons text-sm">map</span>
                    Buka di Google Maps
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${job.odp.latitude},${job.odp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span className="material-icons text-sm">directions</span>
                    Navigasi ke ODP
                  </a>
                </div>
                <div className="mt-4 h-[200px] rounded-lg overflow-hidden">
                  <MapView
                    latitude={job.odp.latitude}
                    longitude={job.odp.longitude}
                    height="200px"
                  />
                </div>
              </div>
            )}

            {/* Job Info */}
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 dark:text-white">Job Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">No</label>
                  <p className="font-medium font-mono dark:text-white">{job.no || '-'}</p>
                </div>
                {job.tanggal && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Tanggal</label>
                    <p className="font-medium dark:text-white">
                      {new Date(job.tanggal).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {job.kategori && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Kategori</label>
                    <p className="font-medium dark:text-white">{job.kategori}</p>
                  </div>
                )}
                {job.req_by && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Req By</label>
                    <p className="font-medium dark:text-white">{job.req_by}</p>
                  </div>
                )}
                {job.tiket_all_bnet && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Tiket All BNET</label>
                    <p className="font-medium dark:text-white">{job.tiket_all_bnet}</p>
                  </div>
                )}
                {job.id_nama_pop_odp_jb && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">ID-Nama/POP/ODP/JB</label>
                    <p className="font-medium dark:text-white">{job.id_nama_pop_odp_jb}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                  <p>
                    <StatusBadge status={job.status} />
                  </p>
                </div>
                {job.janji_datang && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Janji Datang</label>
                    <p className="font-medium dark:text-white">{job.janji_datang}</p>
                  </div>
                )}
                {job.petugas_1 && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Petugas 1</label>
                    <p className="font-medium dark:text-white">{job.petugas_1}</p>
                  </div>
                )}
                {job.petugas_2 && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Petugas 2</label>
                    <p className="font-medium dark:text-white">{job.petugas_2}</p>
                  </div>
                )}
                {job.petugas_3 && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Petugas 3</label>
                    <p className="font-medium dark:text-white">{job.petugas_3}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">BA (Berita Acara)</label>
                  <p className="font-medium">
                    {job.ba ? (
                      <span className="inline-flex items-center gap-2 text-green-600">
                        <span className="material-icons text-sm">check_circle</span>
                        Sudah Diterima
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span className="material-icons text-sm">cancel</span>
                        Belum Diterima
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {(job.tikor || (job.latitude && job.longitude)) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-600">Tikor</label>
                    <button
                      onClick={() => {
                        let url = '';
                        if (job.latitude && job.longitude) {
                          // Open with coordinates
                          url = `https://www.google.com/maps?q=${job.latitude},${job.longitude}`;
                        } else if (job.tikor) {
                          // Open with address
                          url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.tikor)}`;
                        }
                        if (url) {
                          window.open(url, '_blank');
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span className="material-icons text-sm">map</span>
                      <span>Buka di Google Maps</span>
                    </button>
                  </div>
                  {job.tikor && <p className="font-medium mb-2">{job.tikor}</p>}
                  {(job.latitude && job.longitude) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Latitude: <span className="font-mono">{job.latitude}</span> | 
                        Longitude: <span className="font-mono">{job.longitude}</span>
                      </p>
                    </div>
                  )}
                  {(job.latitude && job.longitude) && (
                    <div className="relative">
                      <MapView 
                        latitude={job.latitude} 
                        longitude={job.longitude} 
                        height="300px" 
                      />
                    </div>
                  )}
                </div>
              )}
              {job.detail && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600">Detail</label>
                  <p className="mt-1 whitespace-pre-wrap">{job.detail}</p>
                </div>
              )}
              {job.remarks && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600">Remarks</label>
                  <p className="mt-1 whitespace-pre-wrap">{job.remarks}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold">Notes & Updates</h2>
                {canEdit && (
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">add</span>
                    <span>Add Note</span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {job.notes?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No notes yet</p>
                ) : (
                  job.notes?.map((note) => (
                    <div key={note.id} className="border-l-4 border-primary-200 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{note.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {note.note_type}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold">Photos</h2>
                {canEdit && (
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">add</span>
                    <span>Upload Photo</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                {job.photos?.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-4">No photos yet</p>
                ) : (
                  job.photos?.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={`http://localhost:8000/storage/${photo.photo_url}`}
                        alt={photo.caption || 'Job photo'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm">
              <h2 className="text-lg lg:text-xl font-semibold mb-4">Status Timeline</h2>
              <div className="space-y-4">
                {job.status_logs?.map((log, index) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      {index < job.status_logs.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {log.new_status.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {log.changer?.name} • {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.note && <p className="text-xs text-gray-600 mt-1">{log.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)}>
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <h2 className="text-xl font-semibold">Update Job Status</h2>
            <div>
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={statusForm.new_status}
                onChange={(e) => setStatusForm({ ...statusForm, new_status: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select status</option>
                <option value="on_progress">On Progress</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                {isAdmin && <option value="canceled">Canceled</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Note (optional)</label>
              <textarea
                value={statusForm.note}
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <Modal onClose={() => setShowNoteModal(false)}>
          <form onSubmit={handleAddNote} className="space-y-4">
            <h2 className="text-xl font-semibold">Add Note</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Note Type</label>
              <select
                value={noteForm.note_type}
                onChange={(e) => setNoteForm({ ...noteForm, note_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="progress">Progress</option>
                <option value="result">Result</option>
                <option value="issue">Issue</option>
                {isAdmin && <option value="admin_instruction">Admin Instruction</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="4"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Note
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upload Photo Modal */}
      {showPhotoModal && (
        <Modal onClose={() => setShowPhotoModal(false)}>
          <form onSubmit={handleUploadPhoto} className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Photo</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoForm({ ...photoForm, photo: e.target.files[0] })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Photo Type</label>
              <select
                value={photoForm.photo_type}
                onChange={(e) => setPhotoForm({ ...photoForm, photo_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="before">Before</option>
                <option value="process">Process</option>
                <option value="after">After</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Caption (optional)</label>
              <input
                type="text"
                value={photoForm.caption}
                onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Upload
              </button>
            </div>
          </form>
        </Modal>
      )}
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

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 lg:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

