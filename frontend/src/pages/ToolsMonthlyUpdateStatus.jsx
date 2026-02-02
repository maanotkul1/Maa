import MainLayout from '../components/Layout/MainLayout';
import ToolsMonthlyUpdateDashboard from '../components/Tools/ToolsMonthlyUpdateDashboard';

export default function ToolsMonthlyUpdateStatus() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <ToolsMonthlyUpdateDashboard />
        </div>
      </div>
    </MainLayout>
  );
}
