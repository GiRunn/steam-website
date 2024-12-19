-- 完整测试执行脚本
DO $$
BEGIN
    RAISE NOTICE '开始执行测试套件...';
    
    -- 1. 删除旧的测试框架（如果存在）
    RAISE NOTICE '清理旧的测试框架...';
    DROP TABLE IF EXISTS review_system.test_results CASCADE;
    DROP FUNCTION IF EXISTS review_system.generate_test_report() CASCADE;
    DROP FUNCTION IF EXISTS review_system.record_test_result() CASCADE;
    DROP FUNCTION IF EXISTS review_system.open_test_report() CASCADE;
    DROP FUNCTION IF EXISTS review_system.generate_and_open_report() CASCADE;
    DROP FUNCTION IF EXISTS review_system.get_report_path() CASCADE;
END $$;

-- 2. 创建测试框架
\ir 'test_cases/00_create_test_framework.sql'

-- 3. 设置报告目录
\ir 'test_cases/00_setup_report_directory.sql'

-- 4. 执行所有测试
\ir 'run_all_tests.sql'

RAISE NOTICE '测试套件执行完成！';
END $$; 