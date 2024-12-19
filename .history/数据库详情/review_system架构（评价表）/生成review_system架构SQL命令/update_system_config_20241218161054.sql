-- 检查操作系统和硬件配置
DO $$
DECLARE
    v_os_type text;
    v_total_memory bigint;
BEGIN
    -- 获取操作系统类型
    SELECT setting INTO v_os_type FROM pg_settings WHERE name = 'os_type';
    
    -- 获取系统总内存 (以MB为单位)
    SELECT setting::bigint INTO v_total_memory FROM pg_settings WHERE name = 'shared_buffers';
    
    -- 根据操作系统和内存调整配置
    IF v_os_type = 'Windows' THEN
        -- Windows平台特定配置
        ALTER SYSTEM SET effective_io_concurrency = 0;  -- Windows不支持posix_fadvise
        ALTER SYSTEM SET shared_buffers = '1GB';        -- Windows建议值
        ALTER SYSTEM SET effective_cache_size = '3GB';  -- Windows建议值
    ELSE
        -- Linux/Unix平台配置
        ALTER SYSTEM SET effective_io_concurrency = 200;
        ALTER SYSTEM SET shared_buffers = '4GB';
        ALTER SYSTEM SET effective_cache_size = '12GB';
    END IF;
    
    -- 通用配置
    -- 内存相关
    ALTER SYSTEM SET work_mem = '64MB';
    ALTER SYSTEM SET maintenance_work_mem = '512MB';
    
    -- 查询优化器配置
    ALTER SYSTEM SET random_page_cost = 1.1;
    
    -- 写入性能优化
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET checkpoint_timeout = '15min';
    ALTER SYSTEM SET max_wal_size = '2GB';
    
    -- 并发配置
    ALTER SYSTEM SET max_connections = 100;             -- 降低以适应Windows
    ALTER SYSTEM SET max_parallel_workers_per_gather = 2;
    ALTER SYSTEM SET max_parallel_workers = 4;
    
    -- 缓存行为配置
    ALTER SYSTEM SET synchronous_commit = 'on';         -- 为安全起见改为on
    ALTER SYSTEM SET full_page_writes = 'on';          -- 为安全起见改为on
    
    -- 统计信息收集
    ALTER SYSTEM SET default_statistics_target = 500;   -- 降低以减少内存使用
    
    -- 记录配置更改
    RAISE NOTICE '数据库配置已更新完成';
    RAISE NOTICE '操作系统类型: %', v_os_type;
    RAISE NOTICE '系统内存: % MB', v_total_memory;
END $$;

-- 重新加载配置
SELECT pg_reload_conf(); 