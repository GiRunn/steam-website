-- 创建测试框架
DO $$ 
BEGIN
    -- 检查并创建review_system模式
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'review_system') THEN
        CREATE SCHEMA review_system;
    END IF;
END $$;

-- 删除已存在的函数和表
DO $$
BEGIN
    -- 删除函数
    DROP FUNCTION IF EXISTS review_system.assert_equals(TEXT, ANYELEMENT, ANYELEMENT);
    DROP FUNCTION IF EXISTS review_system.run_test(TEXT, TEXT, TEXT);
    DROP FUNCTION IF EXISTS review_system.generate_test_report();
    DROP FUNCTION IF EXISTS review_system.cleanup_test_data();
    
    -- 删除表
    DROP TABLE IF EXISTS review_system.test_results;
    
    RAISE NOTICE '已清理现有测试框架';
END $$;

-- 创建测试结果记录表
CREATE TABLE review_system.test_results (
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
    p_test_name TEXT,
    p_test_category TEXT,
    p_test_sql TEXT
) RETURNS VOID AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_error_message TEXT;
BEGIN
    v_start_time := clock_timestamp();
    
    BEGIN
        EXECUTE p_test_sql;
        
        v_end_time := clock_timestamp();
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            execution_time,
            executed_at
        ) VALUES (
            p_test_name,
            p_test_category,
            '通过',
            v_end_time - v_start_time,
            CURRENT_TIMESTAMP
        );
        
    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            error_message,
            execution_time,
            executed_at
        ) VALUES (
            p_test_name,
            p_test_category,
            '失败',
            v_error_message,
            clock_timestamp() - v_start_time,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE '测试失败: % - %', p_test_name, v_error_message;
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

-- 创建清理测试数据函数
CREATE OR REPLACE FUNCTION review_system.cleanup_test_data()
RETURNS VOID AS $$
BEGIN
    -- 清理测试评论数据
    DELETE FROM review_system.reviews_partitioned 
    WHERE content LIKE 'Performance test review%'
       OR content LIKE '这是一个测试评论%'
       OR content LIKE '触发器测试评论%';
       
    -- 清理测试回复数据
    DELETE FROM review_system.review_replies_partitioned 
    WHERE content LIKE '这是一个测试回复%';
    
    -- 清理测试结果表
    TRUNCATE TABLE review_system.test_results;
    
    RAISE NOTICE '测试数据清理完成';
END;
$$ LANGUAGE plpgsql; 