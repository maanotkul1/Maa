// File: src/hooks/useGoogleSheets.js
// Hook untuk menggunakan Google Sheets functionality

import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useGoogleSheets = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/sheets/status');
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncHistoryJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/sheets/sync-history-jobs');
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncTools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/sheets/sync-tools');
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/sheets/sync-all');
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    status,
    error,
    checkStatus,
    syncHistoryJobs,
    syncTools,
    syncAll,
  };
};

export default useGoogleSheets;
