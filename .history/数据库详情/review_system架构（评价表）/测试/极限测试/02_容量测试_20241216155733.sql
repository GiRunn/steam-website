-- 容量测试（1分钟限制版本）
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_test_start TIMESTAMP;
    v_monitor_id INTEGER;
    v_operations_count INTEGER := 0;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_error_messages TEXT[] := ARRAY[]::TEXT[];
    v_test_content text;
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
        '容量测试',
        '初始化',
        v_start_time,
        0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. 大规模数据测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '大规模数据测试',
            performance_metrics = jsonb_build_object(
                'target_records', 10000,
                'batch_size', 1000
            )
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content, playtime_hours,
                    platform, language, is_recommended
                )
                SELECT 
                    (random() * 1000 + 1)::bigint,
                    (random() * 1000 + 1)::bigint,
                    (random() * 5)::numeric(3,2),
                    'Capacity test review ' || v_operations_count,
                    (random() * 100)::integer,
                    CASE (random() * 2)::integer 
                        WHEN 0 THEN 'PC'
                        WHEN 1 THEN 'PS5'
                        ELSE 'XBOX'
                    END,
                    CASE (random() * 4)::integer
                        WHEN 0 THEN 'zh-CN'
                        WHEN 1 THEN 'en-US'
                        WHEN 2 THEN 'ja-JP'
                        ELSE 'es-ES'
                    END,
                    random() > 0.5
                FROM generate_series(1, 100);
                
                v_operations_count := v_operations_count + 100;
                v_success_count := v_success_count + 100;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 1000 = 0 THEN
                UPDATE review_system.extreme_test_monitor
                SET operations_count = v_operations_count,
                    success_count = v_success_count,
                    error_count = v_error_count,
                    error_messages = v_error_messages,
                    cpu_usage = (SELECT COALESCE(cpu_usage, 0) FROM pg_stat_activity WHERE pid = pg_backend_pid()),
                    memory_usage = (SELECT COALESCE(total_exec_time, 0) FROM pg_stat_statements WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user) LIMIT 1),
                    active_connections = (SELECT count(*) FROM pg_stat_activity),
                    performance_metrics = jsonb_build_object(
                        'records_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start)),
                        'average_batch_time', (SELECT avg(total_exec_time) FROM pg_stat_statements WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user))
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;

        -- 记录最终结果
        UPDATE review_system.extreme_test_monitor
        SET end_time = clock_timestamp(),
            duration = clock_timestamp() - v_test_start
        WHERE monitor_id = v_monitor_id;
    EXCEPTION WHEN OTHERS THEN
        UPDATE review_system.extreme_test_monitor
        SET error_messages = array_append(v_error_messages, SQLERRM),
            end_time = clock_timestamp(),
            duration = clock_timestamp() - v_test_start
        WHERE monitor_id = v_monitor_id;
    END;

    -- 2. 超长内容测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '超长内容测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                -- 生成大约1MB的测试内容
                v_test_content := repeat('这是一个超长的评论内容', 50000);
                
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                ) VALUES (
                    1001, 1, 4.5, v_test_content
                );
                
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
                    error_messages = v_error_messages,
                    performance_metrics = jsonb_build_object(
                        'content_size_mb', length(v_test_content)::float / 1024 / 1024,
                        'operations_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start))
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;
    END;
END $$; 