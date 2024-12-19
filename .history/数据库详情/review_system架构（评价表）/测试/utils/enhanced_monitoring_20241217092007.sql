-- 修改测试结果表结构
DROP TABLE IF EXISTS review_system.test_results CASCADE;
CREATE TABLE review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    test_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    execution_time INTERVAL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建增强版监控表
CREATE TABLE IF NOT EXISTS review_system.monitoring_metrics (
    id SERIAL PRIMARY KEY,
    test_name TEXT,
    test_phase TEXT,
    metric_category TEXT,
    metric_name TEXT,
    metric_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT,
    details JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建性能指标历史表
CREATE TABLE IF NOT EXISTS review_system.performance_history (
    id SERIAL PRIMARY KEY,
    test_id INTEGER,
    cpu_usage NUMERIC,
    memory_usage NUMERIC,
    disk_io_read BIGINT,
    disk_io_write BIGINT,
    network_traffic_in BIGINT,
    network_traffic_out BIGINT,
    active_connections INTEGER,
    waiting_connections INTEGER,
    deadlock_count INTEGER,
    lock_wait_time INTERVAL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试异常记录表
CREATE TABLE IF NOT EXISTS review_system.test_anomalies (
    id SERIAL PRIMARY KEY,
    test_id INTEGER,
    anomaly_type TEXT,
    severity TEXT,
    description TEXT,
    stack_trace TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建资源使用监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_resource_usage(
    p_test_id INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.performance_history (
        test_id,
        cpu_usage,
        memory_usage,
        disk_io_read,
        disk_io_write,
        network_traffic_in,
        network_traffic_out,
        active_connections,
        waiting_connections,
        deadlock_count,
        lock_wait_time
    )
    SELECT 
        p_test_id,
        (SELECT COALESCE(cpu_usage, 0) FROM pg_stat_activity WHERE pid = pg_backend_pid()),
        (SELECT COALESCE(total_exec_time, 0) FROM pg_stat_statements WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user) LIMIT 1),
        (SELECT COALESCE(blks_read, 0) FROM pg_stat_database WHERE datname = current_database()),
        (SELECT COALESCE(blks_written, 0) FROM pg_stat_database WHERE datname = current_database()),
        (SELECT COALESCE(recv_bytes, 0) FROM pg_stat_database WHERE datname = current_database()),
        (SELECT COALESCE(sent_bytes, 0) FROM pg_stat_database WHERE datname = current_database()),
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
        (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL),
        (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()),
        (SELECT COALESCE(max(now() - xact_start), '0 seconds'::interval) FROM pg_stat_activity WHERE wait_event_type = 'Lock');
END;
$$ LANGUAGE plpgsql;

-- 创建查询性能监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_query_performance(
    p_test_id INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_metrics (
        test_id,
        metric_category,
        metric_name,
        metric_value,
        threshold_value,
        status,
        details
    )
    SELECT 
        p_test_id,
        'Query Performance',
        'Long Running Queries',
        COUNT(*),
        5.0,
        CASE WHEN COUNT(*) > 5 THEN 'Warning' ELSE 'Normal' END,
        jsonb_build_object(
            'queries', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'query', query,
                    'duration', EXTRACT(EPOCH FROM (now() - query_start)),
                    'state', state,
                    'wait_event', wait_event
                ))
                FROM pg_stat_activity
                WHERE state = 'active'
                AND query_start < now() - interval '5 seconds'
                AND query NOT LIKE '%pg_stat%'
            )
        )
    FROM pg_stat_activity
    WHERE state = 'active'
    AND query_start < now() - interval '5 seconds';
END;
$$ LANGUAGE plpgsql;

-- 创建锁监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_locks(
    p_test_id INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_metrics (
        test_id,
        metric_category,
        metric_name,
        metric_value,
        threshold_value,
        status,
        details
    )
    SELECT 
        p_test_id,
        'Lock Statistics',
        'Lock Conflicts',
        COUNT(*),
        10.0,
        CASE WHEN COUNT(*) > 10 THEN 'Warning' ELSE 'Normal' END,
        jsonb_build_object(
            'locks', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'lock_type', locktype,
                    'relation', relation::regclass::text,
                    'mode', mode,
                    'granted', granted,
                    'wait_start', wait_start
                ))
                FROM pg_locks l
                JOIN pg_stat_activity a ON l.pid = a.pid
                WHERE NOT granted
            )
        )
    FROM pg_locks
    WHERE NOT granted;
