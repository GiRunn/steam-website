import React, { useState, useEffect } from 'react';
import {
  MetricsChart,
  LoadingSpinner,
  ErrorMessage,
  NotificationManager,
  ResourceMetrics,
  PerformanceDetails,
  QueryAnalysis,
  OptimizationSuggestions,
  DataTable,
  RefreshIndicator
} from '../../components';
import './styles.css';

interface PerformanceData {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_throughput: number;
  active_connections: number;
  response_time: number;
}

interface QueryData {
  id: string;
  query: string;
  duration: number;
  timestamp: string;
  status: 'success' | 'error' | 'running';
}

const SystemMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_throughput: 0,
    active_connections: 0,
    response_time: 0
  });
  const [queries, setQueries] = useState<QueryData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 这里添加数据获取逻辑
        // 模拟数据
        setPerformanceData({
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_throughput: Math.random() * 1000,
          active_connections: Math.floor(Math.random() * 100),
          response_time: Math.random() * 1000
        });

        setQueries([
          {
            id: '1',
            query: 'SELECT * FROM users',
            duration: Math.random() * 1000,
            timestamp: new Date().toISOString(),
            status: 'success'
          },
          {
            id: '2',
            query: 'UPDATE posts SET views = views + 1',
            duration: Math.random() * 1000,
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        ] as QueryData[]);

        setLastUpdated(new Date());
        setNextUpdate(new Date(Date.now() + 60000)); // 1分钟后更新
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => setError(null)} />;

  return (
    <div className="system-monitor">
      <NotificationManager />
      
      <div className="monitor-header">
        <h1>系统监控</h1>
        <RefreshIndicator 
          lastUpdated={lastUpdated}
          nextUpdate={nextUpdate}
        />
      </div>

      <div className="metrics-grid">
        <ResourceMetrics />
        <PerformanceDetails data={performanceData} />
      </div>

      <div className="analysis-section">
        <QueryAnalysis queries={queries} />
      </div>

      <div className="optimization-section">
        <OptimizationSuggestions suggestions={[]} />
      </div>
    </div>
  );
};

export default SystemMonitor; 