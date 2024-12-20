import { useState, useEffect } from 'react';

interface UseMonitorOptions {
  endpoint: string;
  interval?: number;
}

export function useMonitor<T>(options: UseMonitorOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [endpoint]);

  return { data, loading, error };
}

