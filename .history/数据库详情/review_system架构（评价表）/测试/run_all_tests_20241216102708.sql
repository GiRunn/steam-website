-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
BEGIN
    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 生成HTML报告（中文版）
    COPY (
        SELECT E'\xEF\xBB\xBF' || -- 添加 UTF-8 BOM
        string_agg(line, E'\r\n')
        FROM (
            SELECT 1 as order_num,
                   '<!DOCTYPE html>' as line
            UNION ALL
            SELECT 2, '<html lang="zh-CN">'
            UNION ALL
            SELECT 3, '<head>'
            UNION ALL
            SELECT 4, '    <meta charset="UTF-8">'
            UNION ALL
            SELECT 5, '    <title>游戏评价系统测试报告</title>'
            UNION ALL
            SELECT 6, '    <style>'
            UNION ALL
            SELECT 7, '        body {'
            UNION ALL
            SELECT 8, '            font-family: "Microsoft YaHei", SimHei, sans-serif;'
            UNION ALL
            SELECT 9, '            margin: 20px;'
            UNION ALL
            SELECT 10, '            padding: 20px;'
            UNION ALL
            SELECT 11, '        }'
            UNION ALL
            SELECT 12, '        table {'
            UNION ALL
            SELECT 13, '            border-collapse: collapse;'
            UNION ALL
            SELECT 14, '            width: 100%;'
            UNION ALL
            SELECT 15, '            margin-top: 20px;'
            UNION ALL
            SELECT 16, '        }'
            UNION ALL
            SELECT 17, '        th, td {'
            UNION ALL
            SELECT 18, '            border: 1px solid #ddd;'
            UNION ALL
            SELECT 19, '            padding: 12px;'
            UNION ALL
            SELECT 20, '            text-align: left;'
            UNION ALL
            SELECT 21, '        }'
            UNION ALL
            SELECT 22, '        th {'
            UNION ALL
            SELECT 23, '            background-color: #f5f5f5;'
            UNION ALL
            SELECT 24, '        }'
            UNION ALL
            SELECT 25, '        .passed {'
            UNION ALL
            SELECT 26, '            color: #2ecc71;'
            UNION ALL
            SELECT 27, '            font-weight: bold;'
            UNION ALL
            SELECT 28, '        }'
            UNION ALL
            SELECT 29, '        .failed {'
            UNION ALL
            SELECT 30, '            color: #e74c3c;'
            UNION ALL
            SELECT 31, '            font-weight: bold;'
            UNION ALL
            SELECT 32, '        }'
            UNION ALL
            SELECT 33, '        h1 {'
            UNION ALL
            SELECT 34, '            color: #2c3e50;'
            UNION ALL
            SELECT 35, '            text-align: center;'
            UNION ALL
            SELECT 36, '        }'
            UNION ALL
            SELECT 37, '    </style>'
            UNION ALL
            SELECT 38, '</head>'
            UNION ALL
            SELECT 39, '<body>'
            UNION ALL
            SELECT 40, '    <h1>游戏评价系统测试报告</h1>'
            UNION ALL
            SELECT 41, '    <table>'
            UNION ALL
            SELECT 42, '        <tr>'
            UNION ALL
            SELECT 43, '            <th>测试名称</th>'
            UNION ALL
            SELECT 44, '            <th>测试类别</th>'
            UNION ALL
            SELECT 45, '            <th>测试状态</th>'
            UNION ALL
            SELECT 46, '            <th>执行时间</th>'
            UNION ALL
            SELECT 47, '            <th>错误信息</th>'
            UNION ALL
            SELECT 48, '        </tr>'
            UNION ALL
            -- 测试结果
            SELECT row_number() OVER () + 100 as order_num,
                   '        <tr>' ||
                   '<td>' || test_name || '</td>' ||
                   '<td>' || test_category || '</td>' ||
                   '<td class="' || lower(status) || '">' || 
                   CASE status 
                       WHEN 'PASSED' THEN '通过'
                       WHEN 'FAILED' THEN '失败'
                       ELSE status
                   END || '</td>' ||
                   '<td>' || execution_time::text || '</td>' ||
                   '<td>' || COALESCE(error_message, '') || '</td>' ||
                   '</tr>' as line
            FROM test_framework.test_results
            UNION ALL
            SELECT 1000, '    </table>'
            UNION ALL
            SELECT 1001, '    <p style="margin-top: 20px;">生成时间: ' || CURRENT_TIMESTAMP::text || '</p>'
            UNION ALL
            SELECT 1002, '</body>'
            UNION ALL
            SELECT 1003, '</html>'
            ORDER BY order_num
        ) t
    ) TO PROGRAM 'iconv -f UTF-8 -t UTF-8 > test_report.html';
END $$; 