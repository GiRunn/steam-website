-- 设置缓存和性能相关参数
-- 主要缓存配置
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';

-- 查询优化器配置
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 写入性能优化
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_timeout = '15min';
ALTER SYSTEM SET max_wal_size = '8GB';

-- 并发配置
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- 缓存行为配置
ALTER SYSTEM SET synchronous_commit = 'off';
ALTER SYSTEM SET full_page_writes = 'off';

-- 统计信息收集
ALTER SYSTEM SET default_statistics_target = 1000;

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

-- 重新加载配置
SELECT pg_reload_conf(); 