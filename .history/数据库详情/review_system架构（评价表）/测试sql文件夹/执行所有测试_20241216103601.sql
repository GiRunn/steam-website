-- 连接数据库
\c games

-- 清理之前的测试结果
TRUNCATE TABLE review_system.test_results;

-- 执行所有测试
\i '数据库详情/review_system架构（评价表）/测试sql文件夹/00_测试框架.sql'
\i '数据库详情/review_system架构（评价表）/测试sql文件夹/01_基础数据测试.sql'
\i '数据库详情/review_system架构（评价表）/测试sql文件夹/02_分区测试.sql'
\i '数据库详情/review_system架构（评价表）/测试sql文件夹/03_触发器测试.sql'
\i '数据库详情/review_system架构（评价表）/测试sql文件夹/04_性能测试.sql'

-- 生成测试报告
SELECT * FROM review_system.generate_test_report();

-- 查看失败的测试详情
SELECT 
    test_name as 测试名称,
    test_category as 测试类别,
    error_message as 错误信息,
    execution_time as 执行时间
FROM review_system.test_results 
WHERE NOT result
ORDER BY execution_time DESC;