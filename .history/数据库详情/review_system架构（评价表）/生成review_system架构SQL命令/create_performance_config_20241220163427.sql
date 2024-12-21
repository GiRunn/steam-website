-- 创建缓存预热函数
CREATE OR REPLACE FUNCTION review_system.cache_warmup()
RETURNS void AS $$
BEGIN
    -- 预热评论表最近数据
    EXECUTE 'SELECT count(*) FROM review_system.reviews_partitioned 
             WHERE created_at >= CURRENT_DATE - interval ''30 days''';
             
    -- 预热热门游戏的评论数据
    EXECUTE 'SELECT * FROM review_system.review_summary_partitioned 
             ORDER BY total_reviews DESC LIMIT 100';
             
    -- 预热最近的回复数据
    EXECUTE 'SELECT count(*) FROM review_system.review_replies_partitioned 
             WHERE created_at >= CURRENT_DATE - interval ''7 days''';
END;
$$ LANGUAGE plpgsql;

-- 创建定期缓存清理函数
CREATE OR REPLACE FUNCTION review_system.cache_maintenance()
RETURNS void AS $$
BEGIN
    -- 清理过期的缓存数据
    VACUUM ANALYZE review_system.reviews_partitioned;
    VACUUM ANALYZE review_system.review_replies_partitioned;
    VACUUM ANALYZE review_system.review_summary_partitioned;
    
    -- 更新统计信息
    ANALYZE review_system.reviews_partitioned;
    ANALYZE review_system.review_replies_partitioned;
    ANALYZE review_system.review_summary_partitioned;
END;
$$ LANGUAGE plpgsql;

-- 设置统计信息采样率
ALTER TABLE review_system.reviews_partitioned 
    ALTER COLUMN content SET STATISTICS 1000;
    
-- 创建统计信息扩展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 优化查询计划
CREATE OR REPLACE FUNCTION review_system.optimize_query_plan()
RETURNS void AS $$
BEGIN
    -- 设置并行查询参数
    SET max_parallel_workers_per_gather = 4;
    SET parallel_tuple_cost = 0.1;
    SET parallel_setup_cost = 100;
    
    -- 设置工作内存
    SET work_mem = '50MB';
    
    -- 启用分区裁剪
    SET enable_partition_pruning = on;
END;
$$ LANGUAGE plpgsql;