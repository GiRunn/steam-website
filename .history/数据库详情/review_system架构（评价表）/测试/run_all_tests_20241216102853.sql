-- 设置客户端编码
SET client_encoding = 'UTF8';

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
('<html lang="zh-CN">'),
('<head>'),
('    <meta charset="UTF-8">'),
('    <title>游戏评价系统测试报告</title>'),
('    <style>'),
('        body { font-family: "Microsoft YaHei", Arial, sans-serif; margin: 20px; }'),
('        h1 { color: #2c3e50; text-align: center; }'),
('        .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }'),
('        table { width: 100%; border-collapse: collapse; margin: 20px 0; }'),
('        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }'),
('        th { background: #f5f5f5; }'),
('        .passed { color: #27ae60; }'),
('        .failed { color: #e74c3c; }'),
('        .error { color: #e74c3c; font-size: 0.9em; }'),
('    </style>'),
('</head>'),
('<body>'),
('    <h1>游戏评价系统测试报告</h1>');

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
    '    <div class="summary">
        <h2>测试摘要</h2>
        <p>总测试数: %s</p>
        <p>通过: <span class="passed">%s</span></p>
        <p>失败: <span class="failed">%s</span></p>
        <p>平均执行时间: %s 秒</p>
    </div>',
    total_tests, passed_tests, failed_tests, avg_execution_time
) FROM summary;

-- 插入测试结果表格
INSERT INTO temp_html_content (content) VALUES
('    <table>'),
('        <tr>'),
('            <th>测试名称</th>'),
('            <th>测试类别</th>'),
('            <th>状态</th>'),
('            <th>执行时间</th>'),
('            <th>错误信息</th>'),
('        </tr>');

-- 插入测试结果行
INSERT INTO temp_html_content (content)
SELECT format(
    '        <tr>
            <td>%s</td>
            <td>%s</td>
            <td class="%s">%s</td>
            <td>%s</td>
            <td class="error">%s</td>
        </tr>',
    test_name,
    test_category,
    lower(status),
    CASE status 
        WHEN 'PASSED' THEN '通过'
        WHEN 'FAILED' THEN '失败'
        ELSE status
    END,
    execution_time::text,
    COALESCE(error_message, '')
)
FROM test_framework.test_results
ORDER BY test_id;

-- 插入HTML尾部
INSERT INTO temp_html_content (content) VALUES
('    </table>'),
(format('    <p>报告生成时间: %s</p>', CURRENT_TIMESTAMP::text)),
('</body>'),
('</html>');

-- 将HTML内容写入文件
COPY (
    SELECT string_agg(content, E'\n' ORDER BY id)
    FROM temp_html_content
) TO 'test_report.html' WITH (FORMAT text, ENCODING 'UTF8');

-- 清理临时表
DROP TABLE temp_html_content; 