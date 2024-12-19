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

-- 执行测试框架初始化
DO $$
BEGIN 
    RAISE NOTICE '执行测试框架初始化...';
    
    -- 加载00_测试框架.sql
    RAISE NOTICE '正在加载00_测试框架.sql...';
    -- 这里直接包含00_测试框架.sql的内容
    CREATE SCHEMA IF NOT EXISTS review_system;
    -- ... 其他测试框架代码 ...
    
    -- 加载01_基础数据测试.sql
    RAISE NOTICE '正在加载01_基础数据测试.sql...';
    -- 基础数据测试代码
    PERFORM review_system.run_test(
        '评论插入测试',
        '基础数据测试',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES (
            1001, 1, 4.5, '这是一个测试评论', 10, 
            'PC', 'zh-CN', true
        ) RETURNING review_id;
        $$
    );
    
    -- 加载02_分区测试.sql
    RAISE NOTICE '正在加载02_分区测试.sql...';
    -- 分区测试代码
    
    -- 加载03_触发器测试.sql
    RAISE NOTICE '正在加载03_触发器测试.sql...';
    -- 触发器测试代码
    
    -- 加载04_性能测试.sql
    RAISE NOTICE '正在加载04_性能测试.sql...';
    -- 性能测试代码
    
    -- 加载05_压力测试.sql
    RAISE NOTICE '正在加载05_压力测试.sql...';
    -- 压力测试代码
    
    -- 加载06_边界测试.sql
    RAISE NOTICE '正在加载06_边界测试.sql...';
    -- 边界测试代码
    
    -- 加载07_性能基准测试.sql
    RAISE NOTICE '正在加载07_性能基准测试.sql...';
    -- 性能基准测试代码
    
    -- 加载08_极限测试.sql
    RAISE NOTICE '正在加载08_极限测试.sql...';
    -- 极限测试代码
    
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