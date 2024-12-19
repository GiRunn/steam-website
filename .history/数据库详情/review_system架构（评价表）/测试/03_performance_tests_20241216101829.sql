-- 性能测试
DO $$ 
BEGIN
    -- 批量插入测试
    PERFORM test_framework.run_test(
        'Bulk Insert Performance Test',
        'Performance',
        $$
        WITH test_data AS (
            SELECT 
                generate_series(1, 10000) as n,
                1001 as game_id,
                floor(random() * 1000 + 1)::bigint as user_id,
                random() * 5 as rating,
                'Performance test review ' || n as content,
                CURRENT_TIMESTAMP + (n || ' seconds')::interval as created_at
        )
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        )
        SELECT 
            game_id, user_id, rating, content, created_at
        FROM test_data;
        $$
    );

    -- 查询性能测试
    PERFORM test_framework.run_test(
        'Query Performance Test',
        'Performance',
        $$
        EXPLAIN ANALYZE
        SELECT 
            r.game_id,
            COUNT(*) as review_count,
            AVG(rating) as avg_rating,
            COUNT(DISTINCT user_id) as unique_users
        FROM review_system.reviews_partitioned r
        WHERE r.created_at >= CURRENT_DATE - interval '1 month'
        GROUP BY r.game_id;
        $$
    );
END $$; 