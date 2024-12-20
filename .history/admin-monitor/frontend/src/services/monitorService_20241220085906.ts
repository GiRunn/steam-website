import api from './api';

export const MonitorService = {
  // 系统监控
  getSystemMetrics: () => api.get('/system-metrics'),
  getSystemMetricsHistory: (timeRange: string) => api.get(`/system-metrics/history?timeRange=${timeRange}`),
  
  // 数据库监控
  getDatabaseMetrics: () => api.get('/database-metrics'),
  getDatabasePerformance: () => api.get('/database-performance-details'),
  
  // 连接监控
  getConnectionStatus: () => api.get('/connection-status'),
  getConnectionDetails: () => api.get('/connections/details'),
  
  // 评论系统监控
  getReviewSystemStats: () => api.get('/review-system/stats'),
  getReviewSystemMetrics: () => api.get('/review-system/metrics'),
  getReviewSystemAnomalies: () => api.get('/review-system/anomalies'),
  
  // 分区监控
  getPartitionStatus: () => api.get('/partitions/status'),
  
  // 性能监控
  getPerformanceMetrics: () => api.get('/performance-metrics'),
  getOptimizationSuggestions: () => api.get('/optimization-suggestions'),
  
  // 安全监控
  getSecurityEvents: () => api.get('/security/events'),
};