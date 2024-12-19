-- 创建测试框架
CREATE SCHEMA IF NOT EXISTS test_framework;

-- 创建测试结果表
CREATE TABLE IF NOT EXISTS test_framework.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_category VARCHAR(50),
    status VARCHAR(20),
    execution_time INTERVAL,
    error_message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION test_framework.assert_equals(
    expected ANYELEMENT,
    actual ANYELEMENT,
    message TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
BEGIN
    IF expected = actual THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Assertion failed: % (Expected: %, Actual: %)', 
            message, expected, actual;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试执行函数
CREATE OR REPLACE FUNCTION test_framework.run_test(
    p_test_name TEXT,
    p_test_category TEXT,
    p_test_sql TEXT
) RETURNS VOID AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_error_message TEXT;
    v_status TEXT;
BEGIN
    v_start_time := clock_timestamp();
    
    BEGIN
        EXECUTE p_test_sql;
        v_status := 'PASSED';
    EXCEPTION WHEN OTHERS THEN
        v_status := 'FAILED';
        v_error_message := SQLERRM;
    END;
    
    v_end_time := clock_timestamp();
    
    INSERT INTO test_framework.test_results (
        test_name,
        test_category,
        status,
        execution_time,
        error_message,
        details
    ) VALUES (
        p_test_name,
        p_test_category,
        v_status,
        v_end_time - v_start_time,
        v_error_message,
        jsonb_build_object(
            'sql', p_test_sql,
            'execution_date', CURRENT_TIMESTAMP
        )
    );
END;
$$ LANGUAGE plpgsql; 