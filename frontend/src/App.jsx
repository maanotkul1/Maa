import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobDetail from './pages/JobDetail';
import JobTrash from './pages/JobTrash';
import Odp from './pages/Odp';
import Users from './pages/Users';
import Profile from './pages/Profile';

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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs-trash"
        element={
          <ProtectedRoute requireAdmin>
            <JobTrash />
          </ProtectedRoute>
        }
      />
      <Route
        path="/odp"
        element={
          <ProtectedRoute requireAdmin>
            <Odp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
