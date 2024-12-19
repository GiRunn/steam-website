-- 性能测试
DO $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    execution_time interval;
BEGIN
    -- 测试大量数据插入性能
    PERFORM review_system.run_test(
        '批量数据插入性能测试',
        '性能测试',
        $$
        WITH RECURSIVE generate_reviews AS (
            SELECT 
                generate_series(1, 10000) as id,
                (random() * 1000 + 1)::bigint as game_id,
                (random() * 1000 + 1)::bigint as user_id,
                (random() * 5)::numeric(3,2) as rating,
                'Performance test review ' || generate_series as content,
                (random() * 100)::integer as playtime_hours,
                CASE (random() * 2)::integer 
                    WHEN 0 THEN 'PC'
                    WHEN 1 THEN 'PS5'
                    ELSE 'XBOX'
                END as platform,
                CASE (random() * 4)::integer
                    WHEN 0 THEN 'zh-CN'
                    WHEN 1 THEN 'en-US'
                    WHEN 2 THEN 'ja-JP'
                    ELSE 'es-ES'
                END as language,
                random() > 0.5 as is_recommended
        )
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        )
        SELECT 
            game_id, user_id, rating, content, playtime_hours,
            platform, language, is_recommended
        FROM generate_reviews;
        $$
    );

    -- 测试复杂查询性能
    PERFORM review_system.run_test(
        '复杂查询性能测试',
        '性能测试',
        $$
        EXPLAIN ANALYZE
        WITH game_stats AS (
            SELECT 
                game_id,
                COUNT(*) as review_count,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN is_recommended THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as recommend_rate,
                COUNT(DISTINCT user_id) as unique_reviewers,
                SUM(playtime_hours) as total_playtime
            FROM review_system.reviews_partitioned
            WHERE created_at >= CURRENT_DATE - interval '30 days'
            GROUP BY game_id
        ),
        platform_stats AS (
            SELECT 
                game_id,
                platform,
                COUNT(*) as platform_reviews,
                AVG(rating) as platform_rating
            FROM review_system.reviews_partitioned
            WHERE created_at >= CURRENT_DATE - interval '30 days'
            GROUP BY game_id, platform
        )
        SELECT 
            gs.*,
            ps.platform,
            ps.platform_reviews,
            ps.platform_rating
        FROM game_stats gs
        LEFT JOIN platform_stats ps ON gs.game_id = ps.game_id
        WHERE gs.review_count >= 10
        ORDER BY gs.avg_rating DESC, gs.review_count DESC
        LIMIT 100;
        $$
    );

    -- 测试分区查询性能
    PERFORM review_system.run_test(
        '分区查询性能测试',
        '性能测试',
        $$
        EXPLAIN ANALYZE
        SELECT 
            DATE_TRUNC('day', created_at) as review_date,
            COUNT(*) as daily_reviews,
            AVG(rating) as avg_daily_rating,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT game_id) as unique_games
        FROM review_system.reviews_partitioned
        WHERE created_at >= CURRENT_DATE - interval '90 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY review_date DESC;
        $$
    );
END;
$$; 