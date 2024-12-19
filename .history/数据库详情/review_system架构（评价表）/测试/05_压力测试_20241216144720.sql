-- 压力测试
DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_execution_time interval;
    v_success_count integer := 0;
    v_error_count integer := 0;
    v_concurrent_users integer := 100;
    v_operations_per_user integer := 100;
BEGIN
    -- 并发插入测试
    BEGIN
        v_start_time := clock_timestamp();
        
        FOR i IN 1..v_concurrent_users LOOP
            FOR j IN 1..v_operations_per_user LOOP
                BEGIN
                    INSERT INTO review_system.reviews_partitioned (
                        game_id, user_id, rating, content
                    ) VALUES (
                        (random() * 1000 + 1)::bigint,
                        i,
                        (random() * 5)::numeric(3,2),
                        format('Stress test review from user %s - operation %s', i, j)
                    );
                    v_success_count := v_success_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    v_error_count := v_error_count + 1;
                END;
            END LOOP;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '并发插入压力测试',
            '压力测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('成功: %s, 失败: %s, 总耗时: %s', 
                   v_success_count, v_error_count, v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '并发插入压力测试',
            '压力测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 并发查询测试
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..v_concurrent_users LOOP
            BEGIN
                PERFORM COUNT(*) 
                FROM review_system.reviews_partitioned
                WHERE user_id = i
                AND created_at >= CURRENT_DATE - interval '30 days';
                
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '并发查询压力测试',
            '压力测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('成功查询: %s, 失败: %s, 总耗时: %s', 
                   v_success_count, v_error_count, v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '并发查询压力测试',
            '压力测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 并发更新测试
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..v_concurrent_users LOOP
            BEGIN
                UPDATE review_system.reviews_partitioned
                SET rating = (random() * 5)::numeric(3,2),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = i
                AND created_at >= CURRENT_DATE - interval '30 days';
                
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '并发更新压力测试',
            '压力测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('成功更新: %s, 失败: %s, 总耗时: %s', 
                   v_success_count, v_error_count, v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '并发更新压力测试',
            '压力测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 