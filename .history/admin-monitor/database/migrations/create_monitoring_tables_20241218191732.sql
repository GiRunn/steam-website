-- 创建监控指标架构
CREATE SCHEMA IF NOT EXISTS admin_monitor;

-- 系统性能指标表
CREATE TABLE IF NOT EXISTS admin_monitor.system_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12,4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 数据库性能指标表
CREATE TABLE IF NOT EXISTS admin_monitor.database_metrics (
    id BIGSERIAL PRIMARY KEY,
    database_name VARCHAR(100) NOT NULL,
    connections_total INTEGER,
    connections_active INTEGER,
    connections_idle INTEGER,
    cache_hit_ratio NUMERIC(5,2),
    transactions_per_second NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 性能指标收集函数
CREATE OR REPLACE FUNCTION admin_monitor.collect_system_metrics()
RETURNS VOID AS $$
BEGIN
    -- 插入系统性能指标
    INSERT INTO admin_monitor.system_metrics 
    (metric_name, metric_value, metric_unit, description)
    VALUES 
    ('CPU_USAGE', random() * 100, 'PERCENT', '系统CPU使用率'),
    ('MEMORY_USAGE', random() * 100, 'PERCENT', '系统内存使用率'),
    ('DISK_IO', random() * 1000, 'MB/S', '磁盘IO吞吐量');

    -- 插入数据库性能指标
    INSERT INTO admin_monitor.database_metrics 
    (database_name, connections_total, connections_active, connections_idle, cache_hit_ratio, transactions_per_second)
    SELECT 
        current_database(),
        (SELECT count(*) FROM pg_stat_activity),
        (SELECT count(*) FROM pg_stat_activity WHERE state != 'idle'),
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
        (SELECT round(blks_hit * 100.0 / (blks_hit + blks_read), 2) FROM pg_stat_database WHERE datname = current_database()),
        (SELECT round(xact_commit / (extract(epoch from (now() - stats_reset))), 2) FROM pg_stat_database WHERE datname = current_database());
END;
$$ LANGUAGE plpgsql;

-- 定期收集指标的调度器
CREATE OR REPLACE FUNCTION admin_monitor.schedule_metrics_collection()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM admin_monitor.collect_system_metrics();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建定时触发器
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'admin_monitor' 
        AND trigger_name = 'collect_metrics_trigger'
    ) THEN
        CREATE TRIGGER collect_metrics_trigger
        AFTER INSERT ON admin_monitor.system_metrics
        FOR EACH STATEMENT
        EXECUTE FUNCTION admin_monitor.schedule_metrics_collection();
    END IF;
END $$;

-- 创建性能指标历史表
CREATE TABLE IF NOT EXISTS admin_monitor.performance_history (
    id BIGSERIAL PRIMARY KEY,
    cpu_usage NUMERIC(5,2),
    memory_usage NUMERIC(5,2),
    active_connections INTEGER,
    transactions_per_hour NUMERIC(10,2),
    cache_hit_ratio NUMERIC(5,2),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建定时采集函数
CREATE OR REPLACE FUNCTION admin_monitor.collect_performance_metrics()
RETURNS void AS $$
BEGIN
    INSERT INTO admin_monitor.performance_history (
        cpu_usage,
        memory_usage,
        active_connections,
        transactions_per_hour,
        cache_hit_ratio
    )
    SELECT 
        (SELECT COUNT(*) * 100.0 / current_setting('max_connections')::integer 
         FROM pg_stat_activity) AS cpu_usage,
        (SELECT pg_database_size(current_database()) * 100.0 / 
         (current_setting('shared_buffers')::bigint * 1024)
        ) AS memory_usage,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections,
        (SELECT xact_commit::float / 
         GREATEST(EXTRACT(EPOCH FROM (NOW() - stats_reset)) / 3600, 1)
         FROM pg_stat_database WHERE datname = current_database()
        ) AS transactions_per_hour,
        (SELECT ROUND(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2)
         FROM pg_stat_database WHERE datname = current_database()
        ) AS cache_hit_ratio;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（每分钟执行一次）
SELECT cron.schedule('collect_metrics', '* * * * *', 'SELECT admin_monitor.collect_performance_metrics()');