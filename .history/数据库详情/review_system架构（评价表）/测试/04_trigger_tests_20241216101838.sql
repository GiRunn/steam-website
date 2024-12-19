-- 触发器测试
DO $$ 
BEGIN
    -- 测试汇总数据更新触发器
    PERFORM test_framework.run_test(
        'Summary Update Trigger Test',
        'Triggers',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES (
            1002, 1, 4.5, 'Trigger test review'
        );
        
        SELECT test_framework.assert_equals(
            1::bigint,
            (SELECT total_reviews 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 1002
             ORDER BY last_updated DESC 
             LIMIT 1),
            'Summary total_reviews should be 1'
        );
        $$
    );

    -- 测试统计数据更新触发器
    PERFORM test_framework.run_test(
        'Stats Update Trigger Test',
        'Triggers',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, is_recommended
        ) VALUES (
            1003, 1, 5.0, 'Stats test review', true
        );
        
        SELECT test_framework.assert_equals(
            100::numeric,
            (SELECT positive_rate 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 1003
             ORDER BY last_updated DESC 
             LIMIT 1),
            'Positive rate should be 100 for 5.0 rating'
        );
        $$
    );
END $$; 