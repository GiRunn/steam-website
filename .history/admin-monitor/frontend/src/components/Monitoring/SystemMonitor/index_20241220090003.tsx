import React from 'react';
import { Card } from '../../common/Card';
import { Progress } from '../../common/Progress';
import { useMonitor } from '../../../hooks/useMonitor';

const SystemMonitor: React.FC = () => {
  const { systemMetrics, loading, error } = useMonitor();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="system-monitor">
      <Card title="System Metrics">
        <div className="metrics-grid">
          <div className="metric-item">
            <h3>CPU Usage</h3>
            <Progress 
              percent={systemMetrics.cpu_usage} 
              status={systemMetrics.cpu_usage > 80 ? 'exception' : 'normal'}
            />
          </div>
          <div className="metric-item">
            <h3>Memory Usage</h3>
            <Progress 
              percent={systemMetrics.memory_usage}
              status={systemMetrics.memory_usage > 80 ? 'exception' : 'normal'}
            />
          </div>
          <div className="metric-item">
            <h3>Database Size</h3>
            <p>{systemMetrics.database_size}</p>
          </div>
          <div className="metric-item">
            <h3>Connections</h3>
            <Progress 
              percent={systemMetrics.connection_usage_percent}
              status={systemMetrics.connection_usage_percent > 80 ? 'exception' : 'normal'}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemMonitor;
