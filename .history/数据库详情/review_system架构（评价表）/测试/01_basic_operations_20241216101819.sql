-- 基础CRUD操作测试
DO $$ 
BEGIN
    -- 测试插入评论
    PERFORM test_framework.run_test(
        'Insert Review Test',
        'Basic Operations',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, platform, language
        ) VALUES (
            1001, 1, 4.5, 'Great game!', 'PC', 'en-US'
        ) RETURNING review_id;
        $$
    );

    -- 测试更新评论
    PERFORM test_framework.run_test(
        'Update Review Test',
        'Basic Operations',
        $$
        UPDATE review_system.reviews_partitioned 
        SET rating = 5.0, content = 'Amazing game!'
        WHERE game_id = 1001 AND user_id = 1
        RETURNING review_id;
        $$
    );

    -- 测试删除评论（软删除）
    PERFORM test_framework.run_test(
        'Soft Delete Review Test',
        'Basic Operations',
        $$
        UPDATE review_system.reviews_partitioned 
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE game_id = 1001 AND user_id = 1
        RETURNING review_id;
        $$
    );

    -- 测试评论回复功能
    PERFORM test_framework.run_test(
        'Insert Reply Test',
        'Basic Operations',
        $$
        INSERT INTO review_system.review_replies_partitioned (
            review_id, user_id, content, language
        ) VALUES (
            1, 2, 'I agree!', 'en-US'
        ) RETURNING reply_id;
        $$
    );
END $$; 