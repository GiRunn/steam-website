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
        const response = await fetch(`${process.env.REACT_APP_API_URL}${options.endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, options.interval || 30000);
    return () => clearInterval(interval);
  }, [options.endpoint, options.interval]);

  return { data, loading, error };
}

