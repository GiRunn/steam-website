import React from 'react';
import SystemMonitorPage from './pages/SystemMonitor';
import {
  SystemMonitor,
  ReviewSystemMonitor,
  SecurityMonitor,
  PartitionMonitor
} from './components/Monitoring';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

function App() {
  return (
    <ErrorBoundary>
      <SystemMonitorPage />
      <ReviewSystemMonitor />
      <SecurityMonitor />
      <PartitionMonitor />
    </ErrorBoundary>
  );
}

export default App; 