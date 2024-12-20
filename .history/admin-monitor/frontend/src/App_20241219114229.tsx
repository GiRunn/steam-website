import React from 'react';
import SystemMonitor from './pages/SystemMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

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