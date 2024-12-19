-- 执行所有测试
BEGIN;

-- 清理之前的测试结果
TRUNCATE TABLE review_system.test_results;

-- 执行测试框架初始化
\i '00_测试框架.sql'

-- 执行各类测试
\i '01_基础数据测试.sql'
\i '02_分区测试.sql'
\i '03_触发器测试.sql'
\i '04_性能测试.sql'

-- 生成测试报告
SELECT * FROM review_system.generate_test_report();

-- 显示失败的测试详情
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

COMMIT;