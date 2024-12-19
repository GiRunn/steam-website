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

-- 初始化可疑模式
INSERT INTO review_system.suspicious_patterns (pattern, description, severity) VALUES
('DELETE FROM .* WHERE', '批量删除操作', 'HIGH'),
('DROP TABLE', '删除表操作', 'HIGH'),
('TRUNCATE TABLE', '清空表操作', 'HIGH'),
('UPDATE .* WHERE', '批量更新操作', 'MEDIUM'),
('SELECT .* FROM .* WHERE.*OR.*=', '可能的SQL注入', 'HIGH'),
('UNION SELECT', '可能的SQL注入', 'HIGH'),
('INTO OUTFILE', '文件操作', 'HIGH'),
('SLEEP\([0-9]+\)', '时间延迟攻击', 'HIGH')
ON CONFLICT DO NOTHING;

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

    -- DDOS检测
    RETURN QUERY
    WITH connection_stats AS (
        SELECT 
            client_addr,
            COUNT(*) as conn_count,
            COUNT(*) FILTER (WHERE state = 'active') as active_count,
            MAX(EXTRACT(EPOCH FROM (now() - backend_start))) as session_duration
        FROM pg_stat_activity 
        WHERE client_addr IS NOT NULL
        GROUP BY client_addr
    )
    SELECT 
        '安全监控'::TEXT,
        'DDOS检测'::TEXT,
        COUNT(*) FILTER (WHERE conn_count > 50 OR active_count > 20)::NUMERIC,
        5.0,
        CASE 
            WHEN COUNT(*) FILTER (WHERE conn_count > 50 OR active_count > 20) > 5 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'suspicious_ips', (
                SELECT jsonb_agg(client_addr) 
                FROM connection_stats 
                WHERE conn_count > 50 OR active_count > 20
            ),
            'max_connections_per_ip', MAX(conn_count),
            'total_active_connections', SUM(active_count)
        )
    FROM connection_stats;

    -- SQL注入检测
    RETURN QUERY
    WITH suspicious_queries AS (
        SELECT 
            query,
            client_addr,
            usename,
            application_name,
            COUNT(*) OVER (PARTITION BY client_addr) as query_count
        FROM pg_stat_activity
        WHERE query ~* ANY(SELECT pattern FROM review_system.suspicious_patterns)
    )
    SELECT 
        '安全监控'::TEXT,
        'SQL注入检测'::TEXT,
        COUNT(*)::NUMERIC,
        0.0,
        CASE 
            WHEN COUNT(*) > 0 THEN '警告'
            ELSE '正常'
        END,
        jsonb_build_object(
            'suspicious_queries', (
                SELECT jsonb_agg(jsonb_build_object(
                    'query', query,
                    'ip', client_addr,
                    'user', usename,
                    'app', application_name
                ))
                FROM suspicious_queries
            )
        )
    FROM suspicious_queries;

    -- 性能异常检测
    RETURN QUERY
    SELECT 
        '性能监控'::TEXT,
        '查询性能异常'::TEXT,
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
                    'duration', EXTRACT(EPOCH FROM (now() - query_start)),
                    'query', query
                ))
                FROM pg_stat_activity
                WHERE state = 'active'
                AND query_start < now() - interval '5 minutes'
            ),
            'blocked_queries', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'blocked_by', waiting_pid,
                    'duration', EXTRACT(EPOCH FROM (now() - query_start))
                ))
                FROM (
                    SELECT pid, 
                           (SELECT pid FROM pg_stat_activity b 
                            WHERE b.pid = ANY(pg_blocking_pids(a.pid))) as waiting_pid,
                           query_start
                    FROM pg_stat_activity a
                    WHERE waiting
                ) blocked
            )
        );

    -- 资源使用监控
    RETURN QUERY
    SELECT 
        '资源监控'::TEXT,
        '系统资源使用'::TEXT,
        0::NUMERIC,
        0::NUMERIC,
        '信息'::TEXT,
        jsonb_build_object(
            'cpu_usage', (
                SELECT jsonb_build_object(
                    'user_time', SUM(user_time),
                    'system_time', SUM(system_time)
                )
                FROM pg_stat_database
                WHERE datname = current_database()
            ),
            'memory_usage', (
                SELECT jsonb_build_object(
                    'shared_buffers_used', pg_size_pretty(pg_current_wal_lsn() - '0/0'::pg_lsn),
                    'temp_files', COUNT(*),
                    'temp_bytes', pg_size_pretty(SUM(temp_bytes))
                )
                FROM pg_stat_database
                WHERE datname = current_database()
            )
        );

    -- 更多监控指标...

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
        '错误'::TEXT,
        '监控错误'::TEXT,
        0::NUMERIC,
        0::NUMERIC,
        '错误'::TEXT,
        jsonb_build_object(
            'error_message', SQLERRM,
            'error_detail', SQLSTATE,
            'error_hint', '请检查监控系统配置'
        );
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

-- 创建监控数据记录函数
CREATE OR REPLACE FUNCTION review_system.record_monitoring_data()
RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_history (metric_name, metric_value)
    SELECT metric_name, current_value
    FROM review_system.enhanced_monitor_metrics();
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