END;
$$ LANGUAGE plpgsql;

-- 创建连接监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_connections(
    p_test_id INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.monitoring_metrics (
        test_id,
        metric_category,
        metric_name,
        metric_value,
        threshold_value,
        status,
        details
    )
    SELECT 
        p_test_id,
        'Connection Statistics',
        'Active Connections',
        COUNT(*),
        100.0,
        CASE WHEN COUNT(*) > 100 THEN 'Warning' ELSE 'Normal' END,
        jsonb_build_object(
            'connections', (
                SELECT jsonb_agg(jsonb_build_object(
                    'pid', pid,
                    'state', state,
                    'wait_event', wait_event,
                    'client_addr', client_addr,
                    'application_name', application_name,
                    'backend_start', backend_start,
                    'xact_start', xact_start,
                    'query_start', query_start
                ))
                FROM pg_stat_activity
                WHERE state IS NOT NULL
            )
        )
    FROM pg_stat_activity;
END;
$$ LANGUAGE plpgsql;

-- 创建主监控函数
CREATE OR REPLACE FUNCTION review_system.start_monitoring(
    p_test_name TEXT,
    p_interval INTEGER DEFAULT 1  -- 监控间隔（秒）
) RETURNS INTEGER AS $$
DECLARE
    v_test_id INTEGER;
BEGIN
    -- 创建测试记录
    INSERT INTO review_system.test_results (
        test_name,
        test_category,
        status,
        started_at
    ) VALUES (
        p_test_name,
        '性能监控',
        'Running',
        CURRENT_TIMESTAMP
    ) RETURNING test_id INTO v_test_id;

    -- 启动定期监控
    PERFORM pg_notify(
        'monitoring_channel',
        json_build_object(
            'test_id', v_test_id,
            'interval', p_interval
        )::text
    );

    RETURN v_test_id;
END;
$$ LANGUAGE plpgsql;

-- 创建监控报告生成函数
CREATE OR REPLACE FUNCTION review_system.generate_monitoring_report(
    p_test_id INTEGER
) RETURNS TEXT AS $$
DECLARE
    v_report TEXT;
BEGIN
    WITH test_summary AS (
        SELECT 
            test_name,
            started_at,
            ended_at,
            status,
            error_message
        FROM review_system.test_results
        WHERE test_id = p_test_id
    ),
    performance_summary AS (
        SELECT 
            round(avg(cpu_usage), 2) as avg_cpu,
            round(avg(memory_usage), 2) as avg_memory,
            round(max(cpu_usage), 2) as max_cpu,
            round(max(memory_usage), 2) as max_memory,
            round(avg(active_connections), 0) as avg_connections,
            max(active_connections) as max_connections,
            sum(deadlock_count) as total_deadlocks
        FROM review_system.performance_history
        WHERE test_id = p_test_id
    ),
    anomaly_summary AS (
        SELECT 
            anomaly_type,
            severity,
            count(*) as occurrence_count
        FROM review_system.test_anomalies
        WHERE test_id = p_test_id
        GROUP BY anomaly_type, severity
    )
    SELECT format(
        E'测试监控报告\n' ||
        E'====================\n' ||
        E'测试名称: %s\n' ||
        E'开始时间: %s\n' ||
        E'结束时间: %s\n' ||
        E'状态: %s\n' ||
        E'\n性能统计\n' ||
        E'--------------------\n' ||
        E'平均CPU使用率: %s%%\n' ||
        E'最大CPU使用率: %s%%\n' ||
        E'平均内存使用率: %s%%\n' ||
        E'最大内存使用率: %s%%\n' ||
        E'平均连接数: %s\n' ||
        E'最大连接数: %s\n' ||
        E'死锁总数: %s\n' ||
        E'\n异常统计\n' ||
        E'--------------------\n%s',
        test_name,
        started_at,
        ended_at,
        status,
        avg_cpu,
        max_cpu,
        avg_memory,
        max_memory,
        avg_connections,
        max_connections,
        total_deadlocks,
        string_agg(
            format(E'%s (%s): %s次\n', 
                   anomaly_type, severity, occurrence_count),
            ''
        )
    )
    INTO v_report
    FROM test_summary, performance_summary
    LEFT JOIN anomaly_summary ON true;

    RETURN v_report;
END;
$$ LANGUAGE plpgsql; 