-- 安全测试（增强版）
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_test_start TIMESTAMP;
    v_monitor_id INTEGER;
    v_operations_count INTEGER := 0;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_error_messages TEXT[] := ARRAY[]::TEXT[];
    v_concurrent_users INTEGER := 100; -- 增加并发用户数
BEGIN
    v_start_time := clock_timestamp();
    
    -- 创建测试监控记录
    INSERT INTO review_system.extreme_test_monitor (
        test_name, test_phase, start_time, operations_count, 
        success_count, error_count, active_connections
    ) VALUES (
        '安全测试', '初始化', v_start_time, 0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. DDOS攻击模拟测试（增强版）
    BEGIN
        v_test_start := clock_timestamp();
        
        -- 记录测试开始
        UPDATE review_system.extreme_test_monitor
        SET test_phase = 'DDOS测试',
            performance_metrics = jsonb_build_object(
                'target_rps', 1000, -- 增加目标RPS
                'test_duration', '1 minute'::interval
            )
        WHERE monitor_id = v_monitor_id;

        -- 执行测试直到达到时间限制
        FOR i IN 1..v_concurrent_users LOOP
            FOR j IN 1..100 LOOP -- 每个用户执行100次操作
                BEGIN
                    -- 模拟各种攻击行为
                    CASE (random() * 4)::INTEGER
                        WHEN 0 THEN -- 连接泛洪
                            PERFORM pg_stat_get_activity(pg_backend_pid());
                            
                        WHEN 1 THEN -- 资源消耗
                            PERFORM COUNT(*) 
                            FROM review_system.reviews_partitioned 
                            WHERE created_at >= CURRENT_TIMESTAMP - interval '1 year';
                            
                        WHEN 2 THEN -- CPU密集操作
                            PERFORM md5(repeat('x', 10000));
                            
                        WHEN 3 THEN -- IO密集操作
                            PERFORM pg_relation_size('review_system.reviews_partitioned');
                            
                        ELSE -- 内存消耗
                            PERFORM array_agg(i) 
                            FROM generate_series(1, 10000) i;
                    END CASE;
                    
                    v_operations_count := v_operations_count + 1;
                    v_success_count := v_success_count + 1;

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

                EXCEPTION WHEN OTHERS THEN
                    v_error_count := v_error_count + 1;
                    v_error_messages := array_append(v_error_messages, SQLERRM);
                END;
            END LOOP;
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
                   clock_timestamp() - v_start_time),
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. SQL注入测试
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..1000 LOOP -- 增加测试次数
            BEGIN
                -- 尝试各种SQL注入模式
                EXECUTE format(
                    'SELECT * FROM review_system.reviews_partitioned WHERE content = %L',
                    format(
                        E'test\'; DROP TABLE review_system.reviews_partitioned; --\n' ||
                        E'test\'; DELETE FROM review_system.reviews_partitioned; --\n' ||
                        E'test\' UNION SELECT * FROM pg_user; --\n' ||
                        E'test\' OR \'1\'=\'1'
                    )
                );
                
                v_operations_count := v_operations_count + 1;
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
        END LOOP;
        
        -- 记录SQL注入测试结果
        PERFORM review_system.record_test_result(
            'SQL注入防护测试',
            '极限测试-安全测试',
            CASE WHEN v_error_count > 0 THEN '通过' ELSE '失败' END,
            format('尝试次数: %s, 成功注入: %s, 被阻止: %s',
                   v_operations_count, v_success_count, v_error_count),
            clock_timestamp() - v_test_start
        );
    END;

    -- 3. 权限提升测试
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..100 LOOP -- 增加测试次数
            BEGIN
                -- 尝试执行需要高权限的操作
                EXECUTE 'CREATE ROLE test_role_' || i || ' LOGIN';
                EXECUTE 'DROP ROLE test_role_' || i;
                EXECUTE 'SELECT pg_read_file(''/etc/passwd'')';
                EXECUTE 'SELECT pg_sleep(1)';
                
                v_operations_count := v_operations_count + 1;
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
        END LOOP;
        
        -- 记录权限提升测试结果
        PERFORM review_system.record_test_result(
            '权限提升防护测试',
            '极限测试-安全测试',
            CASE WHEN v_error_count > 0 THEN '通过' ELSE '失败' END,
            format('尝试次数: %s, 成功提权: %s, 被阻止: %s',
                   v_operations_count, v_success_count, v_error_count),
            clock_timestamp() - v_test_start
        );
    END;
END $$; 