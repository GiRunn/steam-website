-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
BEGIN
    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 生成HTML报告（中文版）
    COPY (
        SELECT string_agg(
            CASE WHEN rn = 1 THEN
                '<!DOCTYPE html>' || E'\n' ||
                '<html>' || E'\n' ||
                '<head>' || E'\n' ||
                '    <meta charset="UTF-8">' || E'\n' ||
                '    <title>游戏评价系统测试报告</title>' || E'\n' ||
                '    <style>' || E'\n' ||
                '        body { font-family: "Microsoft YaHei", SimHei, sans-serif; margin: 20px; }' || E'\n' ||
                '        table { border-collapse: collapse; width: 100%; }' || E'\n' ||
                '        th, td { border: 1px solid black; padding: 8px; text-align: left; }' || E'\n' ||
                '        th { background-color: #f2f2f2; }' || E'\n' ||
                '        .passed { color: green; font-weight: bold; }' || E'\n' ||
                '        .failed { color: red; font-weight: bold; }' || E'\n' ||
                '    </style>' || E'\n' ||
                '</head>' || E'\n' ||
                '<body>' || E'\n' ||
                '    <h1>游戏评价系统测试报告</h1>' || E'\n' ||
                '    <table>' || E'\n' ||
                '        <tr>' || E'\n' ||
                '            <th>测试名称</th>' || E'\n' ||
                '            <th>测试类别</th>' || E'\n' ||
                '            <th>测试状态</th>' || E'\n' ||
                '            <th>执行时间</th>' || E'\n' ||
                '            <th>错误信息</th>' || E'\n' ||
                '        </tr>' || E'\n'
            ELSE ''
            END ||
            '        <tr>' || E'\n' ||
            '            <td>' || test_name || '</td>' || E'\n' ||
            '            <td>' || test_category || '</td>' || E'\n' ||
            '            <td class="' || lower(status) || '">' || 
                CASE status 
                    WHEN 'PASSED' THEN '通过'
                    WHEN 'FAILED' THEN '失败'
                    ELSE status
                END || '</td>' || E'\n' ||
            '            <td>' || execution_time::text || '</td>' || E'\n' ||
            '            <td>' || COALESCE(error_message, '') || '</td>' || E'\n' ||
            '        </tr>' || E'\n' ||
            CASE WHEN rn = total_rows THEN
                '    </table>' || E'\n' ||
                '    <p>生成时间: ' || CURRENT_TIMESTAMP || '</p>' || E'\n' ||
                '</body>' || E'\n' ||
                '</html>'
            ELSE ''
            END,
            ''
        )
        FROM (
            SELECT 
                test_name,
                test_category,
                status,
                execution_time,
                error_message,
                row_number() OVER (ORDER BY test_category, test_name) as rn,
                count(*) OVER () as total_rows
            FROM test_framework.test_results
            ORDER BY test_category, test_name
        ) t
    ) TO './test_report.html' WITH ENCODING 'UTF8';
END $$; 