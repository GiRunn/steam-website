-- 压力测试（增强版）
DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_execution_time interval;
    v_success_count integer := 0;
    v_error_count integer := 0;
    v_concurrent_users integer := 1000;  -- 增加到1000个并发用户
    v_operations_per_user integer := 1000;  -- 每个用户1000次操作
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
                        format('Stress test review from user %s - operation %s with large content %s', 
                               i, j, repeat('test content ', 100))  -- 增加内容大小
                    );
                    v_success_count := v_success_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    v_error_count := v_error_count + 1;
                END;
                
                -- 每100次操作添加一次延迟，模拟真实场景
                IF j % 100 = 0 THEN
                    PERFORM pg_sleep(random() * 0.01);  -- 0-10ms随机延迟
                END IF;
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

    -- 并发查询测试（增加复杂度）
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..v_concurrent_users LOOP
            BEGIN
                -- 执行复杂查询
                WITH ReviewStats AS (
                    SELECT 
                        r.game_id,
                        COUNT(*) as review_count,
                        AVG(rating) as avg_rating,
                        COUNT(DISTINCT user_id) as unique_reviewers,
                        STRING_AGG(DISTINCT platform, ', ') as platforms
                    FROM review_system.reviews_partitioned r
                    WHERE r.created_at >= CURRENT_DATE - interval '90 days'
                    GROUP BY game_id
                ),
                UserStats AS (
                    SELECT 
                        user_id,
                        COUNT(*) as total_reviews,
                        AVG(rating) as avg_rating,
                        MAX(created_at) as last_review
                    FROM review_system.reviews_partitioned
                    GROUP BY user_id
                )
                SELECT *
                FROM ReviewStats rs
                JOIN UserStats us ON true
                WHERE rs.review_count > 10
                ORDER BY rs.avg_rating DESC, rs.review_count DESC
                LIMIT 100;
                
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '并发复杂查询压力测试',
            '压力测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('成功查询: %s, 失败: %s, 总耗时: %s', 
                   v_success_count, v_error_count, v_execution_time),
            v_execution_time
        );
    END;

    -- 并发更新测试（增加更新量）
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        
        FOR i IN 1..v_concurrent_users LOOP
            BEGIN
                -- 执行批量更新
                WITH ToUpdate AS (
                    SELECT review_id 
                    FROM review_system.reviews_partitioned 
                    WHERE user_id = i 
                    AND created_at >= CURRENT_DATE - interval '30 days'
                    FOR UPDATE SKIP LOCKED
                    LIMIT 100
                )
                UPDATE review_system.reviews_partitioned r
                SET 
                    rating = (random() * 5)::numeric(3,2),
                    content = content || ' - Updated at ' || NOW(),
                    updated_at = CURRENT_TIMESTAMP
                FROM ToUpdate t
                WHERE r.review_id = t.review_id;
                
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
    END;
END $$; 