CREATE OR REPLACE FUNCTION review_system.generate_visual_report()
RETURNS TABLE (
    report_html TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH test_stats AS (
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time
        FROM review_system.test_results
        GROUP BY test_category
    )
    SELECT format(
        $$
        <html>
        <head>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                .success { background-color: #90EE90; }
                .failure { background-color: #FFB6C1; }
                .chart { width: 100%%; height: 400px; }
            </style>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body>
            <h1>数据库测试报告</h1>
            
            <h2>测试概况</h2>
            <table>
                <tr>
                    <th>测试类别</th>
                    <th>总数</th>
                    <th>通过</th>
                    <th>失败</th>
                    <th>平均耗时(秒)</th>
                    <th>通过率</th>
                </tr>
                %s
            </table>

            <h2>性能指标</h2>
            <div id="performanceChart" class="chart"></div>
            
            <h2>错误详情</h2>
            <table>
                <tr>
                    <th>测试名称</th>
                    <th>错误信息</th>
                    <th>发生时间</th>
                </tr>
                %s
            </table>

            <script>
                %s
            </script>
        </body>
        </html>
        $$,
        -- 测试概况表格数据
        (SELECT string_agg(format(
            '<tr class="%s"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%.2f</td><td>%.1f%%</td></tr>',
            CASE WHEN failed = 0 THEN 'success' ELSE 'failure' END,
            test_category,
            total_tests,
            passed,
            failed,
            avg_time,
            (passed::float/total_tests * 100)
        ), E'\n') FROM test_stats),
        
        -- 错误详情表格数据
        (SELECT string_agg(format(
            '<tr><td>%s</td><td>%s</td><td>%s</td></tr>',
            test_name,
            error_message,
            executed_at
        ), E'\n')
        FROM review_system.test_results
        WHERE status = '失败'),
        
        -- 性能图表JavaScript
        format($$
            var performanceData = {
                x: [%s],
                y: [%s],
                type: 'bar',
                name: '平均执行时间(秒)'
            };
            
            var layout = {
                title: '各类测试平均执行时间',
                xaxis: { title: '测试类别' },
                yaxis: { title: '执行时间(秒)' }
            };
            
            Plotly.newPlot('performanceChart', [performanceData], layout);
        $$,
        (SELECT string_agg(format('''%s''', test_category), ',') FROM test_stats),
        (SELECT string_agg(avg_time::text, ',') FROM test_stats))
    );
END;
$$ LANGUAGE plpgsql; 