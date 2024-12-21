-- 创建告警规则表
CREATE TABLE IF NOT EXISTS review_system.alert_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    threshold_value NUMERIC NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL,
    alert_message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建告警历史表
CREATE TABLE IF NOT EXISTS review_system.alert_history (
    alert_id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES review_system.alert_rules(rule_id),
    metric_value NUMERIC NOT NULL,
    alert_status VARCHAR(20) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建检查告警的函数
CREATE OR REPLACE FUNCTION review_system.check_alerts()
RETURNS void AS $$
DECLARE
    v_rule record;
    v_metric_value numeric;
BEGIN
    FOR v_rule IN SELECT * FROM review_system.alert_rules WHERE is_active = true
    LOOP
        -- 获取度量值
        EXECUTE format(
            'SELECT %s FROM review_system.system_metrics_history ORDER BY recorded_at DESC LIMIT 1',
            v_rule.metric_name
        ) INTO v_metric_value;
        
        -- 检查阈值
        IF v_metric_value IS NOT NULL THEN
            CASE v_rule.comparison_operator
                WHEN '>' THEN
                    IF v_metric_value > v_rule.threshold_value THEN
                        INSERT INTO review_system.alert_history (
                            rule_id, metric_value, alert_status
                        ) VALUES (
                            v_rule.rule_id, v_metric_value, 'TRIGGERED'
                        );
                    END IF;
                WHEN '<' THEN
                    IF v_metric_value < v_rule.threshold_value THEN
                        INSERT INTO review_system.alert_history (
                            rule_id, metric_value, alert_status
                        ) VALUES (
                            v_rule.rule_id, v_metric_value, 'TRIGGERED'
                        );
                    END IF;
            END CASE;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 