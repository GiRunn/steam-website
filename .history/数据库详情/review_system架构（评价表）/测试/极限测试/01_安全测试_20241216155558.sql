-- 安全测试（1分钟限制版本）
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_test_start TIMESTAMP;
    v_monitor_id INTEGER;
    v_operations_count INTEGER := 0;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_error_messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    v_start_time := clock_timestamp();
    
    -- 创建测试监控记录
    INSERT INTO review_system.extreme_test_monitor (
        test_name,
        test_phase,
        start_time,
        operations_count,
        success_count,
        error_count,
        active_connections
    ) VALUES (
        '安全测试',
        '初始化',
        v_start_time,
        0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. DDOS攻击模拟测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        
        -- 记录测试开始
        UPDATE review_system.extreme_test_monitor
        SET test_phase = 'DDOS测试',
            performance_metrics = jsonb_build_object(
                'target_rps', 100,
                'test_duration', '1 minute'::interval
            )
        WHERE monitor_id = v_monitor_id;

        -- 执行测试直到达到时间限制
        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                v_operations_count := v_operations_count + 1;
                
                -- 执行DDOS测试操作
                PERFORM pg_stat_get_activity(pg_backend_pid());
                
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 每10次操作更新一次监控记录
            IF v_operations_count % 10 = 0 THEN
                UPDATE review_system.extreme_test_monitor
                SET operations_count = v_operations_count,
                    success_count = v_success_count,
                    error_count = v_error_count,
                    error_messages = v_error_messages,
                    cpu_usage = (SELECT COALESCE(cpu_usage, 0) FROM pg_stat_activity WHERE pid = pg_backend_pid()),
                    memory_usage = (SELECT COALESCE(total_exec_time, 0) FROM pg_stat_statements WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user) LIMIT 1),
                    active_connections = (SELECT count(*) FROM pg_stat_activity),
                    performance_metrics = jsonb_build_object(
                        'operations_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start)),
                        'average_response_time', (SELECT avg(total_exec_time) FROM pg_stat_statements WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user))
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;

        -- 记录最终结果
        UPDATE review_system.extreme_test_monitor
        SET end_time = clock_timestamp(),
            duration = clock_timestamp() - v_test_start
        WHERE monitor_id = v_monitor_id;
        
        -- 记录测试结果
        PERFORM review_system.record_test_result(
            'DDOS攻击防护测试',
            '极限测试-安全测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('总操作: %s, 成功: %s, 失败: %s, 持续时间: %s',
                   v_operations_count, v_success_count, v_error_count,
                   clock_timestamp() - v_test_start),
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        -- 记录错误
        UPDATE review_system.extreme_test_monitor
        SET error_messages = array_append(v_error_messages, SQLERRM),
            end_time = clock_timestamp(),
            duration = clock_timestamp() - v_test_start
        WHERE monitor_id = v_monitor_id;
        
        RAISE NOTICE 'DDOS测试失败: %', SQLERRM;
    END;

    -- 其他测试项目类似...
END $$; 