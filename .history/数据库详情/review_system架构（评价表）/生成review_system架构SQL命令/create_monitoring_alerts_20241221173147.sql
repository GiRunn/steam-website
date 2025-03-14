-- 创建告警规则表
CREATE TABLE IF NOT EXISTS review_system.alert_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    threshold_value NUMERIC NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    is_active BOOLEAN DEFAULT true,
    cooldown_minutes INTEGER DEFAULT 60,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    escalation_interval INTEGER DEFAULT 30,
    escalation_contacts JSONB,
    max_escalation_level INTEGER DEFAULT 3
);

-- 创建告警历史表
CREATE TABLE IF NOT EXISTS review_system.alert_history (
    alert_id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES review_system.alert_rules(rule_id),
    metric_value NUMERIC NOT NULL,
    alert_status VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建检查告警的函数
CREATE OR REPLACE FUNCTION review_system.check_alerts()
RETURNS void AS $$
DECLARE
    v_rule record;
    v_metric_value numeric;
    v_should_trigger boolean;
BEGIN
    FOR v_rule IN 
        SELECT * FROM review_system.alert_rules 
        WHERE is_active = true 
        AND (last_triggered_at IS NULL OR 
             last_triggered_at < CURRENT_TIMESTAMP - (cooldown_minutes || ' minutes')::interval)
    LOOP
        -- 获取度量值
        BEGIN
            EXECUTE format(
                'SELECT %s FROM review_system.system_metrics_history ORDER BY recorded_at DESC LIMIT 1',
                v_rule.metric_name
            ) INTO v_metric_value;
            
            IF v_metric_value IS NOT NULL THEN
                -- 检查阈值
                v_should_trigger := CASE v_rule.comparison_operator
                    WHEN '>' THEN v_metric_value > v_rule.threshold_value
                    WHEN '<' THEN v_metric_value < v_rule.threshold_value
                    WHEN '>=' THEN v_metric_value >= v_rule.threshold_value
                    WHEN '<=' THEN v_metric_value <= v_rule.threshold_value
                    WHEN '=' THEN v_metric_value = v_rule.threshold_value
                    ELSE false
                END;
                
                IF v_should_trigger THEN
                    -- 插入告警历史
                    INSERT INTO review_system.alert_history (
                        rule_id, 
                        metric_value, 
                        alert_status,
                        severity,
                        message
                    ) VALUES (
                        v_rule.rule_id, 
                        v_metric_value, 
                        'TRIGGERED',
                        v_rule.severity,
                        format(v_rule.alert_message, v_metric_value, v_rule.threshold_value)
                    );
                    
                    -- 更新规则的最后触发时间
                    UPDATE review_system.alert_rules 
                    SET last_triggered_at = CURRENT_TIMESTAMP
                    WHERE rule_id = v_rule.rule_id;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- 记录错误但继续检查其他规则
            RAISE WARNING '检查告警规则 % 时出错: %', v_rule.rule_name, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建告警确认函数
CREATE OR REPLACE FUNCTION review_system.acknowledge_alert(
    p_alert_id INTEGER,
    p_acknowledged_by TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE review_system.alert_history
    SET 
        acknowledged = true,
        acknowledged_by = p_acknowledged_by,
        acknowledged_at = CURRENT_TIMESTAMP
    WHERE alert_id = p_alert_id
    AND acknowledged = false;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 添加告警通知渠道配置
CREATE TABLE review_system.alert_channels (
    channel_id SERIAL PRIMARY KEY,
    channel_type VARCHAR(50) NOT NULL,
    channel_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加告警模板
CREATE TABLE review_system.alert_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加性能监控
CREATE OR REPLACE FUNCTION review_system.monitor_performance()
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.system_metrics_history (
        cpu_usage,
        memory_usage,
        active_connections,
        database_size_bytes
    )
    SELECT 
        (SELECT ROUND(CAST(count(*) AS numeric) * 100 / max_connections, 2)
         FROM pg_stat_activity) as cpu_usage,
        (SELECT ROUND(sum(total_bytes) * 100.0 / (SELECT setting::bigint * 1024 
         FROM pg_settings WHERE name = 'shared_buffers'), 2)
         FROM pg_stat_bgwriter) as memory_usage,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        pg_database_size(current_database()) as database_size_bytes;
END;
$$ LANGUAGE plpgsql;

-- 添加性能监控阈值
CREATE TABLE review_system.performance_thresholds (
    threshold_id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    warning_threshold NUMERIC,
    critical_threshold NUMERIC,
    check_interval INTEGER DEFAULT 300, -- 5分钟
    last_check TIMESTAMP WITH TIME ZONE,
    UNIQUE (metric_name)
);

-- 插入默认阈值
INSERT INTO review_system.performance_thresholds 
(metric_name, warning_threshold, critical_threshold) VALUES
('cpu_usage', 75, 90),
('memory_usage', 80, 95),
('active_connections', 70, 85),
('response_time', 1000, 3000),
('deadlock_count', 5, 10)
ON CONFLICT (metric_name) DO NOTHING;

-- 创建性能监控检查函数
CREATE OR REPLACE FUNCTION review_system.check_performance_metrics()
RETURNS void AS $$
DECLARE
    v_threshold record;
    v_current_value numeric;
BEGIN
    FOR v_threshold IN 
        SELECT * FROM review_system.performance_thresholds
        WHERE last_check IS NULL 
        OR last_check < CURRENT_TIMESTAMP - (check_interval || ' seconds')::interval
    LOOP
        -- 获取当前指标值
        SELECT 
            CASE v_threshold.metric_name
                WHEN 'cpu_usage' THEN 
                    (SELECT cpu_usage FROM review_system.system_metrics_history ORDER BY id DESC LIMIT 1)
                WHEN 'memory_usage' THEN 
                    (SELECT memory_usage FROM review_system.system_metrics_history ORDER BY id DESC LIMIT 1)
                WHEN 'active_connections' THEN 
                    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')
                WHEN 'deadlock_count' THEN 
                    (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database())
            END INTO v_current_value;

        -- 检查阈值并触发告警
        IF v_current_value >= v_threshold.critical_threshold THEN
            PERFORM review_system.create_alert(
                v_threshold.metric_name,
                'CRITICAL',
                format('%s 达到严重阈值: %s', v_threshold.metric_name, v_current_value)
            );
        ELSIF v_current_value >= v_threshold.warning_threshold THEN
            PERFORM review_system.create_alert(
                v_threshold.metric_name,
                'WARNING',
                format('%s 达到警告阈值: %s', v_threshold.metric_name, v_current_value)
            );
        END IF;

        -- 更新检查时间
        UPDATE review_system.performance_thresholds 
        SET last_check = CURRENT_TIMESTAMP
        WHERE metric_name = v_threshold.metric_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 