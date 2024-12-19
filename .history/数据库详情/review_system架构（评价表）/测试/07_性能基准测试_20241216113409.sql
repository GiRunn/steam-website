-- 性能基准测试函数
CREATE OR REPLACE FUNCTION review_system.run_benchmark_tests(
    p_iterations INTEGER DEFAULT 10
) RETURNS TABLE (
    operation_name TEXT,
    avg_duration INTERVAL,
    min_duration INTERVAL,
    max_duration INTERVAL,
    p95_duration INTERVAL
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_durations INTERVAL[];
BEGIN
    -- 1. 插入性能测试
    FOR i IN 1..p_iterations LOOP
        v_start_time := clock_timestamp();
        
        -- 批量插入测试
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        )
        SELECT 
            (random() * 1000000)::INTEGER,
            (random() * 1000000)::INTEGER,
            (random() * 5)::NUMERIC(3,2),
            'Benchmark test review ' || generate_series
        FROM generate_series(1, 10000);
        
        v_end_time := clock_timestamp();
        v_durations := array_append(v_durations, v_end_time - v_start_time);
    END LOOP;

    RETURN QUERY
    SELECT 
        '批量插入 (10000条)'::TEXT,
        avg(duration)::INTERVAL,
        min(duration)::INTERVAL,
        max(duration)::INTERVAL,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY duration)::INTERVAL
    FROM unnest(v_durations) as duration;

    -- 2. 复杂查询性能测试
    v_durations := ARRAY[]::INTERVAL[];
    FOR i IN 1..p_iterations LOOP
        v_start_time := clock_timestamp();
        
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
                WHERE created_at >= CURRENT_DATE - interval '90 days'
                GROUP BY game_id, platform
            )
            SELECT 
                rs.*,
                ps.platform,
                ps.platform_count,
                ps.platform_rating
            FROM ReviewStats rs
            LEFT JOIN PlatformStats ps ON rs.game_id = ps.game_id
            WHERE rs.review_count >= 100
            ORDER BY rs.avg_rating DESC, rs.review_count DESC
        ) complex_query;
        
        v_end_time := clock_timestamp();
        v_durations := array_append(v_durations, v_end_time - v_start_time);
    END LOOP;

    RETURN QUERY
    SELECT 
        '复杂统计查询'::TEXT,
        avg(duration)::INTERVAL,
        min(duration)::INTERVAL,
        max(duration)::INTERVAL,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY duration)::INTERVAL
    FROM unnest(v_durations) as duration;

    -- 3. 分区查询性能测试
    v_durations := ARRAY[]::INTERVAL[];
    FOR i IN 1..p_iterations LOOP
        v_start_time := clock_timestamp();
        
        PERFORM * FROM (
            SELECT 
                DATE_TRUNC('day', created_at) as review_date,
                COUNT(*) as daily_reviews,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT user_id) as unique_users
            FROM review_system.reviews_partitioned
            WHERE created_at BETWEEN CURRENT_DATE - interval '365 days' AND CURRENT_DATE
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY review_date DESC
        ) partition_query;
        
        v_end_time := clock_timestamp();
        v_durations := array_append(v_durations, v_end_time - v_start_time);
    END LOOP;

    RETURN QUERY
    SELECT 
        '分区范围查询'::TEXT,
        avg(duration)::INTERVAL,
        min(duration)::INTERVAL,
        max(duration)::INTERVAL,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY duration)::INTERVAL
    FROM unnest(v_durations) as duration;
END;
$$ LANGUAGE plpgsql; 