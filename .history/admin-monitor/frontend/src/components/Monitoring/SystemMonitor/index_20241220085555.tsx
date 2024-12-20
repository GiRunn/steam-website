import React from 'react';
import { Card, Chart } from '../../common';
import { useMonitor } from '../../../hooks/useMonitor';
import './styles.css';

const SystemMonitor = () => {
  const { systemMetrics, loading } = useMonitor();

  return (
    <Card title="系统监控">
      <Chart
        data={systemMetrics}
        xField="time"
        yField="value"
        loading={loading}
      />
    </Card>
  );
};

export default SystemMonitor; 