-- 优化分区策略
ALTER TABLE review_system.reviews_partitioned 
PARTITION BY RANGE (created_at, game_id); -- 复合分区键提高查询效率

-- 创建子分区
CREATE TABLE reviews_y2024m01_game1000 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-01-01', 1000) TO ('2024-02-01', 2000);

-- 添加分区索引
CREATE INDEX idx_reviews_partition_game ON review_system.reviews_partitioned (game_id, created_at)
    WITH (fillfactor = 90); -- 设置填充因子减少页面分裂