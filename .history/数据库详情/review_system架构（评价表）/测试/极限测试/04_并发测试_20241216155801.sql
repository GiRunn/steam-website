-- 并发测试（1分钟限制版本）
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
        '并发测试',
        '初始化',
        v_start_time,
        0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. 并发插入测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '并发插入测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                -- 创建临时表来模拟并发
                CREATE TEMP TABLE IF NOT EXISTS concurrent_ops (
                    id serial,
                    data text
                );
                
                -- 并发插入
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                )
                SELECT 
                    (random() * 1000 + 1)::bigint,
                    (random() * 1000 + 1)::bigint,
                    (random() * 5)::numeric(3,2),
                    'Concurrent test ' || generate_series
                FROM generate_series(1, 100);
                
                v_operations_count := v_operations_count + 100;
                v_success_count := v_success_count + 100;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 500 = 0 THEN
                UPDATE review_system.extreme_test_monitor
                SET operations_count = v_operations_count,
                    success_count = v_success_count,
                    error_count = v_error_count,
                    error_messages = v_error_messages,
                    active_connections = (SELECT count(*) FROM pg_stat_activity),
                    performance_metrics = jsonb_build_object(
                        'operations_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start)),
                        'active_backends', (SELECT count(*) FROM pg_stat_activity)
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;
    END;

    -- 2. 死锁测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '死锁测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                -- 模拟死锁场景
                DECLARE
                    v_pid1 int;
                    v_pid2 int;
                BEGIN
                    SELECT pg_backend_pid() INTO v_pid1;
                    SELECT pg_backend_pid() INTO v_pid2;
                    
                    EXECUTE 'SELECT pg_advisory_lock($1)' USING v_pid1;
                    EXECUTE 'SELECT pg_advisory_lock($1)' USING v_pid2;
                    
                    EXECUTE 'SELECT pg_advisory_unlock($1)' USING v_pid2;
                    EXECUTE 'SELECT pg_advisory_unlock($1)' USING v_pid1;
                END;
                
                v_operations_count := v_operations_count + 1;
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 10 = 0 THEN
                UPDATE review_system.extreme_test_monitor
                SET operations_count = v_operations_count,
                    success_count = v_success_count,
                    error_count = v_error_count,
                    error_messages = v_error_messages
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;
    END;
END $$; 