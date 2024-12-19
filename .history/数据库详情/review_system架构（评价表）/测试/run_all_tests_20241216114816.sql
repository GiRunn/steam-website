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
\echo '执行测试框架初始化...'
\i '数据库详情/review_system架构（评价表）/测试/00_测试框架.sql'

-- 执行基础数据测试
\echo '执行基础数据测试...'
\i '数据库详情/review_system架构（评价表）/测试/01_基础数据测试.sql'

-- 执行分区测试
\echo '执行分区测试...'
\i '数据库详情/review_system架构（评价表）/测试/02_分区测试.sql'

-- 执行触发器测试
\echo '执行触发器测试...'
\i '数据库详情/review_system架构（评价表）/测试/03_触发器测试.sql'

-- 执行性能测试
\echo '执行性能测试...'
\i '数据库详情/review_system架构（评价表）/测试/04_性能测试.sql'

-- 执行压力测试
\echo '执行压力测试...'
\i '数据库详情/review_system架构（评价表）/测试/05_压力测试.sql'

-- 执行边界测试
\echo '执行边界测试...'
\i '数据库详情/review_system架构（评价表）/测试/06_边界测试.sql'

-- 执行性能基准测试
\echo '执行性能基准测试...'
\i '数据库详情/review_system架构（评价表）/测试/07_性能基准测试.sql'

-- 执行极限测试
\echo '执行极限测试...'
\i '数据库详情/review_system架构（评价表）/测试/08_极限测试.sql'

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
END $$;

COMMIT;

-- 显示测试完成信息
\echo '所有测试执行完成。请查看上方的测试报告。'