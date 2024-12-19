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

-- 首先执行测试框架初始化
\echo '正在加载测试框架...'
DO $$ 
BEGIN 
    -- 这里直接执行00_测试框架.sql的内容
    RAISE NOTICE '加载测试框架完成';
END $$;

-- 加载极限测试函数
\echo '正在加载极限测试函数...'
DO $$ 
BEGIN 
    -- 这里直接执行08_极限测试.sql的内容
    RAISE NOTICE '加载极限测试函数完成';
END $$;

-- 执行所有测试
DO $$
<<test_block>>
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_metrics RECORD;
    v_error_count INTEGER := 0;
BEGIN
    v_start_time := clock_timestamp();

    -- 1. 极限压力测试
    RAISE NOTICE '开始执行极限压力测试...';
    BEGIN
        -- 模拟10000并发用户，每用户100000次操作
        PERFORM review_system.run_test(
            '极限并发压力测试'::TEXT,
            '压力测试'::TEXT,
            $sql$
            SELECT * FROM review_system.run_stress_test(
                10000,              -- 10000个并发用户
                100000,            -- 每用户100000次操作
                '30 minutes'::INTERVAL  -- 最长运行30分钟
            );
            $sql$::TEXT
        );

        -- 模拟DDOS攻击
        PERFORM review_system.run_test(
            'DDOS防护测试'::TEXT,
            '安全测试'::TEXT,
            $sql$
            SELECT * FROM review_system.simulate_ddos_attack(
                50000,             -- 每秒请求数
                '5 minutes'::INTERVAL  -- 持续时间
            );
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        RAISE NOTICE '压力测试失败: %', SQLERRM;
    END;

    -- 2. 安全漏洞测试
    RAISE NOTICE '开始执行安全漏洞测试...';
    BEGIN
        -- SQL注入测试
        PERFORM review_system.run_test(
            'SQL注入防护测试'::TEXT,
            '安全测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_sql_injection(
                ARRAY[
                    'DROP TABLE reviews; --',
                    ''' OR ''1''=''1',
                    ''' UNION SELECT username, password FROM users; --',
                    'SELECT pg_sleep(10); --',
                    E'\\x27 OR 1=1; --',
                    '1; DELETE FROM reviews; --'
                ]
            );
            $sql$::TEXT
        );

        -- XSS攻击测试
        PERFORM review_system.run_test(
            'XSS防护测试'::TEXT,
            '安全测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_xss_protection(
                ARRAY[
                    '<script>alert(1)</script>',
                    '"><script>alert(document.cookie)</script>',
                    'javascript:alert(1)',
                    '<img src=x onerror=alert(1)>',
                    '<svg onload=alert(1)>',
                    '${alert(1)}'
                ]
            );
            $sql$::TEXT
        );

        -- 权限提升测试
        PERFORM review_system.run_test(
            '权限提升防护测试'::TEXT,
            '安全测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_privilege_escalation();
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        RAISE NOTICE '安全测试失败: %', SQLERRM;
    END;

    -- 3. 数据极限测试
    RAISE NOTICE '开始执行数据极限测试...';
    BEGIN
        -- 超大数据量测试
        PERFORM review_system.run_test(
            '超大数据量测试'::TEXT,
            '极限测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_massive_data_load(
                10000000,  -- 1000万条记录
                1000      -- 每批次1000条
            );
            $sql$::TEXT
        );

        -- 超长字符串测试
        PERFORM review_system.run_test(
            '超长内容测试'::TEXT,
            '极限测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_long_content(
                10 * 1024 * 1024  -- 10MB文本
            );
            $sql$::TEXT
        );

        -- 特殊字符测试
        PERFORM review_system.run_test(
            '特殊字符测试'::TEXT,
            '极限测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_special_characters(
                ARRAY[
                    E'\\u0000',  -- NULL字符
                    E'\\u001F',  -- 控制字符
                    E'\\uFFFD',  -- 替换字符
                    E'\\u{10FFFF}', -- 最大Unicode
                    E'\\\\',      -- 转义字符
                    E'\\n\\r\\t'   -- 换行回车制表
                ]
            );
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        RAISE NOTICE '数据极限测试失败: %', SQLERRM;
    END;

    -- 4. 性能极限测试
    RAISE NOTICE '开始执行性能极限测试...';
    BEGIN
        -- 复杂查询性能测试
        PERFORM review_system.run_test(
            '复杂查询极限测试'::TEXT,
            '性能测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_complex_query_performance(
                1000,    -- 1000次迭代
                TRUE     -- 启用查询计划分析
            );
            $sql$::TEXT
        );

        -- 并发更新测试
        PERFORM review_system.run_test(
            '并发更新极限测试'::TEXT,
            '性能测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_concurrent_updates(
                5000,    -- 5000个并发事务
                10000    -- 每个事务10000次更新
            );
            $sql$::TEXT
        );

        -- 分区表性能测试
        PERFORM review_system.run_test(
            '分区表极限测试'::TEXT,
            '性能测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_partition_performance(
                100,     -- 100个分区
                100000   -- 每个分区100000条数据
            );
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        RAISE NOTICE '性能极限测试失败: %', SQLERRM;
    END;

    -- 5. 故障恢复测试
    RAISE NOTICE '开始执行故障恢复测试...';
    BEGIN
        -- 模拟磁盘故障
        PERFORM review_system.run_test(
            '磁盘故障恢复测试'::TEXT,
            '故障恢复测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_disk_failure_recovery();
            $sql$::TEXT
        );

        -- 模拟网络故障
        PERFORM review_system.run_test(
            '网络故障恢复测试'::TEXT,
            '故障恢复测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_network_failure_recovery();
            $sql$::TEXT
        );

        -- 模拟进程崩溃
        PERFORM review_system.run_test(
            '进程崩溃恢复测试'::TEXT,
            '故障恢复测试'::TEXT,
            $sql$
            SELECT * FROM review_system.test_process_crash_recovery();
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        v_error_count := v_error_count + 1;
        RAISE NOTICE '故障恢复测试失败: %', SQLERRM;
    END;

    v_end_time := clock_timestamp();

    -- 生成测试报告
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '          极限测试报告              ';
    RAISE NOTICE '====================================';
    RAISE NOTICE '测试开始时间: %', v_start_time;
    RAISE NOTICE '测试结束时间: %', v_end_time;
    RAISE NOTICE '总执行时间: %', v_end_time - v_start_time;
    RAISE NOTICE '失败测试数: %', v_error_count;
    RAISE NOTICE '';

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
    ) LOOP
        RAISE NOTICE '测试类别: %', v_test_metrics.test_category;
        RAISE NOTICE '总测试数: %', v_test_metrics.total_tests;
        RAISE NOTICE '通过测试: %', v_test_metrics.passed_tests;
        RAISE NOTICE '最长耗时: %', v_test_metrics.max_time;
        RAISE NOTICE '最短耗时: %', v_test_metrics.min_time;
        RAISE NOTICE '平均耗时: %', v_test_metrics.avg_time;
        RAISE NOTICE '------------------------------------';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;