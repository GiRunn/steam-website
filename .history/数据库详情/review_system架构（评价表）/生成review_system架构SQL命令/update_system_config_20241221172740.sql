-- 设置共享缓冲区
ALTER SYSTEM SET shared_buffers = '2GB';

-- 设置工作内存
ALTER SYSTEM SET work_mem = '32MB';

-- 设置维护工作内存
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- 设置最大连接数
ALTER SYSTEM SET max_connections = '200';

-- 设置并行工作进程数
ALTER SYSTEM SET max_parallel_workers = '8';

-- 设置并行工作进程数（每个查询）
ALTER SYSTEM SET max_parallel_workers_per_gather = '4';

-- Windows平台特定设置
ALTER SYSTEM SET effective_io_concurrency = '200';

-- 设置WAL级别
ALTER SYSTEM SET wal_level = 'replica';

-- 设置检查点超时
ALTER SYSTEM SET checkpoint_timeout = '15min';

-- 设置最大WAL大小
ALTER SYSTEM SET max_wal_size = '2GB';

-- 设置最小WAL大小
ALTER SYSTEM SET min_wal_size = '1GB';

-- 重新加载配置
SELECT pg_reload_conf(); 

-- 添加资源监控
CREATE TABLE review_system.resource_monitoring (
    monitor_id SERIAL PRIMARY KEY,
    cpu_usage NUMERIC(5,2),
    memory_usage NUMERIC(5,2),
    disk_io_rate INTEGER,
    active_connections INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建资源监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_resources()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.resource_monitoring (
        cpu_usage,
        memory_usage,
        disk_io_rate,
        active_connections
    )
    SELECT 
        (SELECT EXTRACT(EPOCH FROM (now() - query_start)) 
         FROM pg_stat_activity 
         WHERE state = 'active'
         ORDER BY query_start 
         LIMIT 1) as cpu_usage,
        (SELECT pg_total_relation_size('review_system.reviews_partitioned') / 
         (1024*1024*1024.0)) as memory_usage,
        (SELECT blks_hit + blks_read FROM pg_stat_database 
         WHERE datname = current_database()) as disk_io_rate,
        (SELECT count(*) FROM pg_stat_activity 
         WHERE state = 'active') as active_connections;
END;
$$ LANGUAGE plpgsql; 