-- 故障恢复测试（1分钟限制版本）
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
        '故障恢复测试',
        '初始化',
        v_start_time,
        0, 0, 0,
        (SELECT count(*) FROM pg_stat_activity)
    ) RETURNING monitor_id INTO v_monitor_id;

    -- 1. 数据一致性恢复测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '数据一致性恢复测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                -- 创建测试数据
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                ) VALUES (1001, 1, 4.5, '一致性测试');
                
                -- 故意制造不一致
                UPDATE review_system.reviews_partitioned
                SET rating = -1
                WHERE content = '一致性测试';
                
                -- 修复不一致
                UPDATE review_system.reviews_partitioned
                SET rating = CASE 
                    WHEN rating < 0 THEN 0
                    WHEN rating > 5 THEN 5
                    ELSE rating
                END
                WHERE rating < 0 OR rating > 5;
                
                v_operations_count := v_operations_count + 3;
                v_success_count := v_success_count + 3;
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
                        'operations_per_second', v_operations_count::float / EXTRACT(EPOCH FROM (clock_timestamp() - v_test_start))
                    )
                WHERE monitor_id = v_monitor_id;
            END IF;
        END LOOP;
    END;

    -- 2. 备份恢复测试（限时1分钟）
    BEGIN
        v_test_start := clock_timestamp();
        v_operations_count := 0;
        v_success_count := 0;
        v_error_count := 0;
        
        UPDATE review_system.extreme_test_monitor
        SET test_phase = '备份恢复测试'
        WHERE monitor_id = v_monitor_id;

        WHILE clock_timestamp() < v_test_start + interval '1 minute' LOOP
            BEGIN
                -- 创建测试表
                CREATE TEMP TABLE backup_test (
                    id serial,
                    data text
                );
                
                -- 插入测试数据
                INSERT INTO backup_test (data)
                SELECT 'Test data ' || generate_series
                FROM generate_series(1, 100);
                
                -- 模拟备份
                CREATE TEMP TABLE backup_test_copy AS
                SELECT * FROM backup_test;
                
                -- 模拟数据丢失
                DELETE FROM backup_test;
                
                -- 从备份恢复
                INSERT INTO backup_test
                SELECT * FROM backup_test_copy;
                
                -- 清理
                DROP TABLE backup_test;
                DROP TABLE backup_test_copy;
                
                v_operations_count := v_operations_count + 1;
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                v_error_messages := array_append(v_error_messages, SQLERRM);
            END;
            
            -- 更新监控记录
            IF v_operations_count % 5 = 0 THEN
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