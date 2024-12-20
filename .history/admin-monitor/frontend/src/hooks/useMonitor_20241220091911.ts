import { useState, useEffect } from 'react';
import { getSystemMetrics } from '../services/monitorService';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  database_size: string;
  database_size_bytes: number;
  active_connections: number;
  total_connections: number;
  max_connections: number;
  connection_usage_percent: number;
}

export const useMonitor = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    database_size: '0 bytes',
    database_size_bytes: 0,
    active_connections: 0,
    total_connections: 0,
    max_connections: 100,
    connection_usage_percent: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await getSystemMetrics();
      setSystemMetrics(metrics);
      setError(null);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  return {
    systemMetrics,
    loading,
    error,
    refreshMetrics: fetchMetrics
  };
};
