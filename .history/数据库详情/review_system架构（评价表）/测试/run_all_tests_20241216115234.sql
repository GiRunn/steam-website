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

    -- 加载08_极限测试.sql中的函数
    CREATE OR REPLACE FUNCTION review_system.run_stress_test(
        p_concurrent_users INTEGER,
        p_operations_per_user INTEGER,
        p_test_duration INTERVAL,
        p_analyze BOOLEAN DEFAULT FALSE
    ) RETURNS TABLE (
        metric_name TEXT,
        metric_value NUMERIC,
        unit TEXT
    ) AS $BODY$
    DECLARE
        v_start_time TIMESTAMP;
        v_end_time TIMESTAMP;
        v_success_count INTEGER := 0;
        v_error_count INTEGER := 0;
        v_connection_count INTEGER := 0;
    BEGIN
        v_start_time := clock_timestamp();
        v_end_time := v_start_time + p_test_duration;

        -- 创建多个连接并发送请求
        WHILE clock_timestamp() < v_end_time LOOP
            BEGIN
                -- 模拟大量并发连接
                FOR i IN 1..p_requests_per_second LOOP
                    -- 随机选择攻击类型
                    CASE (random() * 4)::INTEGER
                        WHEN 0 THEN -- 连接泛洪
                            PERFORM pg_stat_get_activity(pg_backend_pid());
                            v_connection_count := v_connection_count + 1;
                        
                        WHEN 1 THEN -- 资源消耗
                            PERFORM COUNT(*) 
                            FROM review_system.reviews_partitioned 
                            WHERE created_at >= CURRENT_TIMESTAMP - interval '1 year';
                            
                        WHEN 2 THEN -- CPU密集操作
                            PERFORM md5(repeat('x', 10000));
                            
                        WHEN 3 THEN -- IO密集操作
                            PERFORM pg_relation_size('review_system.reviews_partitioned');
                            
                        ELSE -- 内存消耗
                            PERFORM array_agg(i) 
                            FROM generate_series(1, 10000) i;
                    END CASE;
                    
                    v_success_count := v_success_count + 1;
                END LOOP;

                -- 模拟请求间隔
                PERFORM pg_sleep(0.001); -- 1ms间隔
                
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;

        -- 返回测试指标
        RETURN QUERY
        SELECT 'Total Connections'::TEXT, v_connection_count::NUMERIC, 'connections'::TEXT;
        
        RETURN QUERY
        SELECT 'Successful Requests'::TEXT, v_success_count::NUMERIC, 'requests'::TEXT;
        
        RETURN QUERY
        SELECT 'Failed Requests'::TEXT, v_error_count::NUMERIC, 'requests'::TEXT;
        
        RETURN QUERY
        SELECT 'Average RPS'::TEXT, 
               (v_success_count::NUMERIC / EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time))), 
               'requests/second'::TEXT;
    END;
    $BODY$ LANGUAGE plpgsql;

    -- 从08_极限测试.sql复制其他函数...
    [这里继续复制其他函数]

    -- 从06_边界测试.sql复制函数...
    [这里复制边界测试函数]

END $$;

-- 执行测试
DO $$
BEGIN
    -- 基础数据测试
    RAISE NOTICE '执行基础数据测试...';
    
    -- 从01_基础数据测试.sql复制测试用例
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

    -- 测试评论回复插入
    PERFORM review_system.run_test(
        '评论回复插入测试',
        '基础数据测试',
        $test_sql$
        DO $test$
        BEGIN
            INSERT INTO review_system.review_replies_partitioned (
                review_id, user_id, content, language
            ) VALUES (
                1, 2, '这是一个测试回复', 'zh-CN'
            );
        END $test$;
        $test_sql$
    );

    -- 测试数据完整性约束
    PERFORM review_system.run_test(
        '评分范围约束测试',
        '基础数据测试',
        $test_sql$
        DO $test$
        BEGIN
            BEGIN
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                ) VALUES (
                    1001, 1, 5.5, '这个评分应该失败'
                );
                RAISE EXCEPTION '约束测试失败：允许了超出范围的评分';
            EXCEPTION WHEN check_violation THEN
                -- 预期的异常，测试通过
                NULL;
            END;
        END $test$;
        $test_sql$
    );

    -- 从08_极限测试.sql复制测试用例
    -- 执行压力测试
    PERFORM review_system.run_test(
        '极限并发压力测试',
        '压力测试',
        $test_sql$
        SELECT * FROM review_system.run_stress_test(
            10000,              -- 10000个并发用户
            100000,            -- 每用户100000次操作
            '30 minutes'::INTERVAL  -- 最长运行30分钟
        );
        $test_sql$
    );

    -- [继续添加其他测试用例]
    
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