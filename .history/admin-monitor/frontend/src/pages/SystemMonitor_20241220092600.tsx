import React, { useState, useEffect } from 'react';
import {
  SystemMonitor,
  ReviewSystemMonitor,
  SecurityMonitor,
  PartitionMonitor
} from '../components/Monitoring';
import MetricsChart from '../components/Charts/MetricsChart';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  connections: number;
  transactions: number;
}

interface MetricsHistory {
  cpu: Array<{ timestamp: string; value: number }>;
  memory: Array<{ timestamp: string; value: number }>;
  connections: Array<{ timestamp: string; value: number }>;
  transactions: Array<{ timestamp: string; value: number }>;
}

const SystemMonitorPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory>({
    cpu: [],
    memory: [],
    connections: [],
    transactions: []
  });

  useEffect(() => {
    // Fetch metrics history data
    const fetchMetricsHistory = async () => {
      try {
        const response = await fetch(`/api/metrics/history?timeRange=${timeRange}`);
        const data = await response.json();
        setMetricsHistory(data);
      } catch (error) {
        console.error('Failed to fetch metrics history:', error);
      }
    };

    fetchMetricsHistory();
    const interval = setInterval(fetchMetricsHistory, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="system-monitor-page">
      <div className="monitor-grid">
        <SystemMonitor />
        <ReviewSystemMonitor />
        <SecurityMonitor />
        <PartitionMonitor />
      </div>

      <div className="metrics-history">
        <div className="metrics-chart">
          <MetricsChart 
            data={metricsHistory.cpu}
            title="CPU使用率趋势"
            color="#4fc3f7"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="metrics-chart">
          <MetricsChart 
            data={metricsHistory.memory}
            title="内存使用趋势"
            color="#81c784"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="metrics-chart">
          <MetricsChart 
            data={metricsHistory.connections}
            title="连接数趋势"
            color="#ff8a65"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="metrics-chart">
          <MetricsChart 
            data={metricsHistory.transactions}
            title="事务处理趋势"
            color="#ba68c8"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitorPage;