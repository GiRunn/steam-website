-- 安全测试
DO $$
DECLARE
    v_start_time timestamp;
BEGIN
    -- 1. DDOS攻击模拟测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.simulate_ddos_attack(
            100,  -- 每秒请求数
            interval '10 seconds'  -- 测试持续时间
        );
        
        PERFORM review_system.record_test_result(
            'DDOS攻击防护测试',
            '极限测试-安全测试',
            '通过',
            '成功模拟DDOS攻击并测试防护机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            'DDOS攻击防护测试',
            '极限测试-安全测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. SQL注入测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_sql_injection(ARRAY[
            '1; DROP TABLE test;',
            'admin'' --',
            '1 UNION SELECT * FROM users',
            '1; DELETE FROM reviews;'
        ]);
        
        PERFORM review_system.record_test_result(
            'SQL注入防护测试',
            '极限测试-安全测试',
            '通过',
            '成功测试SQL注入防护机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            'SQL注入防护测试',
            '极限测试-安全测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 3. XSS防护测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_xss_protection(ARRAY[
            '<script>alert("xss")</script>',
            '<img src="x" onerror="alert(1)">',
            'javascript:alert(1)',
            '<svg onload="alert(1)">'
        ]);
        
        PERFORM review_system.record_test_result(
            'XSS防护测试',
            '极限测试-安全测试',
            '通过',
            '成功测试XSS防护机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            'XSS防护测试',
            '极限测试-安全测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 4. 权限提升测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_privilege_escalation();
        
        PERFORM review_system.record_test_result(
            '权限提升防护测试',
            '极限测试-安全测试',
            '通过',
            '成功测试权限提升防护机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '权限提升防护测试',
            '极限测试-安全测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;
END $$; 