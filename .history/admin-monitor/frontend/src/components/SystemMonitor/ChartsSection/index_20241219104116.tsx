import React from 'react';
import { MetricsChart } from '@components/Charts/MetricsChart';
import { MetricsHistory } from '../types';
import './styles.css';

interface ChartsSectionProps {
  metricsHistory: MetricsHistory;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  metricsHistory,
  timeRange,
  onTimeRangeChange
}) => {
  return (
    <div className="charts-section">
      {/* Charts content */}
    </div>
  );
}; 