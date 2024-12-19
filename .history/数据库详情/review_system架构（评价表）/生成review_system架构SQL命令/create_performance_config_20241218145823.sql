-- 设置缓存和性能相关参数
ALTER SYSTEM SET 
    -- 主要缓存配置
    shared_buffers = '4GB',                     -- 建议为总内存的25%
    effective_cache_size = '12GB',              -- 建议为总内存的75%
    work_mem = '64MB',                          -- 复杂查询的工作内存
    maintenance_work_mem = '1GB',               -- 维护操作的工作内存
    
    -- 查询优化器配置
    random_page_cost = 1.1,                     -- SSD存储建议值
    effective_io_concurrency = 200,             -- SSD存储建议值
    
    -- 写入性能优化
    wal_buffers = '16MB',                       -- WAL缓冲区大小
    checkpoint_timeout = '15min',               -- 检查点超时时间
    max_wal_size = '8GB',                       -- 最大WAL大小
    
    -- 并发配置
    max_connections = 200,                      -- 最大连接数
    max_parallel_workers_per_gather = 4,        -- 并行查询工作进程数
    max_parallel_workers = 8,                   -- 最大并行工作进程数
    
    -- 缓存行为配置
    synchronous_commit = 'off',                 -- 提高写入性能，但可能丢失最后几个事务
    full_page_writes = 'off',                  -- 关闭全页写入，提高性能
    
    -- 统计信息收集
    default_statistics_target = 1000;          -- 提高统计信息精确度

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