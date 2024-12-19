import React from 'react';
import { ErrorBoundary, MainLayout } from './components';
import SystemMonitor from './pages/SystemMonitor';
import './styles/admin-monitor.css';

function App() {
  return (
    <ErrorBoundary>
      <MainLayout>
        <SystemMonitor />
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App; 