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
const SystemMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 这里添加数据获取逻辑
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
        <PerformanceDetails />
      </div>

      <div className="analysis-section">
        <QueryAnalysis />
      </div>

      <div className="optimization-section">
        <OptimizationSuggestions suggestions={[]} />
      </div>
    </div>
  );
};

export default SystemMonitor; 