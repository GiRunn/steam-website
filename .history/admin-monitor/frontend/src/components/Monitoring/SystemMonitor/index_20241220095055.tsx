import React from 'react';
import Card from '../../common/Card';
import Progress from '../../common/Progress';
import { useMonitor } from '../../../hooks/useMonitor';
import './SystemMonitor.css';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}
const SystemMonitor: React.FC = () => {
  const { data, loading, error } = useMonitor<SystemMetrics>('/api/monitor/system');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const getStatus = (usage: number) => {
    if (usage >= 90) return 'error';
    if (usage >= 70) return 'warning';
    if (usage >= 0) return 'normal';
    return 'normal';
  };

  return (
    <Card title="系统监控" className="system-monitor">
      <div className="metrics-container">
        <div className="metric-item">
          <span className="metric-label">CPU使用率</span>
          <Progress
            percent={data[0].cpuUsage}
            status={getStatus(data[0].cpuUsage)}
          />
        </div>
        <div className="metric-item">
          <span className="metric-label">内存使用率</span>
          <Progress
            percent={data.memoryUsage}
            status={getStatus(data.memoryUsage)}
          />
        </div>
        <div className="metric-item">
          <span className="metric-label">磁盘使用率</span>
          <Progress
            percent={data.diskUsage}
            status={getStatus(data.diskUsage)}
          />
        </div>
      </div>
    </Card>
  );
};

export default SystemMonitor; 