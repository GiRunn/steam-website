import React from 'react';
import MonitorLayout from './components/layout/MonitorLayout';
import {
  SystemMonitor,
  ReviewSystemMonitor,
  SecurityMonitor,
  PartitionMonitor
} from './components/Monitoring';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

function App() {
  return (
    <ErrorBoundary>
      <MonitorLayout>
        <SystemMonitor />
        <ReviewSystemMonitor />
        <SecurityMonitor />
        <PartitionMonitor />
      </MonitorLayout>
    </ErrorBoundary>
  );
}

export default App; 