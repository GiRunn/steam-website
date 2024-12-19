-- 设置客户端编码
SET client_encoding = 'GBK';

-- 创建临时表存储HTML内容
CREATE TEMP TABLE IF NOT EXISTS temp_html_content (
    id serial primary key,
    content text
);

-- 清空临时表
TRUNCATE temp_html_content;

-- 插入HTML头部
INSERT INTO temp_html_content (content) VALUES
('<!DOCTYPE html>'),
('<html>'),
('<head>'),
('    <meta charset="GBK">'),
('    <title>测试报告</title>'),
('    <style>'),
('        body { margin: 20px; }'),
('        table { width: 100%; border-collapse: collapse; }'),
('        th, td { border: 1px solid black; padding: 8px; }'),
('        .passed { color: green; }'),
('        .failed { color: red; }'),
('    </style>'),
('</head>'),
('<body>'),
('    <h1>测试报告</h1>');

-- 插入测试结果摘要
WITH summary AS (
    SELECT 
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE status = 'PASSED') as passed_tests,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed_tests,
        AVG(EXTRACT(EPOCH FROM execution_time))::numeric(10,2) as avg_execution_time
    FROM test_framework.test_results
)
INSERT INTO temp_html_content (content)
SELECT format(
    '    <div>
        <p>总数: %s</p>
        <p>通过: %s</p>
        <p>失败: %s</p>
        <p>平均时间: %s秒</p>
    </div>',
    total_tests, passed_tests, failed_tests, avg_execution_time
) FROM summary;

-- 插入测试结果表格
INSERT INTO temp_html_content (content) VALUES
('    <table>'),
('        <tr>'),
('            <th>名称</th>'),
('            <th>类别</th>'),
('            <th>状态</th>'),
('            <th>时间</th>'),
('            <th>错误</th>'),
('        </tr>');

-- 插入测试结果行
INSERT INTO temp_html_content (content)
SELECT format(
    '        <tr>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
            <td>%s</td>
        </tr>',
    test_name,
    test_category,
    status,
    execution_time::text,
    COALESCE(error_message, '')
)
FROM test_framework.test_results
ORDER BY test_id;

-- 插入HTML尾部
INSERT INTO temp_html_content (content) VALUES
('    </table>'),
('</body>'),
('</html>');

-- 将HTML内容写入文件
COPY (
    SELECT string_agg(content, E'\n' ORDER BY id)
    FROM temp_html_content
) TO 'test_report.html';

-- 清理临时表
DROP TABLE temp_html_content; 