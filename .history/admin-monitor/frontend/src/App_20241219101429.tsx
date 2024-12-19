import React from 'react';
import { ErrorBoundary } from './components';
import SystemMonitor from './pages/SystemMonitor';
import './styles/admin-monitor.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <SystemMonitor />
      </div>
    </ErrorBoundary>
  );
}

export default App; 