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
        '数据库大小 (MB)'::TEXT,
        pg_database_size(current_database())::NUMERIC / (1024*1024),
        10000.0,
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240 THEN '警告'
            ELSE '正常'
        END;

    -- 活动连接数
    RETURN QUERY
    SELECT 
        '活动连接数'::TEXT,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::NUMERIC,
        50.0,
        CASE 
            WHEN count(*) > 50 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity;

    -- 缓存命中率
    RETURN QUERY
    SELECT 
        '缓存命中率 (%)'::TEXT,
        CASE 
            WHEN COALESCE(blks_hit + blks_read, 0) = 0 THEN 0
            ELSE (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100)
        END,
        90.0,
        CASE 
            WHEN COALESCE(blks_hit + blks_read, 0) = 0 THEN '正常'
            WHEN (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100) < 90 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 事务提交率
    RETURN QUERY
    SELECT 
        '事务提交率 (%)'::TEXT,
        CASE 
            WHEN COALESCE(xact_commit + xact_rollback, 0) = 0 THEN 0
            ELSE (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100)
        END,
        95.0,
        CASE 
            WHEN COALESCE(xact_commit + xact_rollback, 0) = 0 THEN '正常'
            WHEN (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100) < 95 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 长时间运行的查询数
    RETURN QUERY
    SELECT 
        '长时间运行查询数'::TEXT,
        COUNT(*)::NUMERIC,
        5.0,
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
        '死锁数量'::TEXT,
        COALESCE(deadlocks, 0)::NUMERIC,
        10.0,
        CASE 
            WHEN COALESCE(deadlocks, 0) > 10 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 表扫描比率
    RETURN QUERY
    WITH scan_stats AS (
        SELECT 
            COALESCE(SUM(seq_scan), 0) as total_seq_scan,
            COALESCE(SUM(idx_scan), 0) as total_idx_scan
        FROM pg_stat_user_tables
        WHERE schemaname = 'review_system'
    )
    SELECT 
        '全表扫描比率 (%)'::TEXT,
        CASE 
            WHEN (total_seq_scan + total_idx_scan) = 0 THEN 0
            ELSE (total_seq_scan::NUMERIC / NULLIF(total_seq_scan + total_idx_scan, 0) * 100)
        END,
        20.0,
        CASE 
            WHEN (total_seq_scan + total_idx_scan) = 0 THEN '正常'
            WHEN (total_seq_scan::NUMERIC / NULLIF(total_seq_scan + total_idx_scan, 0) * 100) > 20 THEN '警告'
            ELSE '正常'
        END
    FROM scan_stats;

    -- 临时文件使用
    RETURN QUERY
    SELECT 
        '临时文件使用 (MB)'::TEXT,
        COALESCE(temp_bytes, 0)::NUMERIC / (1024*1024),
        100.0,
        CASE 
            WHEN COALESCE(temp_bytes, 0) > 104857600 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 新增：等待连接数
    RETURN QUERY
    SELECT 
        '等待连接数'::TEXT,
        COUNT(*)::NUMERIC,
        10.0,
        CASE 
            WHEN COUNT(*) > 10 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity 
    WHERE wait_event IS NOT NULL;

    -- 新增：数据库写入速率 (MB/s)
    RETURN QUERY
    WITH io_stats AS (
        SELECT 
            (tup_inserted + tup_updated + tup_deleted) * 1.0 / 
            NULLIF(EXTRACT(EPOCH FROM (now() - stats_reset)), 0) as write_rate
        FROM pg_stat_database
        WHERE datname = current_database()
    )
    SELECT 
        '写入速率 (操作/秒)'::TEXT,
        COALESCE(write_rate, 0)::NUMERIC,
        1000.0,
        CASE 
            WHEN write_rate > 1000 THEN '警告'
            ELSE '正常'
        END
    FROM io_stats;

    -- 新增：索引使用率
    RETURN QUERY
    SELECT 
        '索引使用率 (%)'::TEXT,
        CASE 
            WHEN COALESCE(idx_scan, 0) + COALESCE(seq_scan, 0) = 0 THEN 100
            ELSE (COALESCE(idx_scan, 0)::NUMERIC / 
                  NULLIF(COALESCE(idx_scan, 0) + COALESCE(seq_scan, 0), 0) * 100)
        END,
        80.0,
        CASE 
            WHEN (COALESCE(idx_scan, 0)::NUMERIC / 
                  NULLIF(COALESCE(idx_scan, 0) + COALESCE(seq_scan, 0), 0) * 100) < 80 
            THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_user_tables
    WHERE schemaname = 'review_system'
    ORDER BY idx_scan DESC
    LIMIT 1;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
        '错误'::TEXT,
        0::NUMERIC,
        0::NUMERIC,
        SQLERRM::TEXT;
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