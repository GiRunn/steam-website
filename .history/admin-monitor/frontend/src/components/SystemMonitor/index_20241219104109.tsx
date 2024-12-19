import React from 'react';
import { MonitorHeader } from './MonitorHeader';
import { MetricsGrid } from './MetricsGrid';
import { ChartsSection } from './ChartsSection';
import { PerformanceDetails } from './PerformanceDetails';
import { OptimizationSuggestions } from './OptimizationSuggestions';
import { useSystemMonitor } from './hooks/useSystemMonitor';
import './styles.css';

const SystemMonitor: React.FC = () => {
  const {
    metrics,
    metricsHistory,
    performanceDetails,
    optimizationSuggestions,
    refreshInterval,
    isAutoRefresh,
    lastUpdated,
    timeRange,
    setTimeRange,
    setRefreshInterval,
    setIsAutoRefresh,
  } = useSystemMonitor();

  return (
    <div className="system-monitor">
      <MonitorHeader 
        refreshInterval={refreshInterval}
        isAutoRefresh={isAutoRefresh}
        lastUpdated={lastUpdated}
        onRefreshIntervalChange={setRefreshInterval}
        onAutoRefreshChange={setIsAutoRefresh}
      />

      <div className="dashboard-container">
        <div className="dashboard-grid">
          <MetricsGrid metrics={metrics} />
          
          <ChartsSection 
            metricsHistory={metricsHistory}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          <PerformanceDetails details={performanceDetails} />
          
          <OptimizationSuggestions suggestions={optimizationSuggestions} />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor; 