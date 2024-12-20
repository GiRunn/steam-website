import React from 'react';
import MonitorLayout from './components/layout/MonitorLayout';
import SystemMonitor from './components/Monitoring/SystemMonitor';
import ReviewSystemMonitor from './components/Monitoring/ReviewSystemMonitor';
import SecurityMonitor from './components/Monitoring/SecurityMonitor';
import PartitionMonitor from './components/Monitoring/PartitionMonitor';
import ErrorBoundary from './components/ErrorBoundary';
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