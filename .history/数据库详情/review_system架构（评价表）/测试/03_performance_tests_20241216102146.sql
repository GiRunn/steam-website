-- 性能测试
DO $$ 
BEGIN
    -- 批量插入性能测试
    PERFORM test_framework.run_test(
        '大批量数据插入性能测试',
        '性能测试',
        $$
        WITH test_data AS (
            SELECT 
                generate_series(1, 10000) as n,
                (1001 + floor(random() * 10))::bigint as game_id,
                floor(random() * 1000 + 1)::bigint as user_id,
                (1 + random() * 4)::numeric(3,2) as rating,
                CASE floor(random() * 3)::int
                    WHEN 0 THEN 'PC'
                    WHEN 1 THEN 'PS5'
                    ELSE 'XBOX'
                END as platform,
                CASE floor(random() * 3)::int
                    WHEN 0 THEN 'zh-CN'
                    WHEN 1 THEN 'en-US'
                    ELSE 'ja-JP'
                END as language,
                '性能测试评论 #' || n as content,
                CURRENT_TIMESTAMP + (n || ' seconds')::interval as created_at
        )
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, platform, language, content, created_at
        )
        SELECT 
            game_id, user_id, rating, platform, language, content, created_at
        FROM test_data;
        $$
    );

    -- 查询性能测试 - 游戏评分统计
    PERFORM test_framework.run_test(
        '游戏评分统计查询性能测试',
        '性能测试',
        $$
        EXPLAIN ANALYZE
        SELECT 
            r.game_id,
            COUNT(*) as review_count,
            ROUND(AVG(rating)::numeric, 2) as avg_rating,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(*) FILTER (WHERE rating >= 4) as high_ratings,
            COUNT(*) FILTER (WHERE rating < 3) as low_ratings
        FROM review_system.reviews_partitioned r
        WHERE r.created_at >= CURRENT_DATE - interval '1 month'
        GROUP BY r.game_id
        HAVING COUNT(*) >= 10
        ORDER BY avg_rating DESC;
        $$
    );

    -- 查询性能测试 - 用户评论历史
    PERFORM test_framework.run_test(
        '用户评论历史查询性能测试',
        '性能测试',
        $$
        EXPLAIN ANALYZE
        SELECT 
            u.user_id,
            COUNT(*) as total_reviews,
            COUNT(DISTINCT r.game_id) as reviewed_games,
            ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
            COUNT(*) FILTER (WHERE r.rating >= 4) as positive_reviews,
            COUNT(*) FILTER (WHERE r.rating < 3) as negative_reviews,
            MAX(r.created_at) as last_review_date
        FROM review_system.reviews_partitioned r
        JOIN (
            SELECT DISTINCT user_id 
            FROM review_system.reviews_partitioned 
            LIMIT 100
        ) u ON r.user_id = u.user_id
        GROUP BY u.user_id
        ORDER BY total_reviews DESC;
        $$
    );

    -- 并发插入性能测试
    PERFORM test_framework.run_test(
        '并发插入性能测试',
        '性能测试',
        $$
        SELECT * FROM pg_stat_activity 
        WHERE query LIKE '%INSERT%' 
        AND state = 'active';
        $$
    );
END $$; 