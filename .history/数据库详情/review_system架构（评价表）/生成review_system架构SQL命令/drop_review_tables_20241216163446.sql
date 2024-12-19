-- 删除所有相关表和函数
DO $$
BEGIN
    -- 删除表（如果存在）
    DROP TABLE IF EXISTS review_system.reviews_partitioned CASCADE;
    DROP TABLE IF EXISTS review_system.review_replies_partitioned CASCADE;
    DROP TABLE IF EXISTS review_system.review_summary_partitioned CASCADE;
    DROP TABLE IF EXISTS review_system.review_audit_log CASCADE;
    DROP TABLE IF EXISTS review_system.partition_management CASCADE;
    
    -- 不删除测试相关的表和函数
    -- DROP TABLE IF EXISTS review_system.test_results CASCADE;
    -- DROP TABLE IF EXISTS review_system.extreme_test_monitor CASCADE;
    -- DROP FUNCTION IF EXISTS review_system.record_test_result CASCADE;
END $$;