-- 设置客户端编码和服务器编码
SET client_encoding = 'UTF8';
SET server_encoding = 'UTF8';

-- 创建测试结果表（如果不存在）
DROP TABLE IF EXISTS review_system.test_results CASCADE;
DROP TABLE IF EXISTS review_system.test_logs CASCADE;

-- 创建测试结果表
CREATE TABLE review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(200),
    test_category VARCHAR(50),
    result BOOLEAN,
    error_message TEXT,
    execution_time INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试日志表
CREATE TABLE review_system.test_logs (
    log_id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES review_system.test_results(test_id),
    log_level VARCHAR(20),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT,
    category VARCHAR DEFAULT '相等性测试'
) RETURNS VOID AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    test_id INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    IF expected = actual THEN
        INSERT INTO review_system.test_results (
            test_name, 
            test_category, 
            result, 
            execution_time
        )
        VALUES (
            description, 
            category, 
            TRUE, 
            clock_timestamp() - start_time
        )
        RETURNING test_id INTO test_id;
        
        -- 记录成功日志
        INSERT INTO review_system.test_logs (test_id, log_level, message)
        VALUES (test_id, 'INFO', '测试通过: ' || description);
    ELSE
        INSERT INTO review_system.test_results (
            test_name, 
            test_category, 
            result, 
            error_message,
            execution_time
        )
        VALUES (
            description, 
            category, 
            FALSE, 
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT),
            clock_timestamp() - start_time
        )
        RETURNING test_id INTO test_id;
        
        -- 记录失败日志
        INSERT INTO review_system.test_logs (test_id, log_level, message)
        VALUES (test_id, 'ERROR', format('测试失败: %s. 期望值: %s, 实际值: %s', 
            description, expected::TEXT, actual::TEXT));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建性能测试函数
CREATE OR REPLACE FUNCTION review_system.assert_performance(
    description TEXT,
    max_duration INTERVAL,
    test_function TEXT
) RETURNS VOID AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    test_id INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- 执行测试函数
    EXECUTE test_function;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    -- 记录测试结果
    INSERT INTO review_system.test_results (
        test_name,
        test_category,
        result,
        error_message,
        execution_time
    )
    VALUES (
        description,
        '性能测试',
        execution_time <= max_duration,
        CASE 
            WHEN execution_time <= max_duration THEN NULL 
            ELSE format('执行时间 %s 超过预期 %s', execution_time, max_duration)
        END,
        execution_time
    )
    RETURNING test_id INTO test_id;
    
    -- 记录日志
    INSERT INTO review_system.test_logs (test_id, log_level, message)
    VALUES (
        test_id,
        CASE WHEN execution_time <= max_duration THEN 'INFO' ELSE 'WARNING' END,
        format('性能测试 "%s" 执行时间: %s', description, execution_time)
    );
END;
$$ LANGUAGE plpgsql;

-- 创建测试报告函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TABLE (
    测试类别 VARCHAR(50),
    总测试数 BIGINT,
    通过数量 BIGINT,
    失败数量 BIGINT,
    通过率 NUMERIC,
    平均执行时间 INTERVAL
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
        ) as pass_rate,
        AVG(execution_time) as avg_execution_time
    FROM review_system.test_results
    GROUP BY test_category;
END;
$$ LANGUAGE plpgsql;

-- 创建详细测试报告函数
CREATE OR REPLACE FUNCTION review_system.generate_detailed_test_report()
RETURNS TABLE (
    测试编号 INTEGER,
    测试名称 VARCHAR(200),
    测试类别 VARCHAR(50),
    测试结果 TEXT,
    错误信息 TEXT,
    执行时间 INTERVAL,
    执行时间戳 TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.test_id,
        r.test_name,
        r.test_category,
        CASE WHEN r.result THEN '通过' ELSE '失败' END,
        r.error_message,
        r.execution_time,
        r.created_at
    FROM review_system.test_results r
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql; 