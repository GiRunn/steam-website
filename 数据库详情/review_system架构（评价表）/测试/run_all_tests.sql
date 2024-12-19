-- 开始测试事务
BEGIN;

-- 清理之前的测试结果
DO $$
BEGIN
    -- 删除已存在的测试结果表
    DROP TABLE IF EXISTS review_system.test_results CASCADE;
    
    RAISE NOTICE '已清理现有测试结果';
END $$;

-- 执行基础测试
\i '数据库详情/review_system架构（评价表）/测试/00_测试框架.sql'
\i '数据库详情/review_system架构（评价表）/测试/01_基础数据测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/02_分区测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/03_触发器测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/04_性能测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/05_压力测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/06_边界测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/07_性能基准测试.sql'

-- 执行极限测试
\i '数据库详情/review_system架构（评价表）/测试/极限测试/01_安全测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/极限测试/02_容量测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/极限测试/03_特殊情况测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/极限测试/04_并发测试.sql'
\i '数据库详情/review_system架构（评价表）/测试/极限测试/05_故障恢复测试.sql'

-- 执行测试用例
DO $$
DECLARE
    v_test_result RECORD;
BEGIN
    -- 1. 执行边界测试
    PERFORM review_system.run_test(
        '边界测试套件',
        '边界测试',
        'SELECT * FROM review_system.run_boundary_tests()'
    );

    -- 2. 执行压力测试
    PERFORM review_system.run_test(
        '压力测试套件',
        '压力测试',
        'SELECT * FROM review_system.run_stress_test(100, 1000, interval ''5 minutes'')'
    );

    -- 3. 执行性能基准测试
    PERFORM review_system.run_test(
        '性能基准测试套件',
        '性能测试',
        'SELECT * FROM review_system.run_benchmark_tests(10)'
    );

    -- 4. 执行特殊字符测试
    PERFORM review_system.run_test(
        '特殊字符测试套件',
        '边界测试',
        $$
        SELECT * FROM review_system.test_special_characters(
            ARRAY['☺️🎮🎲', '"><script>alert(1)</script>', 'DROP TABLE reviews; --']
        )
        $$
    );

    -- 5. 执行并发更新测试
    PERFORM review_system.run_test(
        '并发更新测试套件',
        '压力测试',
        'SELECT * FROM review_system.test_concurrent_updates(10, 100)'
    );

    -- 6. 执行分区表性能测试
    PERFORM review_system.run_test(
        '分区表性能测试套件',
        '性能测试',
        'SELECT * FROM review_system.test_partition_performance(3, 1000)'
    );
END $$;

-- 生成测试报告
DO $$
DECLARE
    v_test_metrics RECORD;
    v_total_tests INTEGER;
    v_passed_tests INTEGER;
    v_failed_tests INTEGER;
BEGIN
    -- 获取测试统计
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = '通过') as passed,
        COUNT(*) FILTER (WHERE status = '失败') as failed
    INTO v_total_tests, v_passed_tests, v_failed_tests
    FROM review_system.test_results;

    -- 输出测试报告头部
    RAISE NOTICE '====================================';
    RAISE NOTICE '          测试执行报告              ';
    RAISE NOTICE '====================================';
    RAISE NOTICE '总测试数: %', v_total_tests;
    RAISE NOTICE '通过数: %', v_passed_tests;
    RAISE NOTICE '失败数: %', v_failed_tests;
    RAISE NOTICE '通过率: %', ROUND((v_passed_tests::NUMERIC / v_total_tests * 100), 2) || '%';
    RAISE NOTICE '------------------------------------';

    -- 按类别显示测试结果
    FOR v_test_metrics IN (
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed_tests,
            MAX(execution_time) as max_time,
            MIN(execution_time) as min_time,
            AVG(execution_time) as avg_time
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    ) LOOP
        RAISE NOTICE '测试类别: %', v_test_metrics.test_category;
        RAISE NOTICE '  总数: %', v_test_metrics.total_tests;
        RAISE NOTICE '  通过: %', v_test_metrics.passed_tests;
        RAISE NOTICE '  最长耗时: %', v_test_metrics.max_time;
        RAISE NOTICE '  最短耗时: %', v_test_metrics.min_time;
        RAISE NOTICE '  平均耗时: %', v_test_metrics.avg_time;
        RAISE NOTICE '------------------------------------';
    END LOOP;

    -- 显示失败的测试详情
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
        RAISE NOTICE '失败的测试: %', v_test_metrics.test_name;
        RAISE NOTICE '  类别: %', v_test_metrics.test_category;
        RAISE NOTICE '  错误: %', v_test_metrics.error_message;
        RAISE NOTICE '  耗时: %', v_test_metrics.execution_time;
        RAISE NOTICE '------------------------------------';
    END LOOP;
END $$;

COMMIT;