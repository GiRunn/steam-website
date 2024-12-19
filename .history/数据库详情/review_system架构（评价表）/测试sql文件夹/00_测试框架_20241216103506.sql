-- 创建测试结果表
CREATE TABLE IF NOT EXISTS review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(200),
    test_category VARCHAR(50),
    result BOOLEAN,
    error_message TEXT,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT
) RETURNS VOID AS $$
BEGIN
    IF expected = actual THEN
        INSERT INTO review_system.test_results (test_name, test_category, result)
        VALUES (description, '相等性测试', TRUE);
    ELSE
        INSERT INTO review_system.test_results (test_name, test_category, result, error_message)
        VALUES (
            description, 
            '相等性测试', 
            FALSE, 
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试报告函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TABLE (
    测试类别 VARCHAR(50),
    总测试数 BIGINT,
    通过数量 BIGINT,
    失败数量 BIGINT,
    通过率 NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        test_category,
        COUNT(*) as total_tests,
        SUM(CASE WHEN result THEN 1 ELSE 0 END) as passed_tests,
        SUM(CASE WHEN NOT result THEN 1 ELSE 0 END) as failed_tests,
        ROUND(
            (SUM(CASE WHEN result THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100),
            2
        ) as pass_rate
    FROM review_system.test_results
    GROUP BY test_category;
END;
$$ LANGUAGE plpgsql; 