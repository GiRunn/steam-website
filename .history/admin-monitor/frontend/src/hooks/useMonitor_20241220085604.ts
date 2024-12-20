import { useState, useEffect } from 'react';
import { MonitorService } from '../services/monitorService';

export const useMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [databaseMetrics, setDatabaseMetrics] = useState([]);
  const [reviewMetrics, setReviewMetrics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sysMetrics, dbMetrics, revMetrics] = await Promise.all([
          MonitorService.getSystemMetrics(),
          MonitorService.getDatabaseMetrics(),
          MonitorService.getReviewMetrics()
        ]);
        
        setSystemMetrics(sysMetrics);
        setDatabaseMetrics(dbMetrics);
        setReviewMetrics(revMetrics);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    systemMetrics,
    databaseMetrics,
    reviewMetrics
  };
}; 