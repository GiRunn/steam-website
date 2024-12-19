-- 开始测试事务
BEGIN;

-- 创建测试结果临时表
DROP TABLE IF EXISTS temp_test_metrics;
CREATE TEMP TABLE temp_test_metrics (
    test_id SERIAL PRIMARY KEY,
    test_category TEXT,
    metric_name TEXT,
    metric_value NUMERIC,
    details TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试框架
DO $$
BEGIN 
    RAISE NOTICE '执行测试框架初始化...';
    
    -- 创建schema
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

    -- 创建测试辅助函数
    CREATE OR REPLACE FUNCTION review_system.assert_equals(
        description TEXT,
        expected ANYELEMENT,
        actual ANYELEMENT
    ) RETURNS VOID AS $BODY$
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
        END IF;
    END;
    $BODY$ LANGUAGE plpgsql;

    -- 创建测试运行函数
    CREATE OR REPLACE FUNCTION review_system.run_test(
        p_test_name TEXT,
        p_test_category TEXT,
        p_test_sql TEXT
    ) RETURNS VOID AS $BODY$
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
        END;
    END;
    $BODY$ LANGUAGE plpgsql;
END $$;

-- 执行测试
DO $$
BEGIN
    -- 基础数据测试
    RAISE NOTICE '执行基础数据测试...';
    PERFORM review_system.run_test(
        '评论插入测试',
        '基础数据测试',
        $test_sql$
        DO $test$
        BEGIN
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, playtime_hours, 
                platform, language, is_recommended
            ) VALUES (
                1001, 1, 4.5, '这是一个测试评论', 10, 
                'PC', 'zh-CN', true
            );
        END $test$;
        $test_sql$
    );
    
    -- 其他测试...
    -- 这里可以继续添加其他测试用例
    
END $$;

-- 生成测试报告
DO $$
DECLARE
    v_test_metrics RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '          测试执行报告              ';
    RAISE NOTICE '====================================';

    -- 显示各类测试结果
    FOR v_test_metrics IN (
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END) as passed_tests,
            MAX(execution_time) as max_time,
            MIN(execution_time) as min_time,
            AVG(execution_time) as avg_time
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    ) LOOP
        RAISE NOTICE '测试类别: %', v_test_metrics.test_category;
        RAISE NOTICE '总测试数: %', v_test_metrics.total_tests;
        RAISE NOTICE '通过测试: %', v_test_metrics.passed_tests;
        RAISE NOTICE '最长耗时: %', v_test_metrics.max_time;
        RAISE NOTICE '最短耗时: %', v_test_metrics.min_time;
        RAISE NOTICE '平均耗时: %', v_test_metrics.avg_time;
        RAISE NOTICE '------------------------------------';
    END LOOP;

    -- 显示失败的测试详情
    RAISE NOTICE '';
    RAISE NOTICE '失败测试详情:';
    FOR v_test_metrics IN (
        SELECT 
            test_name,
            test_category,
            error_message,
            execution_time
        FROM review_system.test_results
        WHERE status = '失败'
        ORDER BY test_category, test_name
    ) LOOP
        RAISE NOTICE '测试名称: %', v_test_metrics.test_name;
        RAISE NOTICE '测试类别: %', v_test_metrics.test_category;
        RAISE NOTICE '错误信息: %', v_test_metrics.error_message;
        RAISE NOTICE '执行时间: %', v_test_metrics.execution_time;
        RAISE NOTICE '------------------------------------';
    END LOOP;

    -- 显示测试完成信息
    RAISE NOTICE '所有测试执行完成。请查看上方的测试报告。';
END $$;

COMMIT;