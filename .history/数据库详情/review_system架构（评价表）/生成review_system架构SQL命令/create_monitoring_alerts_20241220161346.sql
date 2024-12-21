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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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