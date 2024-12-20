import { useState, useEffect } from 'react';

interface MonitorParams {
  type: 'database' | 'system' | 'review' | 'security' | 'partition';
}

interface MonitorData {
  name: string;
  value: number;
  status: string;
}

export function useMonitor(params: MonitorParams) {
  const [data, setData] = useState<MonitorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = `/api/monitor/${params.type}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [params.type]);

  return { data, loading, error };
}

