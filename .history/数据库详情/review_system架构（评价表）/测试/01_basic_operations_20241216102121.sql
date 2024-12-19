-- 基础CRUD操作测试
DO $$ 
BEGIN
    -- 测试插入评论
    PERFORM test_framework.run_test(
        '评论插入测试',
        '基础操作',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, platform, language, is_recommended
        ) VALUES 
        (1001, 1, 4.5, '游戏非常好玩，画面精美，剧情丰富！', 'PC', 'zh-CN', true),
        (1001, 2, 3.5, '游戏还不错，但优化还需要改进', 'PS5', 'zh-CN', true),
        (1001, 3, 2.0, '游戏体验一般，有待提升', 'XBOX', 'zh-CN', false)
        RETURNING review_id;
        $$
    );

    -- 测试更新评论
    PERFORM test_framework.run_test(
        '评论更新测试',
        '基础操作',
        $$
        UPDATE review_system.reviews_partitioned 
        SET rating = 5.0, 
            content = '经过更新后，游戏体验更好了！',
            updated_at = CURRENT_TIMESTAMP
        WHERE game_id = 1001 AND user_id = 1
        RETURNING review_id;
        $$
    );

    -- 测试评论软删除
    PERFORM test_framework.run_test(
        '评论软删除测试',
        '基础操作',
        $$
        UPDATE review_system.reviews_partitioned 
        SET deleted_at = CURRENT_TIMESTAMP,
            review_status = 'deleted'
        WHERE game_id = 1001 AND user_id = 3
        RETURNING review_id;
        $$
    );

    -- 测试评论回复功能
    PERFORM test_framework.run_test(
        '评论回复测试',
        '基础操作',
        $$
        WITH inserted_reply AS (
            INSERT INTO review_system.review_replies_partitioned (
                review_id, user_id, content, language
            ) VALUES (
                1, 2, '完全同意你的观点！', 'zh-CN'
            ) RETURNING reply_id
        )
        INSERT INTO review_system.review_replies_partitioned (
            review_id, user_id, parent_id, content, language
        ) 
        SELECT 
            1, 3, reply_id, '感谢分享，很有帮助！', 'zh-CN'
        FROM inserted_reply;
        $$
    );

    -- 测试评论查询功能
    PERFORM test_framework.run_test(
        '评论查询测试',
        '基础操作',
        $$
        SELECT test_framework.assert_equals(
            3::bigint,
            (SELECT COUNT(*) FROM review_system.reviews_partitioned 
             WHERE game_id = 1001),
            '游戏1001应该有3条评论'
        );
        $$
    );
END $$; 