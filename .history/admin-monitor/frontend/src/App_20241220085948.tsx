import React from 'react';
import { SystemMonitor } from './components/Monitoring';
import { MonitorProvider } from './context/MonitorContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

function App() {
  return (
    <ErrorBoundary>
      <MonitorProvider>
        <div className="App">
          <SystemMonitor />
        </div>
      </MonitorProvider>
    </ErrorBoundary>
  );
}

export default App; 