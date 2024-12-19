-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 执行所有测试并生成报告
DO $$ 
DECLARE
    v_report_path text;
BEGIN
    -- 获取当前目录作为报告保存位置
    SELECT current_setting('data_directory') || '/test_report.html' INTO v_report_path;

    -- 清理之前的测试结果
    TRUNCATE TABLE test_framework.test_results;
    
    -- 生成HTML报告
    PERFORM pg_catalog.pg_file_unlink(v_report_path);  -- 删除已存在的文件
    
    -- 写入UTF-8 BOM标记
    PERFORM pg_catalog.pg_file_write(v_report_path, E'\xEF\xBB\xBF', true);
    
    -- 写入HTML内容
    PERFORM pg_catalog.pg_file_write(v_report_path, 
        '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>游戏评价系统测试报告</title>
    <style>
        body { 
            font-family: "Microsoft YaHei", "SimHei", sans-serif;
            margin: 20px;
        }
        table { 
            border-collapse: collapse; 
            width: 100%;
            margin-top: 20px;
        }
        th, td { 
            border: 1px solid black; 
            padding: 8px; 
            text-align: left;
        }
        th { 
            background-color: #f2f2f2;
        }
        .passed { 
            color: green;
            font-weight: bold;
        }
        .failed { 
            color: red;
            font-weight: bold;
        }
        h1 {
            color: #333;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>游戏评价系统测试报告</h1>
    <table>
        <tr>
            <th>测试名称</th>
            <th>测试类别</th>
            <th>测试状态</th>
            <th>执行时间</th>
            <th>错误信息</th>
        </tr>', false);

    -- 写入测试结果
    FOR r IN (
        SELECT 
            test_name,
            test_category,
            status,
            execution_time,
            error_message
        FROM test_framework.test_results
        ORDER BY test_category, test_name
    ) LOOP
        PERFORM pg_catalog.pg_file_write(v_report_path, format('
        <tr>
            <td>%s</td>
            <td>%s</td>
            <td class="%s">%s</td>
            <td>%s</td>
            <td>%s</td>
        </tr>',
            r.test_name,
            r.test_category,
            lower(r.status),
            CASE r.status 
                WHEN 'PASSED' THEN '通过'
                WHEN 'FAILED' THEN '失败'
                ELSE r.status
            END,
            r.execution_time::text,
            COALESCE(r.error_message, '')
        ), false);
    END LOOP;

    -- 写入HTML结束标记
    PERFORM pg_catalog.pg_file_write(v_report_path, format('
    </table>
    <p style="margin-top: 20px;">生成时间: %s</p>
</body>
</html>', CURRENT_TIMESTAMP), false);

    -- 输出报告位置
    RAISE NOTICE '测试报告已生成: %', v_report_path;
END $$; 