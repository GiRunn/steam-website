// API服务层
export const MonitorAPI = {
  // 系统指标
  getSystemMetrics: () => axios.get('/system-metrics'),
  
  // 数据库指标  
  getDatabaseMetrics: () => axios.get('/database-metrics'),
  
  // 连接状态
  getConnectionStatus: () => axios.get('/connection-status'),
  
  // 评论系统
  getReviewSystemStats: () => axios.get('/review-system/stats')
}; 