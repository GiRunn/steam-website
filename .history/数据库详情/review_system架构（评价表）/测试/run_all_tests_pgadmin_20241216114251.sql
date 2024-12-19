-- 开始测试事务
BEGIN;

-- 清理已存在的对象
DO $$
BEGIN
    -- 删除函数
    DROP FUNCTION IF EXISTS review_system.assert_equals(TEXT, ANYELEMENT, ANYELEMENT);
    DROP FUNCTION IF EXISTS review_system.run_test(TEXT, TEXT, TEXT);
    DROP FUNCTION IF EXISTS review_system.generate_test_report();
    DROP FUNCTION IF EXISTS review_system.cleanup_test_data();
    DROP FUNCTION IF EXISTS review_system.run_stress_test(INTEGER, INTEGER, INTERVAL);
    DROP FUNCTION IF EXISTS review_system.simulate_ddos_attack(INTEGER, INTERVAL);
    DROP FUNCTION IF EXISTS review_system.test_sql_injection(TEXT[]);
    DROP FUNCTION IF EXISTS review_system.test_xss_protection(TEXT[]);
    DROP FUNCTION IF EXISTS review_system.test_privilege_escalation();
    DROP FUNCTION IF EXISTS review_system.test_massive_data_load(INTEGER, INTEGER);
    DROP FUNCTION IF EXISTS review_system.test_long_content(INTEGER);
    DROP FUNCTION IF EXISTS review_system.test_special_characters(TEXT[]);
    DROP FUNCTION IF EXISTS review_system.test_complex_query_performance(INTEGER, BOOLEAN);
    DROP FUNCTION IF EXISTS review_system.test_concurrent_updates(INTEGER, INTEGER);
    DROP FUNCTION IF EXISTS review_system.test_partition_performance(INTEGER, INTEGER);
    DROP FUNCTION IF EXISTS review_system.test_disk_failure_recovery();
    DROP FUNCTION IF EXISTS review_system.test_network_failure_recovery();
    DROP FUNCTION IF EXISTS review_system.test_process_crash_recovery();
    
    -- 删除临时表
    DROP TABLE IF EXISTS temp_test_metrics;
    DROP TABLE IF EXISTS review_system.test_results;
    
    RAISE NOTICE '已清理现有测试对象';
END $$;

-- 创建测试结果临时表
CREATE TEMP TABLE temp_test_metrics (
    test_id SERIAL PRIMARY KEY,
    test_category TEXT,
    metric_name TEXT,
    metric_value NUMERIC,
    details TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- [这里插入00_测试框架.sql的内容]

-- [这里插入08_极限测试.sql的内容]

-- [执行测试的代码保持不变]

COMMIT; 