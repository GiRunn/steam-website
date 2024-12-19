-- 创建监控架构（如果不存在）
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建监控历史表
CREATE TABLE IF NOT EXISTS review_system.monitoring_history (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加安全监控表
CREATE TABLE IF NOT EXISTS review_system.security_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    description TEXT,
    source_ip TEXT,
    user_name TEXT,
    query_text TEXT,
    severity TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加IP黑名单表
CREATE TABLE IF NOT EXISTS review_system.ip_blacklist (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加可疑SQL模式表
CREATE TABLE IF NOT EXISTS review_system.suspicious_patterns (
    id SERIAL PRIMARY KEY,
    pattern TEXT NOT NULL,
    description TEXT,
    severity TEXT
);

-- 创建增强版监控函数
CREATE OR REPLACE FUNCTION review_system.enhanced_monitor_metrics()
RETURNS TABLE (
    category TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT,
    details JSONB
) AS $$
BEGIN
    -- 基础性能指标
    RETURN QUERY
    SELECT 
        '基础性能'::TEXT,
        '数据库大小 (MB)'::TEXT,
        pg_database_size(current_database())::NUMERIC / (1024*1024),
        10000.0,
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'total_size', pg_size_pretty(pg_database_size(current_database())),
            'tables_count', (SELECT count(*) FROM pg_tables WHERE schemaname = 'review_system'),
            'growth_rate', '计算中'
        );

    -- 连接状态监控
    RETURN QUERY
    SELECT 
        '连接状态'::TEXT,
        '活动连接数'::TEXT,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::NUMERIC,
        50.0,
        CASE 
            WHEN count(*) > 50 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
            'idle_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
            'waiting_connections', (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL)
        )
    FROM pg_stat_activity;

    -- 缓存性能
    RETURN QUERY
    SELECT 
        '性能指标'::TEXT,
        '缓存命中率 (%)'::TEXT,
        CASE 
            WHEN COALESCE(blks_hit + blks_read, 0) = 0 THEN 100
            ELSE (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100)
        END,
        90.0,
        CASE 
            WHEN (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100) < 90 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'blocks_hit', blks_hit,
            'blocks_read', blks_read,
            'temp_files', temp_files,
            'temp_bytes', pg_size_pretty(temp_bytes::bigint)
        )
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 事务统计
    RETURN QUERY
    SELECT 
        '事务统计'::TEXT,
        '事务提交率 (%)'::TEXT,
        CASE 
            WHEN COALESCE(xact_commit + xact_rollback, 0) = 0 THEN 100
            ELSE (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100)
        END,
        95.0,
        CASE 
            WHEN (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100) < 95 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'commits', xact_commit,
            'rollbacks', xact_rollback,
            'deadlocks', deadlocks,
            'conflicts', conflicts
        )
    FROM pg_stat_database
    WHERE datname = current_database();

    -- 查询性能监控
    RETURN QUERY
    SELECT 
        '查询性能'::TEXT,
        '长时间运行查询'::TEXT,
        COUNT(*)::NUMERIC,
        5.0,
        CASE 
            WHEN COUNT(*) > 5 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'long_running_queries', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'duration', EXTRACT(EPOCH FROM (now() - query_start))::integer,
                    'state', state,
                    'query', query
                ))
                FROM pg_stat_activity
                WHERE state = 'active'
                AND query_start < now() - interval '5 minutes'
                AND query NOT LIKE '%pg_stat%'
            )
        )
    FROM pg_stat_activity
    WHERE state = 'active'
    AND query_start < now() - interval '5 minutes';

END;
$$ LANGUAGE plpgsql;

-- 创建监控数据记录函数
CREATE OR REPLACE FUNCTION review_system.record_monitoring_data()
RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_history (metric_name, metric_value)
    SELECT metric_name, current_value
    FROM review_system.enhanced_monitor_metrics();
END;
$$ LANGUAGE plpgsql;

-- 创建安全事件记录函数
CREATE OR REPLACE FUNCTION review_system.record_security_event(
    p_event_type TEXT,
    p_description TEXT,
    p_source_ip TEXT,
    p_user_name TEXT,
    p_query_text TEXT,
    p_severity TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.security_events (
        event_type, description, source_ip, user_name, query_text, severity
    ) VALUES (
        p_event_type, p_description, p_source_ip, p_user_name, p_query_text, p_severity
    );
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