CREATE OR REPLACE FUNCTION review_system_monitor.generate_monitoring_report(
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
            <h1>评论系统监控报告</h1>
            <h2>系统指标</h2>
            <table>
                <tr>
                    <th>指标名称</th>
                    <th>值</th>
                    <th>类型</th>
                    <th>时间</th>
                </tr>
                %s
            </table>

            <h2>性能日志</h2>
            <table>
                <tr>
                    <th>操作类型</th>
                    <th>处理记录数</th>
                    <th>执行时间</th>
                    <th>平均响应时间</th>
                    <th>错误数</th>
                </tr>
                %s
            </table>

            <h2>异常检测</h2>
            <table>
                <tr>
                    <th>异常类型</th>
                    <th>描述</th>
                    <th>严重程度</th>
                    <th>详细信息</th>
                </tr>
                %s
            </table>
        </body>
        </html>
        $$,
        (
            SELECT string_agg(
                format(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    metric_name, 
                    metric_value, 
                    metric_type, 
                    timestamp
                ),
                E'\n'
            )
            FROM review_system_monitor.metrics
            WHERE timestamp >= NOW() - (p_hours || ' hours')::interval
        ),
        (
            SELECT string_agg(
                format(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    operation_type, 
                    records_processed, 
                    execution_time, 
                    avg_response_time, 
                    error_count
                ),
                E'\n'
            )
            FROM review_system_monitor.performance_log
            WHERE timestamp >= NOW() - (p_hours || ' hours')::interval
        ),
        (
            SELECT string_agg(
                format(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    anomaly_type, 
                    description, 
                    severity, 
                    details
                ),
                E'\n'
            )
            FROM review_system_monitor.anomaly_log
            WHERE timestamp >= NOW() - (p_hours || ' hours')::interval
        )
    );
END;
$$ LANGUAGE plpgsql; 