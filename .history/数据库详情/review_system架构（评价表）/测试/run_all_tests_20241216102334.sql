-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
BEGIN
    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 生成HTML报告（中文版）
    EXECUTE format('COPY (
        SELECT 
            %L ||
            string_agg(
                format(
                    %L,
                    test_name,
                    test_category,
                    CASE status 
                        WHEN ''PASSED'' THEN ''通过''
                        WHEN ''FAILED'' THEN ''失败''
                        ELSE status
                    END,
                    execution_time::text,
                    COALESCE(error_message, '''')
                ),
                E''\n''
            ) ||
            %L
        FROM test_framework.test_results
        ORDER BY test_category, test_name
    ) TO %L WITH ENCODING ''UTF8''',
    E'<!DOCTYPE html>\n<html>\n<head>\n' ||
    '<meta charset="UTF-8">\n' ||
    '<title>游戏评价系统测试报告</title>\n' ||
    '<style>\n' ||
    'body { font-family: "Microsoft YaHei", Arial, sans-serif; }\n' ||
    'table { border-collapse: collapse; width: 100%; }\n' ||
    'th, td { border: 1px solid black; padding: 8px; text-align: left; }\n' ||
    'th { background-color: #f2f2f2; }\n' ||
    '.passed { color: green; }\n' ||
    '.failed { color: red; }\n' ||
    '</style>\n</head>\n<body>\n' ||
    '<h1>游戏评价系统测试报告</h1>\n' ||
    '<table>\n' ||
    '<tr><th>测试名称</th><th>测试类别</th><th>测试状态</th>' ||
    '<th>执行时间</th><th>错误信息</th></tr>\n',
    
    '<tr><td>%s</td><td>%s</td>' ||
    '<td class="%s">%s</td><td>%s</td><td>%s</td></tr>',
    
    '</table>\n<p>生成时间: ' || CURRENT_TIMESTAMP || '</p>\n</body>\n</html>',
    
    'test_report.html'
    );
END $$; 