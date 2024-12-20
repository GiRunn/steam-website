import React from 'react';
import { DashboardLayout } from './components/Layout';
import { MonitorProvider } from './context/MonitorContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';

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