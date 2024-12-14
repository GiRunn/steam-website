const { pool, partitionConfig } = require('../../../config/database');

async function getGameReviews(gameId, page = 1, pageSize = 20) {
  const currentDate = new Date();
  const yearMonth = `${currentDate.getFullYear()}_${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  // 获取正确的分区信息
  const { partitionKey, whereClause } = partitionConfig.queryOptimizer
    .addPartitionCriteria(gameId, yearMonth);
    
  const query = `
    SELECT * FROM ${partitionKey}
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  
  return pool.query(query, [pageSize, (page - 1) * pageSize]);
} 