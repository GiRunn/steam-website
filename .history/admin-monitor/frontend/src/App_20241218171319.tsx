import React from 'react';
import SystemMonitor from './pages/SystemMonitor';
import ErrorBoundary from './components/ErrorBoundary';

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