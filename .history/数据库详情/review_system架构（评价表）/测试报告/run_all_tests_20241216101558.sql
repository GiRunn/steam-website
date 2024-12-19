-- 执行所有测试并生成报告
DO $$
BEGIN
    -- 1. 确保测试环境准备就绪
    RAISE NOTICE '准备测试环境...';
    
    -- 2. 执行所有测试用例
    RAISE NOTICE '开始执行测试...';
    
    -- 基础操作测试
    RAISE NOTICE '执行基础操作测试...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/01_basic_operations.sql'
    
    -- 分区测试
    RAISE NOTICE '执行分区测试...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/02_partition_tests.sql'
    
    -- 性能测试
    RAISE NOTICE '执行性能测试...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/03_performance_tests.sql'
    
    -- 触发器测试
    RAISE NOTICE '执行触发器测试...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/04_trigger_tests.sql'
    
    -- 3. 生成并打开测试报告
    RAISE NOTICE '生成测试报告...';
    PERFORM review_system.generate_and_open_report();
    
    RAISE NOTICE '测试执行完成！';
END $$;