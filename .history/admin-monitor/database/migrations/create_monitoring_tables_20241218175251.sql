-- 创建监控架构
CREATE SCHEMA IF NOT EXISTS admin_monitor;

-- 系统性能指标历史表
CREATE TABLE IF NOT EXISTS admin_monitor.performance_history (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 系统异常记录表
CREATE TABLE IF NOT EXISTS admin_monitor.system_anomalies (
    id SERIAL PRIMARY KEY,
    anomaly_type TEXT,
    description TEXT,
    severity TEXT,
    details JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 性能指标收集函数
CREATE OR REPLACE FUNCTION admin_monitor.collect_system_metrics()
RETURNS VOID AS $$
BEGIN
    -- CPU使用率（模拟）
    INSERT INTO admin_monitor.performance_history 
    (metric_name, metric_value, metric_unit)
    VALUES 
    ('CPU_USAGE', random() * 100, 'PERCENT'),
    ('MEMORY_USAGE', random() * 100, 'PERCENT'),
    ('DISK_IO', random() * 1000, 'MB/S'),
    ('CONNECTIONS_TOTAL', (SELECT count(*) FROM pg_stat_activity), 'COUNT'),
    ('CONNECTIONS_ACTIVE', (SELECT count(*) FROM pg_stat_activity WHERE state != 'idle'), 'COUNT');
END;
$$ LANGUAGE plpgsql;

-- 异常检测函数
CREATE OR REPLACE FUNCTION admin_monitor.detect_system_anomalies()
RETURNS VOID AS $$
DECLARE
    v_active_connections INTEGER;
    v_cpu_usage NUMERIC;
BEGIN
    -- 获取当前活动连接数
    v_active_connections := (SELECT count(*) FROM pg_stat_activity WHERE state != 'idle');
    
    -- 获取CPU使用率（这里是模拟）
    v_cpu_usage := random() * 100;

    -- 检测高负载情况
    IF v_active_connections > 50 THEN
        INSERT INTO admin_monitor.system_anomalies 
        (anomaly_type, description, severity, details)
        VALUES (
            'HIGH_CONNECTIONS', 
            '活动连接数异常高',
            'WARNING',
            jsonb_build_object(
                'active_connections', v_active_connections,
                'threshold', 50
            )
        );
    END IF;

    -- 检测高CPU使用率
    IF v_cpu_usage > 80 THEN
        INSERT INTO admin_monitor.system_anomalies 
        (anomaly_type, description, severity, details)
        VALUES (
            'HIGH_CPU_USAGE', 
            'CPU使用率过高',
            'CRITICAL',
            jsonb_build_object(
                'cpu_usage', v_cpu_usage,
                'threshold', 80
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 定期执行指标收集和异常检测
CREATE OR REPLACE FUNCTION admin_monitor.periodic_monitoring()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM admin_monitor.collect_system_metrics();
    PERFORM admin_monitor.detect_system_anomalies();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'admin_monitor' 
        AND trigger_name = 'periodic_monitoring_trigger'
    ) THEN
        CREATE TRIGGER periodic_monitoring_trigger
        AFTER INSERT ON admin_monitor.performance_history
        FOR EACH STATEMENT
        EXECUTE FUNCTION admin_monitor.periodic_monitoring();
    END IF;
END $$;