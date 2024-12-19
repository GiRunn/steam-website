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

-- 重新加载配置
SELECT pg_reload_conf(); 