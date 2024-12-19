-- 创建监控架构（如果不存在）
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建监控历史表
CREATE TABLE IF NOT EXISTS review_system.monitoring_history (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建数据库监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_database_metrics()
RETURNS TABLE (
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT
) AS $$
BEGIN
    -- 数据库大小
    RETURN QUERY
    SELECT 
        'Database Size (MB)'::TEXT,
        pg_database_size(current_database())::NUMERIC / (1024*1024),
        10000.0,  -- 10GB警告阈值
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240 THEN '警告'
            ELSE '正常'
        END;

    -- 活动连接数
    RETURN QUERY
    SELECT 
        'Active Connections'::TEXT,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::NUMERIC,
        50.0,  -- 50个连接警告阈值
        CASE 
            WHEN count(*) > 50 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity;

    -- 缓存命中率
    RETURN QUERY
    SELECT 
        'Cache Hit Ratio (%)'::TEXT,
        CASE 
            WHEN blks_hit + blks_read = 0 THEN 0
            ELSE (blks_hit::NUMERIC / (blks_hit + blks_read) * 100)
        END,
        90.0,  -- 90%警告阈值
        CASE 
            WHEN (blks_hit::NUMERIC / (blks_hit + blks_read) * 100) < 90 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 事务提交率
    RETURN QUERY
    SELECT 
        'Transaction Commit Rate (%)'::TEXT,
        CASE 
            WHEN xact_commit + xact_rollback = 0 THEN 0
            ELSE (xact_commit::NUMERIC / (xact_commit + xact_rollback) * 100)
        END,
        95.0,  -- 95%警告阈值
        CASE 
            WHEN (xact_commit::NUMERIC / (xact_commit + xact_rollback) * 100) < 95 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 长时间运行的查询数
    RETURN QUERY
    SELECT 
        'Long Running Queries'::TEXT,
        COUNT(*)::NUMERIC,
        5.0,  -- 5个长查询警告阈值
        CASE 
            WHEN COUNT(*) > 5 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity
    WHERE state = 'active'
    AND NOW() - query_start > interval '5 minutes';

    -- 死锁数量
    RETURN QUERY
    SELECT 
        'Deadlocks'::TEXT,
        deadlocks::NUMERIC,
        10.0,  -- 10个死锁警告阈值
        CASE 
            WHEN deadlocks > 10 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 表扫描比率
    RETURN QUERY
    SELECT 
        'Sequential Scan Ratio (%)'::TEXT,
        CASE 
            WHEN seq_scan + idx_scan = 0 THEN 0
            ELSE (seq_scan::NUMERIC / (seq_scan + idx_scan) * 100)
        END,
        20.0,  -- 20%警告阈值
        CASE 
            WHEN (seq_scan::NUMERIC / (seq_scan + idx_scan) * 100) > 20 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_user_tables
    WHERE schemaname = 'review_system'
    ORDER BY seq_scan DESC
    LIMIT 1;

    -- 临时文件使用
    RETURN QUERY
    SELECT 
        'Temp File Usage (MB)'::TEXT,
        temp_bytes::NUMERIC / (1024*1024),
        100.0,  -- 100MB警告阈值
        CASE 
            WHEN temp_bytes > 104857600 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql;

-- 创建监控数据记录函数
CREATE OR REPLACE FUNCTION review_system.record_monitoring_data()
RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_history (metric_name, metric_value)
    SELECT metric_name, current_value
    FROM review_system.monitor_database_metrics();
END;
$$ LANGUAGE plpgsql;

-- 创建清理历史数据的函数
CREATE OR REPLACE FUNCTION review_system.cleanup_monitoring_history(days INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM review_system.monitoring_history
    WHERE recorded_at < NOW() - (days || ' days')::INTERVAL
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql; 