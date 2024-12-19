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
    
    -- 2. 创建测试框架
    RAISE NOTICE '创建测试框架...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/00_create_test_framework.sql'
    
    -- 3. 设置报告目录
    RAISE NOTICE '设置报告目录...';
    \i '数据库详情/review_system架构（评价表）/测试报告/test_cases/00_setup_report_directory.sql'
    
    -- 4. 执行所有测试
    RAISE NOTICE '执行测试用例...';
    \i '数据库详情/review_system架构（评价表）/测试报告/run_all_tests.sql'
    
    RAISE NOTICE '测试套件执行完成！';
END $$; 