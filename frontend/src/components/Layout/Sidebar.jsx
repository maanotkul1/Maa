import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const menuItems = {
  admin: [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/jobs', icon: 'work', label: 'Job Management' },
    { path: '/odp', icon: 'location_on', label: 'Master ODP' },
    { path: '/users', icon: 'people', label: 'User Management' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ],
  fe: [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/jobs', icon: 'work', label: 'My Jobs' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const items = menuItems[user?.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 lg:p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-primary-600 dark:text-primary-400">Job Management</h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">FTTH Network System</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <span className="material-icons text-gray-600 dark:text-gray-300">close</span>
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="material-icons text-xl">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          {/* Dark Mode Toggle - Desktop */}
          <button
            onClick={toggleDarkMode}
            className="hidden lg:flex w-full items-center gap-3 px-4 py-2 mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="material-icons text-xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            <span className="text-sm lg:text-base">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
              <span className="material-icons text-primary-600 dark:text-primary-400">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="material-icons text-xl">logout</span>
            <span className="text-sm lg:text-base">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

