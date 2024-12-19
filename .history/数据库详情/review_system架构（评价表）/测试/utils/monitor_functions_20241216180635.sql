-- 创建监控函数
CREATE OR REPLACE FUNCTION review_system.enhanced_monitor_metrics()
RETURNS TABLE (
    category TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT,
    details JSONB
) AS $monitor$
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
            'waiting_connections', (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL),
            'connection_details', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'state', state,
                    'wait_event', wait_event,
                    'duration', EXTRACT(EPOCH FROM (now() - state_change))::integer
                ))
                FROM pg_stat_activity
                WHERE state = 'active'
                LIMIT 5
            )
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
            'temp_bytes', pg_size_pretty(temp_bytes::bigint),
            'cache_effectiveness', (
                SELECT jsonb_build_object(
                    'shared_buffers_hit_ratio', 
                    (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100)::numeric(5,2),
                    'shared_buffers_usage',
                    pg_size_pretty((SELECT setting::bigint * 8192 FROM pg_settings WHERE name = 'shared_buffers'))
                )
            )
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
            'conflicts', conflicts,
            'transaction_details', (
                SELECT jsonb_build_object(
                    'oldest_transaction_age', 
                    EXTRACT(EPOCH FROM (now() - (SELECT backend_start FROM pg_stat_activity ORDER BY backend_start LIMIT 1)))::integer,
                    'active_transactions',
                    (SELECT count(*) FROM pg_stat_activity WHERE xact_start IS NOT NULL)
                )
            )
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
            ),
            'query_stats', (
                SELECT jsonb_build_object(
                    'total_active', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
                    'avg_duration', (
                        SELECT EXTRACT(EPOCH FROM avg(now() - query_start))::integer 
                        FROM pg_stat_activity 
                        WHERE state = 'active' AND query_start IS NOT NULL
                    )
                )
            )
        )
    FROM pg_stat_activity
    WHERE state = 'active'
    AND query_start < now() - interval '5 minutes';

END;
$monitor$ LANGUAGE plpgsql; 