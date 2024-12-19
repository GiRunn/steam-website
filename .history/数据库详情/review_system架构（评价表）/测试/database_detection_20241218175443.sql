-- 数据库全面检测脚本

-- 创建检测结果表
CREATE TABLE IF NOT EXISTS review_system.database_detection_results (
    detection_id SERIAL PRIMARY KEY,
    detection_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT,
    details JSONB
);

-- 创建全面数据库检测函数
CREATE OR REPLACE FUNCTION review_system.comprehensive_database_detection()
RETURNS TABLE (
    category TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT,
    details JSONB
) AS $$
DECLARE
    v_detection_id INTEGER;
BEGIN
    -- 创建检测记录
    INSERT INTO review_system.database_detection_results (category)
    VALUES ('全面数据库检测')
    RETURNING detection_id INTO v_detection_id;

    -- 执行增强型指标检测
    RETURN QUERY 
    WITH metrics AS (
        SELECT * FROM review_system.enhanced_monitor_metrics()
    )
    SELECT 
        category,
        metric_name,
        current_value,
        threshold_value,
        status,
        details
    FROM metrics;

    -- 更新检测结果
    UPDATE review_system.database_detection_results
    SET details = (
        SELECT jsonb_agg(
            jsonb_build_object(
                'category', category,
                'metric_name', metric_name,
                'current_value', current_value,
                'threshold_value', threshold_value,
                'status', status,
                'details', details
            )
        )
        FROM metrics
    )
    WHERE detection_id = v_detection_id;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 创建定期检测触发器
CREATE OR REPLACE FUNCTION review_system.schedule_database_detection()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM review_system.comprehensive_database_detection();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器（每小时执行一次）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'review_system' 
        AND trigger_name = 'periodic_database_detection'
    ) THEN
        CREATE TRIGGER periodic_database_detection
        AFTER INSERT ON review_system.database_detection_results
        FOR EACH STATEMENT
        EXECUTE FUNCTION review_system.schedule_database_detection();
    END IF;
END $$;

-- 创建检测报告生成函数
CREATE OR REPLACE FUNCTION review_system.generate_detection_report(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    report_html TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT format(
        $$
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                .normal { background-color: #90EE90; }
                .warning { background-color: #FFFFE0; }
                .critical { background-color: #FFB6C1; }
            </style>
        </head>
        <body>
            <h1>数据库检测报告</h1>
            <h2>检测概览</h2>
            <table>
                <tr>
                    <th>类别</th>
                    <th>指标</th>
                    <th>当前值</th>
                    <th>阈值</th>
                    <th>状态</th>
                </tr>
                %s
            </table>
        </body>
        </html>
        $$,
        (
            SELECT string_agg(
                format(
                    '<tr class="%s"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    CASE 
                        WHEN status = '正常' THEN 'normal'
                        WHEN status = '警告' THEN 'warning'
                        ELSE 'critical'
                    END,
                    category,
                    metric_name,
                    current_value,
                    threshold_value,
                    status
                ),
                E'\n'
            )
            FROM review_system.database_detection_results
            WHERE detection_time >= NOW() - (p_hours || ' hours')::interval
        )
    );
END;
$$ LANGUAGE plpgsql; 