import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'fe',
    status: 'active',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/users', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'fe',
        status: 'active',
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '',
      phone: userToEdit.phone || '',
      role: userToEdit.role,
      status: userToEdit.status,
    });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const updateData = { ...formData };
      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }
      await api.put(`/users/${editingUser.id}`, updateData);
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'fe',
        status: 'active',
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user');
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

  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">Manage system users</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <span className="material-icons text-lg">add</span>
            <span>Create User</span>
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {users.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{u.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
                {u.phone && (
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="material-icons text-sm align-middle mr-1">phone</span>
                    {u.phone}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditUser(u)}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-icons text-lg">edit</span>
                    <span>Edit</span>
                  </button>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 dark:text-white">{u.name}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{u.email}</td>
                      <td className="py-3 px-4 dark:text-gray-300">{u.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            title="Edit User"
                          >
                            <span className="material-icons text-xl">edit</span>
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Deactivate User"
                            >
                              <span className="material-icons text-xl">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Create New User</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'fe',
                    status: 'active',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimal 8 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="fe">Field Engineer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      role: 'fe',
                      status: 'active',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setError('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'fe',
                    status: 'active',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah password</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="fe">Field Engineer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setError('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      role: 'fe',
                      status: 'active',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

