-- 创建监控函数和表
CREATE SCHEMA IF NOT EXISTS admin_monitor;

-- 性能指标表
CREATE TABLE admin_monitor.performance_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value NUMERIC(12,2),
    metric_unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 系统资源监控函数
CREATE OR REPLACE FUNCTION admin_monitor.get_system_metrics() 
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_unit TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'active_connections'::TEXT,
        (SELECT count(*) FROM pg_stat_activity)::NUMERIC,
        'count'::TEXT,
        'Current active database connections'::TEXT
    UNION ALL
    SELECT 
        'cache_hit_ratio'::TEXT,
        (SELECT round(blks_hit * 100.0 / (blks_hit + blks_read), 2) 
         FROM pg_stat_database 
         WHERE datname = current_database()),
        'percent'::TEXT,
        'Percentage of cache hits'::TEXT
    UNION ALL
    SELECT 
        'database_size'::TEXT,
        (SELECT pg_database_size(current_database()) / 1024.0 / 1024.0),
        'MB'::TEXT,
        'Current database size'::TEXT
    UNION ALL
    SELECT 
        'table_count'::TEXT,
        (SELECT count(*) FROM information_schema.tables 
         WHERE table_schema NOT IN ('pg_catalog', 'information_schema')),
        'count'::TEXT,
        'Number of user tables'::TEXT
    UNION ALL
    SELECT 
        'avg_query_time'::TEXT,
        (SELECT round(avg(total_time / calls), 2) 
         FROM pg_stat_statements 
         WHERE calls > 0),
        'ms'::TEXT,
        'Average query execution time'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 插入性能指标的存储过程
CREATE OR REPLACE PROCEDURE admin_monitor.log_performance_metrics() AS $$
DECLARE
    v_metric RECORD;
BEGIN
    FOR v_metric IN 
        SELECT * FROM admin_monitor.get_system_metrics()
    LOOP
        INSERT INTO admin_monitor.performance_metrics (
            metric_name, metric_value, metric_unit
        ) VALUES (
            v_metric.metric_name, 
            v_metric.metric_value, 
            v_metric.metric_unit
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务记录性能指标
CREATE OR REPLACE FUNCTION admin_monitor.schedule_performance_logging()
RETURNS TRIGGER AS $$
BEGIN
    CALL admin_monitor.log_performance_metrics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 