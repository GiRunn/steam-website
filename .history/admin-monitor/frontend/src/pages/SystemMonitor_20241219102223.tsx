import React, { useState, useEffect } from 'react';
import {
  StatCard,
  SystemStatus,
  MetricsChart,
  DataTable,
  LoadingSpinner,
  ErrorMessage,
  NotificationManager,
  RefreshIndicator,
  QueryAnalysis,
  PerformanceDetails
} from '../components';
import './SystemMonitor.css';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_throughput: number;
  active_connections: number;
  response_time: number;
}

const SystemMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_throughput: 0,
    active_connections: 0,
    response_time: 0
  });
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error' | 'maintenance'>('healthy');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 模拟数据获取
        const newMetrics = {
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_throughput: Math.random() * 1000,
          active_connections: Math.floor(Math.random() * 100),
          response_time: Math.random() * 1000
        };
        
        setMetrics(newMetrics);
        setSystemStatus(newMetrics.cpu_usage > 90 ? 'error' : 
                       newMetrics.cpu_usage > 70 ? 'warning' : 'healthy');
        setLastUpdated(new Date());
        setNextUpdate(new Date(Date.now() + 60000));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
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

      <SystemStatus 
        status={systemStatus}
        message={`系统${systemStatus === 'healthy' ? '运行正常' : '需要注意'}`}
        details={{
          cpu: metrics.cpu_usage,
          memory: metrics.memory_usage,
          disk: metrics.disk_usage,
          network: metrics.network_throughput
        }}
      />

      <div className="metrics-grid">
        <StatCard
          title="CPU使用率"
          value={`${metrics.cpu_usage.toFixed(2)}%`}
          icon="fas fa-microchip"
          trend={{
            value: 5,
            type: 'increase'
          }}
        />
        <StatCard
          title="内存使用率"
          value={`${metrics.memory_usage.toFixed(2)}%`}
          icon="fas fa-memory"
          trend={{
            value: 2,
            type: 'decrease'
          }}
        />
        <StatCard
          title="磁盘使用率"
          value={`${metrics.disk_usage.toFixed(2)}%`}
          icon="fas fa-hdd"
        />
        <StatCard
          title="网络吞吐量"
          value={`${metrics.network_throughput.toFixed(2)} MB/s`}
          icon="fas fa-network-wired"
        />
      </div>

      <div className="charts-section">
        <MetricsChart
          data={[{ timestamp: new Date().toISOString(), value: metrics.cpu_usage }]}
          title="CPU使用率趋势"
          color="var(--accent-primary)"
          dataKey="cpu_usage"
          timeRange="1h"
          onTimeRangeChange={() => {}}
        />
      </div>

      <div className="performance-section">
        <PerformanceDetails data={metrics} />
      </div>

      <div className="queries-section">
        <QueryAnalysis queries={[
          {
            id: '1',
            query: 'SELECT * FROM users',
            duration: 100,
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        ]} />
      </div>
    </div>
  );
};

export default SystemMonitor;