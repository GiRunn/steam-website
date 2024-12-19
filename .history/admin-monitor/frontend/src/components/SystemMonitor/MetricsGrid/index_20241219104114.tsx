import React from 'react';
import { MetricCard } from './MetricCard';
import { Metric } from '../types';
import './styles.css';

interface MetricsGridProps {
  metrics: {
    system: Metric[];
    database: Metric[];
    connections: Metric[];
    reviews: Metric[];
    performance: Metric[];
  };
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="metrics-section">
      <MetricCard title="系统指标" metrics={metrics.system} icon="icon-cpu" />
      <MetricCard title="数据库指标" metrics={metrics.database} icon="icon-database" />
      <MetricCard title="连接状态" metrics={metrics.connections} icon="icon-network" />
      <MetricCard title="评论系统" metrics={metrics.reviews} icon="icon-comments" />
    </div>
  );
}; 