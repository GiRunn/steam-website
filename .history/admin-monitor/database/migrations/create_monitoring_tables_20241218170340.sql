-- 创建监控指标架构
CREATE SCHEMA IF NOT EXISTS admin_monitor;

-- 系统性能指标表
CREATE TABLE admin_monitor.system_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12,4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 数据库性能指标表
CREATE TABLE admin_monitor.database_metrics (
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
    ('CPU_USAGE', pg_system_cpu_usage(), 'PERCENT', '系统CPU使用率'),
    ('MEMORY_USAGE', pg_system_memory_usage(), 'PERCENT', '系统内存使用率'),
    ('DISK_IO', pg_system_disk_io(), 'MB/S', '磁盘IO吞吐量');

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