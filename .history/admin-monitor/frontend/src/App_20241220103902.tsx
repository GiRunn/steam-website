import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/admin-monitor.css';
import './styles/forced-colors.css';

// 懒加载页面组件
const SystemMonitor = lazy(() => import('./pages/SystemMonitor'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="App">
          <SystemMonitor />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App; 