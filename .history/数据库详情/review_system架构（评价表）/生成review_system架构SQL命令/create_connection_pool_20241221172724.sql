-- 创建连接池配置表
CREATE TABLE IF NOT EXISTS review_system.connection_pool_config (
    config_id SERIAL PRIMARY KEY,
    pool_name VARCHAR(50) NOT NULL,
    min_connections INTEGER NOT NULL DEFAULT 5,
    max_connections INTEGER NOT NULL DEFAULT 20,
    idle_timeout INTEGER NOT NULL DEFAULT 300,
    max_lifetime INTEGER NOT NULL DEFAULT 1800,
    connection_timeout INTEGER NOT NULL DEFAULT 30,
    validation_timeout INTEGER NOT NULL DEFAULT 5,
    leak_detection_threshold INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建连接监控表
CREATE TABLE IF NOT EXISTS review_system.connection_monitoring (
    monitor_id SERIAL PRIMARY KEY,
    pool_name VARCHAR(50) NOT NULL,
    active_connections INTEGER NOT NULL,
    idle_connections INTEGER NOT NULL,
    waiting_threads INTEGER NOT NULL,
    total_connections INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建连接泄露检测函数
CREATE OR REPLACE FUNCTION review_system.detect_connection_leaks()
RETURNS TABLE (
    connection_id INTEGER,
    duration INTEGER,
    query TEXT,
    application_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pid::INTEGER as connection_id,
        EXTRACT(EPOCH FROM (now() - query_start))::INTEGER as duration,
        query,
        application_name
    FROM pg_stat_activity
    WHERE state != 'idle'
    AND query_start < (now() - interval '1 hour');
END;
$$ LANGUAGE plpgsql;

-- 创建连接池清理函数
CREATE OR REPLACE FUNCTION review_system.cleanup_stale_connections()
RETURNS void AS $$
BEGIN
    -- 终止空闲超过1小时的连接
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND query_start < (now() - interval '1 hour');
    
    -- 终止运行超过2小时的查询
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'active'
    AND query_start < (now() - interval '2 hours');
END;
$$ LANGUAGE plpgsql; 