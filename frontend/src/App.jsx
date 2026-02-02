import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Lazy load Dashboard dan semua pages untuk mempercepat login initial load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HistoryJobs = lazy(() => import('./pages/HistoryJobs'));
const CreateHistoryJob = lazy(() => import('./pages/CreateHistoryJob'));
const EditHistoryJob = lazy(() => import('./pages/EditHistoryJob'));
const HistoryJobDetail = lazy(() => import('./pages/HistoryJobDetail'));
const HistoryJobDetailInstalasi = lazy(() => import('./pages/HistoryJobDetailInstalasi'));
const HistoryJobDetailFO = lazy(() => import('./pages/HistoryJobDetailFO'));
const HistoryJobDetailWireless = lazy(() => import('./pages/HistoryJobDetailWireless'));
const ToolsData = lazy(() => import('./pages/ToolsData'));
const ToolsDataDetail = lazy(() => import('./pages/ToolsDataDetail'));
const QRScannerUpdate = lazy(() => import('./pages/QRScannerUpdate'));
const ToolsMonthlyUpdateStatus = lazy(() => import('./pages/ToolsMonthlyUpdateStatus'));
const GDriveDashboardPage = lazy(() => import('./pages/GDriveDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Minimal loading component untuk lazy routes
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-700 border-t-primary-600"></div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <HistoryJobs />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/new"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <CreateHistoryJob />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/:id"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <HistoryJobDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <EditHistoryJob />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/:id/instalasi"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <HistoryJobDetailInstalasi />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/:id/fo"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <HistoryJobDetailFO />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history-jobs/:id/wireless"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <HistoryJobDetailWireless />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools-data"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <ToolsData />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools-data/scan-qr"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <QRScannerUpdate />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools-data/monthly-status"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <ToolsMonthlyUpdateStatus />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools-data/:id"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <ToolsDataDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gdrive-dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              <GDriveDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
