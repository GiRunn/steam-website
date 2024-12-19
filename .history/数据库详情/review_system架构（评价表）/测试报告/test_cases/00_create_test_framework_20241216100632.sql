-- 创建测试结果记录表
CREATE TABLE IF NOT EXISTS review_system.test_results (
    test_id BIGSERIAL PRIMARY KEY,
    test_suite VARCHAR(100) NOT NULL,
    test_case VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'SUCCESS', 'WARNING', 'FAILURE'
    execution_time DECIMAL(10,3), -- 毫秒
    expected_result TEXT,
    actual_result TEXT,
    error_message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建生成HTML报告的函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TEXT AS $$
DECLARE
    html TEXT;
    test_suites CURSOR FOR 
        SELECT DISTINCT test_suite 
        FROM review_system.test_results 
        WHERE created_at::date = CURRENT_DATE
        ORDER BY test_suite;
    suite_record RECORD;
    case_record RECORD;
BEGIN
    -- HTML头部
    html := '<!DOCTYPE html>
<html>
<head>
    <title>Review System Test Report - ' || CURRENT_TIMESTAMP || '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin-bottom: 30px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .success { background-color: #dff0d8; border: 1px solid #d6e9c6; }
        .warning { background-color: #fcf8e3; border: 1px solid #faebcc; }
        .failure { background-color: #f2dede; border: 1px solid #ebccd1; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .details { font-family: monospace; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Review System Test Report</h1>
    <p>测试时间: ' || CURRENT_TIMESTAMP || '</p>
    <p>数据库版本: ' || version() || '</p>';

    -- 测试统计
    html := html || '
    <div class="test-section">
        <h2>测试统计</h2>
        <table>
            <tr>
                <th>总测试数</th>
                <th>成功</th>
                <th>警告</th>
                <th>失败</th>
                <th>平均执行时间</th>
            </tr>
            <tr>
                <td>' || (SELECT COUNT(*) FROM review_system.test_results WHERE created_at::date = CURRENT_DATE) || '</td>
                <td>' || (SELECT COUNT(*) FROM review_system.test_results WHERE status = 'SUCCESS' AND created_at::date = CURRENT_DATE) || '</td>
                <td>' || (SELECT COUNT(*) FROM review_system.test_results WHERE status = 'WARNING' AND created_at::date = CURRENT_DATE) || '</td>
                <td>' || (SELECT COUNT(*) FROM review_system.test_results WHERE status = 'FAILURE' AND created_at::date = CURRENT_DATE) || '</td>
                <td>' || (SELECT ROUND(AVG(execution_time), 2) FROM review_system.test_results WHERE created_at::date = CURRENT_DATE) || 'ms</td>
            </tr>
        </table>
    </div>';

    -- 遍历测试套件
    FOR suite_record IN test_suites LOOP
        html := html || '
    <div class="test-section">
        <h2>' || suite_record.test_suite || '</h2>';
        
        -- 遍历测试用例
        FOR case_record IN 
            SELECT * 
            FROM review_system.test_results 
            WHERE test_suite = suite_record.test_suite 
                AND created_at::date = CURRENT_DATE
            ORDER BY test_case
        LOOP
            html := html || '
        <div class="test-result ' || LOWER(case_record.status) || '">
            <h3>' || case_record.test_case || '</h3>
            <p><strong>状态：</strong>' || case_record.status || '</p>
            <p><strong>执行时间：</strong>' || case_record.execution_time || 'ms</p>';
            
            IF case_record.expected_result IS NOT NULL THEN
                html := html || '
            <p><strong>预期结果：</strong>' || case_record.expected_result || '</p>';
            END IF;
            
            IF case_record.actual_result IS NOT NULL THEN
                html := html || '
            <p><strong>实际结果：</strong>' || case_record.actual_result || '</p>';
            END IF;
            
            IF case_record.error_message IS NOT NULL THEN
                html := html || '
            <p><strong>错误信息：</strong>' || case_record.error_message || '</p>';
            END IF;
            
            IF case_record.details IS NOT NULL THEN
                html := html || '
            <div class="details">
                <strong>详细信息：</strong>
                <pre>' || case_record.details::text || '</pre>
            </div>';
            END IF;
            
            html := html || '
        </div>';
        END LOOP;
        
        html := html || '
    </div>';
    END LOOP;

    -- HTML尾部
    html := html || '
</body>
</html>';

    -- 保存报告到文件
    PERFORM pg_write_file(
        '/var/lib/postgresql/test_reports/report_' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS') || '.html',
        html,
        false
    );

    RETURN html;
END;
$$ LANGUAGE plpgsql;

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.record_test_result(
    p_test_suite VARCHAR,
    p_test_case VARCHAR,
    p_status VARCHAR,
    p_execution_time DECIMAL,
    p_expected_result TEXT DEFAULT NULL,
    p_actual_result TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO review_system.test_results (
        test_suite,
        test_case,
        status,
        execution_time,
        expected_result,
        actual_result,
        error_message,
        details
    ) VALUES (
        p_test_suite,
        p_test_case,
        p_status,
        p_execution_time,
        p_expected_result,
        p_actual_result,
        p_error_message,
        p_details
    );
END;
$$ LANGUAGE plpgsql; 