import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900/50 rounded-xl mb-4">
            <span className="material-icons text-primary-600 dark:text-primary-400 text-5xl">work_outline</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Job Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">FTTH Network System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-lg flex items-start gap-3 animate-shake">
              <span className="material-icons text-red-500 dark:text-red-400 text-xl flex-shrink-0">error_outline</span>
              <span className="text-sm pt-0.5">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl pointer-events-none">
                email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl pointer-events-none">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span className="material-icons text-xl">login</span>
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} MaaDeveloper. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

