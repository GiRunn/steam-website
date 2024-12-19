-- 基础数据插入测试
DO $$
BEGIN
    -- 测试评论插入
    PERFORM review_system.run_test(
        '评论插入测试',
        '基础数据测试',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES (
            1001, 1, 4.5, '这是一个测试评论', 10, 
            'PC', 'zh-CN', true
        ) RETURNING review_id;
        $$
    );

    -- 测试评论回复插入
    PERFORM review_system.run_test(
        '评论回复插入测试',
        '基础数据测试',
        $$
        INSERT INTO review_system.review_replies_partitioned (
            review_id, user_id, content, language
        ) VALUES (
            1, 2, '这是一个测试回复', 'zh-CN'
        ) RETURNING reply_id;
        $$
    );

    -- 测试数据完整性约束
    PERFORM review_system.run_test(
        '评分范围约束测试',
        '基础数据测试',
        $$
        BEGIN
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (
                1001, 1, 5.5, '这个评分应该失败'
            );
            RAISE EXCEPTION '约束测试失败：允许了超出范围的评分';
        EXCEPTION WHEN check_violation THEN
            -- 预期的异常，测试通过
            RETURN;
        END;
        $$
    );

    -- 测试必填字段
    PERFORM review_system.run_test(
        '必填字段测试',
        '基础数据测试',
        $$
        BEGIN
            INSERT INTO review_system.reviews_partitioned (
                game_id, rating, content
            ) VALUES (
                1001, 4.5, '缺少user_id的评论'
            );
            RAISE EXCEPTION '约束测试失败：允许了缺少必填字段的数据';
        EXCEPTION WHEN not_null_violation THEN
            -- 预期的异常，测试通过
            RETURN;
        END;
        $$
    );
END;
$$; 