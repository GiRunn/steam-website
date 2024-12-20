import React from 'react';
import { DashboardLayout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MonitorProvider } from './context/MonitorContext';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

function App() {
  return (
    <ErrorBoundary>
      <MonitorProvider>
        <DashboardLayout />
      </MonitorProvider>
    </ErrorBoundary>
  );
}

export default App; 