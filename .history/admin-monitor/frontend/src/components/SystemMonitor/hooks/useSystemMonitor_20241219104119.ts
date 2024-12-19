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

export const useSystemMonitor = () => {
  // Hook implementation
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