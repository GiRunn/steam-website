-- 执行所有测试并生成报告
DO $$
BEGIN
    -- 1. 确保测试环境准备就绪
    RAISE NOTICE '准备测试环境...';
END $$;

-- 2. 执行所有测试用例
\ir 'test_cases/01_basic_operations.sql'
\ir 'test_cases/02_partition_tests.sql'
\ir 'test_cases/03_performance_tests.sql'
\ir 'test_cases/04_trigger_tests.sql'

-- 3. 生成并打开测试报告
DO $$
BEGIN
    RAISE NOTICE '生成测试报告...';
    PERFORM review_system.generate_and_open_report();
    RAISE NOTICE '测试执行完成！';
END $$;