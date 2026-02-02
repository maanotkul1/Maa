import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import HistoryJobDetailInstalasi from './HistoryJobDetailInstalasi';
import HistoryJobDetailFO from './HistoryJobDetailFO';
import HistoryJobDetailWireless from './HistoryJobDetailWireless';
import MainLayout from '../components/Layout/MainLayout';

export default function HistoryJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/history-jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Gagal memuat data job');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="p-4 lg:p-6">
          <p className="text-gray-500 dark:text-gray-400">Job tidak ditemukan</p>
        </div>
      </MainLayout>
    );
  }

  // Route to the appropriate detail page component based on job type
  if (job.job_type === 'instalasi') {
    return <HistoryJobDetailInstalasi />;
  }

  if (job.job_type === 'troubleshooting_fo') {
    return <HistoryJobDetailFO />;
  }

  if (job.job_type === 'troubleshooting_wireless') {
    return <HistoryJobDetailWireless />;
  }

  // Fallback
  return (
    <MainLayout>
      <div className="p-4 lg:p-6">
        <p className="text-gray-500 dark:text-gray-400">Tipe job tidak dikenali</p>
      </div>
    </MainLayout>
  );
}

