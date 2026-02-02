import MainLayout from '../components/Layout/MainLayout';
import GDriveDashboard from '../components/GDriveDashboard';

export default function GDriveDashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            BA Digital Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View and manage files from shared Google Drive folder
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <GDriveDashboard />
        </div>
      </div>
    </MainLayout>
  );
}
