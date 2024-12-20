import React from 'react';
import MonitorLayout from './components/layout/MonitorLayout';
import {
  SystemMonitor,
  ReviewSystemMonitor,
  SecurityMonitor,
  PartitionMonitor
} from './components/Monitoring';
import { MonitorProvider } from './context/MonitorContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

function App() {
  return (
    <ErrorBoundary>
      <MonitorProvider>
        <MonitorLayout>
          <SystemMonitor />
          <ReviewSystemMonitor />
          <SecurityMonitor />
          <PartitionMonitor />
        </MonitorLayout>
      </MonitorProvider>
    </ErrorBoundary>
  );
}

export default App; 