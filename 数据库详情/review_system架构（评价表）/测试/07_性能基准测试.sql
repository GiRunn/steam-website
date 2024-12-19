-- 性能基准测试
DO $$
DECLARE
    v_start_time timestamp;
    v_execution_time interval;
    v_iterations integer := 10;
    v_batch_size integer := 1000;
    v_success_count integer := 0;
    v_error_count integer := 0;
    v_durations interval[];
BEGIN
    -- 1. 批量插入性能基准测试
    BEGIN
        v_start_time := clock_timestamp();
        v_durations := ARRAY[]::interval[];
        
        FOR i IN 1..v_iterations LOOP
            DECLARE
                v_iteration_start timestamp;
                v_iteration_end timestamp;
            BEGIN
                v_iteration_start := clock_timestamp();
                
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content, playtime_hours,
                    platform, language, is_recommended
                )
                SELECT 
                    (random() * 1000 + 1)::bigint,
                    (random() * 1000 + 1)::bigint,
                    (random() * 5)::numeric(3,2),
                    'Benchmark test review ' || generate_series,
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
                FROM generate_series(1, v_batch_size);
                
                v_iteration_end := clock_timestamp();
                v_durations := array_append(v_durations, v_iteration_end - v_iteration_start);
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '批量插入性能基准测试',
            '性能基准测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format(
                '成功: %s, 失败: %s, 平均耗时: %s, 最小: %s, 最大: %s', 
                v_success_count, 
                v_error_count, 
                (SELECT avg(duration) FROM unnest(v_durations) AS duration),
                (SELECT min(duration) FROM unnest(v_durations) AS duration),
                (SELECT max(duration) FROM unnest(v_durations) AS duration)
            ),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '批量插入性能基准测试',
            '性能基准测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 2. 复杂查询性能基准测试
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        v_durations := ARRAY[]::interval[];
        
        FOR i IN 1..v_iterations LOOP
            DECLARE
                v_iteration_start timestamp;
                v_iteration_end timestamp;
            BEGIN
                v_iteration_start := clock_timestamp();
                
                PERFORM * FROM (
                    WITH ReviewStats AS (
                        SELECT 
                            r.game_id,
                            COUNT(*) as review_count,
                            AVG(rating) as avg_rating,
                            COUNT(DISTINCT user_id) as unique_reviewers,
                            SUM(CASE WHEN is_recommended THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as recommend_rate
                        FROM review_system.reviews_partitioned r
                        WHERE created_at >= CURRENT_DATE - interval '90 days'
                        GROUP BY game_id
                    ),
                    PlatformStats AS (
                        SELECT 
                            game_id,
                            platform,
                            COUNT(*) as platform_count,
                            AVG(rating) as platform_rating
                        FROM review_system.reviews_partitioned
                        GROUP BY game_id, platform
                    )
                    SELECT 
                        rs.*,
                        ps.platform,
                        ps.platform_count,
                        ps.platform_rating
                    FROM ReviewStats rs
                    LEFT JOIN PlatformStats ps ON rs.game_id = ps.game_id
                    WHERE rs.review_count >= 10
                    ORDER BY rs.avg_rating DESC, rs.review_count DESC
                ) complex_query;
                
                v_iteration_end := clock_timestamp();
                v_durations := array_append(v_durations, v_iteration_end - v_iteration_start);
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '复杂查询性能基准测试',
            '性能基准测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format(
                '成功: %s, 失败: %s, 平均耗时: %s, 最小: %s, 最大: %s', 
                v_success_count, 
                v_error_count,
                (SELECT avg(duration) FROM unnest(v_durations) AS duration),
                (SELECT min(duration) FROM unnest(v_durations) AS duration),
                (SELECT max(duration) FROM unnest(v_durations) AS duration)
            ),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '复杂查询性能基准测试',
            '性能基准测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 3. 分区查询性能基准测试
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        v_durations := ARRAY[]::interval[];
        
        FOR i IN 1..v_iterations LOOP
            DECLARE
                v_iteration_start timestamp;
                v_iteration_end timestamp;
            BEGIN
                v_iteration_start := clock_timestamp();
                
                PERFORM * FROM (
                    SELECT 
                        DATE_TRUNC('day', created_at) as review_date,
                        COUNT(*) as daily_reviews,
                        AVG(rating) as avg_rating,
                        COUNT(DISTINCT user_id) as unique_users,
                        SUM(playtime_hours) as total_playtime
                    FROM review_system.reviews_partitioned
                    WHERE created_at >= CURRENT_DATE - interval '90 days'
                    GROUP BY DATE_TRUNC('day', created_at)
                    ORDER BY review_date DESC
                ) daily_stats;
                
                v_iteration_end := clock_timestamp();
                v_durations := array_append(v_durations, v_iteration_end - v_iteration_start);
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '分区查询性能基准测试',
            '性能基准测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format(
                '成功: %s, 失败: %s, 平均耗时: %s, 最小: %s, 最大: %s', 
                v_success_count, 
                v_error_count,
                (SELECT avg(duration) FROM unnest(v_durations) AS duration),
                (SELECT min(duration) FROM unnest(v_durations) AS duration),
                (SELECT max(duration) FROM unnest(v_durations) AS duration)
            ),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '分区查询性能基准测试',
            '性能基准测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 