DO $$
BEGIN
    -- 设置共享缓冲区
    EXECUTE 'ALTER SYSTEM SET shared_buffers = ''1GB''';

    -- 设置工作内存
    EXECUTE 'ALTER SYSTEM SET work_mem = ''16MB''';

    -- 设置维护工作内存
    EXECUTE 'ALTER SYSTEM SET maintenance_work_mem = ''256MB''';

    -- 设置最大连接数
    EXECUTE 'ALTER SYSTEM SET max_connections = ''200''';

    -- 设置并行工作进程数
    EXECUTE 'ALTER SYSTEM SET max_parallel_workers = ''8''';

    -- 设置并行工作进程数（每个查询）
    EXECUTE 'ALTER SYSTEM SET max_parallel_workers_per_gather = ''4''';

    -- 设置有效IO并发数
    EXECUTE 'ALTER SYSTEM SET effective_io_concurrency = ''200''';

    -- 设置WAL级别
    EXECUTE 'ALTER SYSTEM SET wal_level = ''replica''';

    -- 设置检查点超时
    EXECUTE 'ALTER SYSTEM SET checkpoint_timeout = ''15min''';

    -- 设置最大WAL大小
    EXECUTE 'ALTER SYSTEM SET max_wal_size = ''2GB''';

    -- 设置最小WAL大小
    EXECUTE 'ALTER SYSTEM SET min_wal_size = ''1GB''';

    -- 重新加载配置
    PERFORM pg_reload_conf();
END $$; 