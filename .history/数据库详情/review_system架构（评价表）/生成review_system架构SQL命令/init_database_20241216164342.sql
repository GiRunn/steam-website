-- 创建review_system架构
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建测试结果表
CREATE TABLE IF NOT EXISTS review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    test_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    execution_time INTERVAL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建记录测试结果的函数
CREATE OR REPLACE FUNCTION review_system.record_test_result(
    p_test_name TEXT,
    p_category TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_execution_time INTERVAL DEFAULT NULL
) RETURNS void AS $func$
BEGIN
    INSERT INTO review_system.test_results (
        test_name,
        test_category,
        status,
        error_message,
        execution_time
    ) VALUES (
        p_test_name,
        p_category,
        p_status,
        p_error_message,
        p_execution_time
    );
END;
$func$ LANGUAGE plpgsql; 