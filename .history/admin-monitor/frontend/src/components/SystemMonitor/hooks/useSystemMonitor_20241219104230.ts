import { useState, useEffect, useCallback } from 'react';
import { 
  getSystemMetrics,
  getDatabaseMetrics,
  getConnectionStatus,
  getReviewSystemMetrics,
  getPerformanceMetrics,
  getDatabasePerformanceDetails,
  getOptimizationSuggestions,
  getSystemMetricsHistory
} from '@services/monitorService';
import { Metric, MetricsHistory } from '../types';

export const useSystemMonitor = () => {
  const [metrics, setMetrics] = useState<{
    system: Metric[];
    database: Metric[];
    connections: Metric[];
    reviews: Metric[];
    performance: Metric[];
  }>({
    system: [],
    database: [],
    connections: [],
    reviews: [],
    performance: []
  });

  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory>({
    cpu: [],
    memory: [],
    connections: [],
    transactions: []
  });

  const [performanceDetails, setPerformanceDetails] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState('1h');

  // 实现 fetchMetrics 函数...

  useEffect(() => {
    fetchMetrics();
    if (isAutoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval]);

  return {
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
  };
}; 