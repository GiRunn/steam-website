-- 创建测试结果记录表
CREATE TABLE IF NOT EXISTS review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    test_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    execution_time INTERVAL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT
) RETURNS VOID AS $$
BEGIN
    IF expected = actual THEN
        INSERT INTO review_system.test_results (test_name, test_category, status)
        VALUES (description, '断言测试', '通过');
    ELSE
        INSERT INTO review_system.test_results (test_name, test_category, status, error_message)
        VALUES (
            description, 
            '断言测试', 
            '失败',
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT)
        );
        RAISE NOTICE '测试失败: % - 期望值: %, 实际值: %', description, expected, actual;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试运行函数
CREATE OR REPLACE FUNCTION review_system.run_test(
    test_name TEXT,
    test_category TEXT,
    test_sql TEXT
) RETURNS VOID AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    error_message TEXT;
BEGIN
    start_time := clock_timestamp();
    
    BEGIN
        EXECUTE test_sql;
        
        end_time := clock_timestamp();
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            execution_time,
            executed_at
        ) VALUES (
            test_name,
            test_category,
            '通过',
            end_time - start_time,
            CURRENT_TIMESTAMP
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_message := SQLERRM;
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            error_message,
            execution_time,
            executed_at
        ) VALUES (
            test_name,
            test_category,
            '失败',
            error_message,
            clock_timestamp() - start_time,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE '测试失败: % - %', test_name, error_message;
    END;
END;
$$ LANGUAGE plpgsql;

-- 创建测试报告生成函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TABLE (
    类别 TEXT,
    总测试数 BIGINT,
    通过数 BIGINT,
    失败数 BIGINT,
    通过率 TEXT,
    平均执行时间 INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        test_category::TEXT,
        COUNT(*)::BIGINT as total_tests,
        SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END)::BIGINT as passed,
        SUM(CASE WHEN status = '失败' THEN 1 ELSE 0 END)::BIGINT as failed,
        ROUND((SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END)::NUMERIC / 
               COUNT(*)::NUMERIC * 100), 2)::TEXT || '%' as pass_rate,
        (AVG(execution_time))::INTERVAL as avg_execution_time
    FROM review_system.test_results
    WHERE executed_at >= (SELECT MAX(executed_at) FROM review_system.test_results)
    GROUP BY test_category
    ORDER BY test_category;
END;
$$ LANGUAGE plpgsql; 