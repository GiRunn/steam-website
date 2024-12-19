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

  const fetchMetrics = useCallback(async () => {
    try {
      const [
        systemData,
        databaseData,
        connectionData,
        reviewData,
        performanceData,
        performanceDetailsData,
        optimizationData,
        historyData
      ] = await Promise.all([
        getSystemMetrics(),
        getDatabaseMetrics(),
        getConnectionStatus(),
        getReviewSystemMetrics(),
        getPerformanceMetrics(),
        getDatabasePerformanceDetails(),
        getOptimizationSuggestions(),
        getSystemMetricsHistory(timeRange)
      ]);

      setMetrics({
        system: [
          { name: 'CPU使用率', value: systemData?.cpu_usage || 0, unit: '%' },
          { name: '内存使用', value: systemData?.memory_usage || 0, unit: '%' }
        ],
        database: [
          { name: '数据库大小', value: databaseData?.size || 0, unit: 'MB' },
          { name: '连接数', value: databaseData?.connections || 0 }
        ],
        connections: [
          { name: '总连接数', value: connectionData?.total || 0 },
          { name: '活跃连接', value: connectionData?.active || 0 }
        ],
        reviews: [
          { name: '总评论数', value: reviewData?.total || 0 },
          { name: '平均评分', value: reviewData?.average || 0, unit: '分' }
        ],
        performance: [
          { name: '缓存命中率', value: performanceData?.cache_hit || 0, unit: '%' },
          { name: '每秒事务', value: performanceData?.tps || 0 }
        ]
      });

      setMetricsHistory(historyData);
      setPerformanceDetails(performanceDetailsData);
      setOptimizationSuggestions(optimizationData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
    if (isAutoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, isAutoRefresh, refreshInterval]);

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