-- 创建数据库性能监控函数集

-- 1. 获取数据库连接状态
CREATE OR REPLACE FUNCTION admin_monitor.get_connection_status()
RETURNS TABLE (
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    max_connections INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM pg_stat_activity),
        (SELECT count(*) FROM pg_stat_activity WHERE state != 'idle'),
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
        current_setting('max_connections')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 2. 获取数据库性能指标
CREATE OR REPLACE FUNCTION admin_monitor.get_database_performance()
RETURNS TABLE (
    database_name TEXT,
    total_transactions BIGINT,
    transactions_per_second NUMERIC,
    cache_hit_ratio NUMERIC,
    index_hit_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        datname,
        xact_commit + xact_rollback,
        (xact_commit + xact_rollback) / 
            GREATEST(EXTRACT(EPOCH FROM (NOW() - stats_reset)), 1),
        blks_hit * 100.0 / GREATEST(blks_hit + blks_read, 1),
        idx_blks_hit * 100.0 / GREATEST(idx_blks_hit + idx_blks_read, 1)
    FROM pg_stat_database
    WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql;

-- 3. 获取表级性能指标
CREATE OR REPLACE FUNCTION admin_monitor.get_table_performance()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    total_scans BIGINT,
    sequential_scans BIGINT,
    index_scans BIGINT,
    rows_returned BIGINT,
    rows_inserted BIGINT,
    rows_updated BIGINT,
    rows_deleted BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname,
        relname,
        seq_scan + idx_scan,
        seq_scan,
        idx_scan,
        n_live_tup,
        n_inserted,
        n_updated,
        n_deleted
    FROM pg_stat_user_tables
    ORDER BY (seq_scan + idx_scan) DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 4. 获取慢查询
CREATE OR REPLACE FUNCTION admin_monitor.get_slow_queries(
    threshold_ms INTEGER DEFAULT 1000
)
RETURNS TABLE (
    query TEXT,
    duration INTERVAL,
    start_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        (NOW() - query_start) AS duration,
        query_start
    FROM pg_stat_activity
    WHERE state = 'active'
    AND (NOW() - query_start) > (threshold_ms || ' milliseconds')::INTERVAL
    ORDER BY duration DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql; 