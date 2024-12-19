-- 特殊情况测试（1分钟限制版本）
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
        '特殊情况测试',
        '初始化',
        v_start_time,
        0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. 特殊字符测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '特殊字符测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                ) VALUES 
                    (1001, 1, 4.5, '☺️🎮🎲'),
                    (1001, 1, 4.5, '中文测试'),
                    (1001, 1, 4.5, 'مرحبا'),
                    (1001, 1, 4.5, 'Привет'),
                    (1001, 1, 4.5, chr(0) || chr(1) || chr(2)),
                    (1001, 1, 4.5, E'\n\r\t'),
                    (1001, 1, 4.5, '><script>alert(1)</script>');
                
                v_operations_count := v_operations_count + 7;
                v_success_count := v_success_count + 7;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 20 = 0 THEN
                UPDATE review_system.extreme_test_monitor
                SET operations_count = v_operations_count,
                    success_count = v_success_count,
                    error_count = v_error_count,
                    error_messages = v_error_messages,
                    performance_metrics = jsonb_build_object(
                        'operations_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start))
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;
    END;

    -- 2. 边界值测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '边界值测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content, playtime_hours
                ) VALUES 
                    (2147483647, 2147483647, 5.00, '', 2147483647),
                    (1, 1, 0.00, '', 0),
                    (1000, 1000, 2.50, NULL, NULL),
                    (999999999, 999999999, 4.99, repeat('x', 10000), 999999999);
                
                v_operations_count := v_operations_count + 4;
                v_success_count := v_success_count + 4;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 20 = 0 THEN
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