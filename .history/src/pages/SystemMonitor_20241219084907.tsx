import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/SystemMonitor/Header';
import { MetricCard } from '../components/SystemMonitor/MetricCard';
import { ChartSection } from '../components/SystemMonitor/ChartSection';
import { PerformanceDetails } from '../components/SystemMonitor/PerformanceDetails';
import { OptimizationSuggestions } from '../components/SystemMonitor/OptimizationSuggestions';
import { useMetrics } from '../hooks/useMetrics';
import styles from './SystemMonitor.module.css';

const SystemMonitor: React.FC = () => {
  const {
    metrics,
    performanceDetails,
    optimizationSuggestions,
    metricsHistory,
    lastUpdated,
    isAutoRefresh,
    refreshInterval,
    timeRange,
    setIsAutoRefresh,
    setRefreshInterval,
    setTimeRange,
  } = useMetrics();

  return (
    <div className={styles.container}>
      <Header
        isAutoRefresh={isAutoRefresh}
        refreshInterval={refreshInterval}
        lastUpdated={lastUpdated}
        onAutoRefreshChange={setIsAutoRefresh}
        onRefreshIntervalChange={setRefreshInterval}
      />
      
      <div className={styles.grid}>
        <div className={styles.metricsSection}>
          <MetricCard
            title="系统指标"
            metrics={metrics.system}
            icon="icon-cpu"
          />
          <MetricCard
            title="数据库指标"
            metrics={metrics.database}
            icon="icon-database"
          />
          <MetricCard
            title="连接状态"
            metrics={metrics.connections}
            icon="icon-network"
          />
          <MetricCard
            title="评论系统"
            metrics={metrics.reviews}
            icon="icon-comments"
          />
        </div>

        <ChartSection
          metricsHistory={metricsHistory}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <div className={styles.sidebar}>
          <PerformanceDetails details={performanceDetails} />
          <OptimizationSuggestions suggestions={optimizationSuggestions} />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor; 