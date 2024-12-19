-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
BEGIN
    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 执行测试文件
    \i '00_create_test_framework.sql'
    \i '01_basic_operations.sql'
    \i '02_partition_tests.sql'
    \i '03_performance_tests.sql'
    \i '04_trigger_tests.sql'
    
    -- 生成HTML报告
    COPY (
        SELECT 
            E'<html>\n<head>\n<meta charset="UTF-8">\n<style>' ||
            'table {border-collapse: collapse; width: 100%;}' ||
            'th, td {border: 1px solid black; padding: 8px; text-align: left;}' ||
            'th {background-color: #f2f2f2;}' ||
            '.passed {color: green;} .failed {color: red;}' ||
            '</style>\n</head>\n<body>' ||
            '<h1>Test Execution Report</h1>' ||
            '<table>' ||
            '<tr><th>Test Name</th><th>Category</th><th>Status</th>' ||
            '<th>Execution Time</th><th>Error Message</th></tr>' ||
            string_agg(
                '<tr>' ||
                '<td>' || test_name || '</td>' ||
                '<td>' || test_category || '</td>' ||
                '<td class="' || lower(status) || '">' || status || '</td>' ||
                '<td>' || execution_time::text || '</td>' ||
                '<td>' || COALESCE(error_message, '') || '</td>' ||
                '</tr>',
                E'\n'
            ) ||
            '</table>' ||
            '<p>Generated at: ' || CURRENT_TIMESTAMP || '</p>' ||
            '</body></html>'
        FROM test_framework.test_results
        ORDER BY test_category, test_name
    ) TO PROGRAM 'iconv -f UTF-8 -t UTF-8 > test_report.html';
END $$; 