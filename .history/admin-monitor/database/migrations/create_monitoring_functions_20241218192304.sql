-- 创建收集CPU使用率的函数
CREATE OR REPLACE FUNCTION review_system.collect_cpu_usage()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.cpu_usage_history (usage_percent, database_name)
    SELECT 
        (SELECT COALESCE(value, 0) FROM pg_sysinfo WHERE name = 'cpu_usage'),
        current_database();
END;
$$ LANGUAGE plpgsql;

-- 创建收集内存使用情况的函数
CREATE OR REPLACE FUNCTION review_system.collect_memory_usage()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.memory_usage_history (
        total_memory, used_memory, free_memory, database_name
    )
    SELECT 
        pg_total_relation_size(current_database()::text),
        pg_database_size(current_database()),
        pg_total_relation_size(current_database()::text) - pg_database_size(current_database()),
        current_database();
END;
$$ LANGUAGE plpgsql;

-- 创建收集连接数的函数
CREATE OR REPLACE FUNCTION review_system.collect_connection_stats()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.connection_history (
        total_connections, active_connections, idle_connections, database_name
    )
    SELECT 
        count(*),
        count(*) FILTER (WHERE state = 'active'),
        count(*) FILTER (WHERE state = 'idle'),
        current_database()
    FROM pg_stat_activity;
END;
$$ LANGUAGE plpgsql;

-- 创建收集事务处理情况的函数
CREATE OR REPLACE FUNCTION review_system.collect_transaction_stats()
RETURNS void AS $$
DECLARE
    v_prev_commits BIGINT;
    v_prev_rollbacks BIGINT;
    v_prev_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 获取上一次的统计数据
    SELECT xact_commit, xact_rollback, collected_at 
    INTO v_prev_commits, v_prev_rollbacks, v_prev_time
    FROM review_system.transaction_history 
    WHERE database_name = current_database()
    ORDER BY collected_at DESC 
    LIMIT 1;

    -- 插入新的统计数据
    INSERT INTO review_system.transaction_history (
        xact_commit, xact_rollback, tps, database_name
    )
    SELECT 
        xact_commit,
        xact_rollback,
        CASE 
            WHEN v_prev_time IS NOT NULL THEN
                (xact_commit - v_prev_commits + xact_rollback - v_prev_rollbacks)::float / 
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_prev_time))
            ELSE 0
        END,
        current_database()
    FROM pg_stat_database
    WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql;

-- 创建收集查询性能的函数
CREATE OR REPLACE FUNCTION review_system.collect_query_performance()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.query_performance_history (
        avg_query_time, max_query_time, min_query_time, total_queries, database_name
    )
    SELECT 
        avg(total_time) / NULLIF(calls, 0),
        max(total_time) / NULLIF(calls, 0),
        min(total_time) / NULLIF(calls, 0),
        sum(calls),
        current_database()
    FROM pg_stat_statements
    WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database());
END;
$$ LANGUAGE plpgsql;

-- 创建收集缓存命中率的函数
CREATE OR REPLACE FUNCTION review_system.collect_cache_hit_ratio()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.cache_hit_history (
        cache_hit_ratio, buffer_hit_ratio, database_name
    )
    SELECT 
        (heap_blks_hit * 100.0 / NULLIF(heap_blks_hit + heap_blks_read, 0)),
        (blks_hit * 100.0 / NULLIF(blks_hit + blks_read, 0)),
        current_database()
    FROM pg_statio_user_tables, pg_stat_database
    WHERE datname = current_database()
    GROUP BY datname;
END;
$$ LANGUAGE plpgsql;

-- 创建主收集函数
CREATE OR REPLACE FUNCTION review_system.collect_all_metrics()
RETURNS void AS $$
BEGIN
    PERFORM review_system.collect_cpu_usage();
    PERFORM review_system.collect_memory_usage();
    PERFORM review_system.collect_connection_stats();
    PERFORM review_system.collect_transaction_stats();
    PERFORM review_system.collect_query_performance();
    PERFORM review_system.collect_cache_hit_ratio();
END;
$$ LANGUAGE plpgsql; 