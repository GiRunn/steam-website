-- 开始测试事务
BEGIN;

-- 清理之前的测试结果
TRUNCATE TABLE review_system.test_results;

-- 执行基础数据测试
DO $$
BEGIN
    RAISE NOTICE '开始执行基础数据测试...';
END $$;

\ir '01_基础数据测试.sql'

-- 执行分区测试
DO $$
BEGIN
    RAISE NOTICE '开始执行分区测试...';
END $$;

\ir '02_分区测试.sql'

-- 执行触发器测试
DO $$
BEGIN
    RAISE NOTICE '开始执行触发器测试...';
END $$;

\ir '03_触发器测试.sql'

-- 执行性能测试
DO $$
BEGIN
    RAISE NOTICE '开始执行性能测试...';
END $$;

\ir '04_性能测试.sql'

-- 生成并显示测试报告
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '测试执行完成，生成报告：';
    RAISE NOTICE '------------------------';
END $$;

-- 显示测试统计报告
SELECT 
    类别,
    总测试数,
    通过数,
    失败数,
    通过率,
    平均执行时间
FROM review_system.generate_test_report();

-- 显示失败的测试详情
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '失败测试详情：';
    RAISE NOTICE '------------------------';
END $$;

SELECT 
    test_name as "测试名称",
    test_category as "测试类别",
    status as "状态",
    error_message as "错误信息",
    execution_time as "执行时间",
    executed_at as "执行时间"
FROM review_system.test_results 
WHERE status = '失败'
ORDER BY executed_at;

-- 显示性能测试结果
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '性能测试结果：';
    RAISE NOTICE '------------------------';
END $$;

SELECT 
    test_name as "测试名称",
    execution_time as "执行时间"
FROM review_system.test_results 
WHERE test_category = '性能测试'
ORDER BY execution_time DESC;

COMMIT;

-- 提示测试完成
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '所有测试执行完成！';
    RAISE NOTICE '------------------------';
END $$;