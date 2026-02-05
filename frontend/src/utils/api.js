import axios from 'axios';

// VITE_API_URL already includes /api path from .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Do NOT set Content-Type for FormData - let axios handle it
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type for FormData so axios sets boundary correctly
      delete config.headers['Content-Type'];
      
      // Debug logging untuk FormData
      if (import.meta.env.DEV) {
        const entries = Array.from(config.data.entries());
        const fileEntries = entries.filter(([key, value]) => value instanceof File);
        if (fileEntries.length > 0) {
          console.log('[API] FormData with files detected:', fileEntries.map(([k, v]) => `${k}: ${v.name}`));
          console.log('[API] Request will use multipart/form-data');
        }
      }
    }
    
    // Add cache busting headers for GET requests
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache';
      config.params = config.params || {};
      config.params['_t'] = new Date().getTime();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error untuk debugging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

