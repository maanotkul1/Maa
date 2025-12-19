import { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <span className="material-icons text-gray-700 dark:text-gray-200">menu</span>
            </button>
            <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">Job Management</h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <span className="material-icons text-gray-700 dark:text-gray-200">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

