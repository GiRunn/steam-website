import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../common/Card';
import Progress from '../../common/Progress';
import { useMonitor } from '../../../hooks/useMonitor';
import MetricsChart from '../../Charts/MetricsChart';
import ConnectionDetails from './ConnectionDetails';
import './SystemMonitor.css';

interface SystemMetric {
  name: string;
  value: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const SystemMonitor: React.FC = () => {
  const { systemMetrics, loading, error, refreshMetrics } = useMonitor();
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);

  // 为MetricsChart准备数据
  const chartData = metrics.map(metric => ({
    timestamp: new Date().toLocaleTimeString(),
    value: metric.value
  }));

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="loading-container"
      >
        加载中...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="error-container"
      >
        错误: {error}
        <button onClick={refreshMetrics}>重试</button>
      </motion.div>
    );
  }

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }): 'normal' | 'warning' | 'critical' => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  };

  const metrics: SystemMetric[] = [
    {
      name: 'CPU使用率',
      value: systemMetrics.cpu_usage,
      status: getMetricStatus(systemMetrics.cpu_usage, { warning: 70, critical: 90 }),
      trend: 'stable'
    },
    {
      name: '内存使用率',
      value: systemMetrics.memory_usage,
      status: getMetricStatus(systemMetrics.memory_usage, { warning: 80, critical: 95 }),
      trend: 'up'
    },
    {
      name: '连接使用率',
      value: systemMetrics.connection_usage_percent,
      status: getMetricStatus(systemMetrics.connection_usage_percent, { warning: 75, critical: 90 }),
      trend: 'stable'
    }
  ];

  return (
    <div className="system-monitor">
      <Card title="系统指标">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <motion.div 
              key={metric.name}
              className="metric-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>{metric.name}</h3>
              <Progress 
                percent={metric.value} 
                status={metric.status === 'critical' ? 'exception' : 'normal'}
                showInfo
              />
              <div className="metric-details">
                <span className={`trend trend-${metric.trend}`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
                <span className={`status status-${metric.status}`}>
                  {metric.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="connection-section">
          <h3>连接详情</h3>
          <div className="connection-summary">
            <div>活跃连接: {systemMetrics.active_connections}</div>
            <div>总连接数: {systemMetrics.total_connections}</div>
            <div>最大连接数: {systemMetrics.max_connections}</div>
          </div>
          <button 
            className="details-button"
            onClick={() => setShowConnectionDetails(!showConnectionDetails)}
          >
            {showConnectionDetails ? '隐藏详情' : '查看详情'}
          </button>
          {showConnectionDetails && <ConnectionDetails />}
        </div>

        <div className="metrics-chart">
          <MetricsChart data={chartData} />
        </div>
      </Card>
    </div>
  );
};

export default SystemMonitor; 