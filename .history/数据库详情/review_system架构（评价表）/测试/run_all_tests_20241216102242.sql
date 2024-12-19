-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
DECLARE
    v_base_path text := current_setting('data_directory') || '/test_results';
BEGIN
    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 执行测试文件
    \ir '00_create_test_framework.sql'
    \ir '01_basic_operations.sql'
    \ir '02_partition_tests.sql'
    \ir '03_performance_tests.sql'
    \ir '04_trigger_tests.sql'
    
    -- 生成HTML报告（中文版）
    COPY (
        SELECT 
            E'<html>\n<head>\n<meta charset="UTF-8">\n<style>' ||
            'table {border-collapse: collapse; width: 100%;}' ||
            'th, td {border: 1px solid black; padding: 8px; text-align: left;}' ||
            'th {background-color: #f2f2f2;}' ||
            '.passed {color: green;} .failed {color: red;}' ||
            '</style>\n</head>\n<body>' ||
            '<h1>游戏评价系统测试报告</h1>' ||
            '<table>' ||
            '<tr><th>测试名称</th><th>测试类别</th><th>测试状态</th>' ||
            '<th>执行时间</th><th>错误信息</th></tr>' ||
            string_agg(
                '<tr>' ||
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
                '</tr>',
                E'\n'
            ) ||
            '</table>' ||
            '<p>生成时间: ' || CURRENT_TIMESTAMP || '</p>' ||
            '</body></html>'
        FROM test_framework.test_results
        ORDER BY test_category, test_name
    ) TO 'test_report.html';
END $$; 