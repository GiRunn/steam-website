-- 基础数据插入测试
DO $$
DECLARE
    v_review_id BIGINT;
    v_reply_id BIGINT;
BEGIN
    -- 测试评论插入
    INSERT INTO review_system.reviews_partitioned (
        game_id, 
        user_id, 
        rating, 
        content, 
        playtime_hours, 
        platform, 
        language, 
        is_recommended
    ) VALUES (
        1001, 
        1, 
        4.5, 
        '这是一个测试评论', 
        10, 
        'PC', 
        'zh-CN', 
        true
    ) RETURNING review_id INTO v_review_id;

    RAISE NOTICE '评论插入测试成功，review_id: %', v_review_id;

    -- 测试评论回复插入
    INSERT INTO review_system.review_replies_partitioned (
        review_id,
        user_id,
        content,
        language
    ) VALUES (
        v_review_id,
        2,
        '这是一个测试回复',
        'zh-CN'
    ) RETURNING reply_id INTO v_reply_id;

    RAISE NOTICE '回复插入测试成功，reply_id: %', v_reply_id;

    -- 测试数据完整性约束
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id,
            user_id,
            rating,
            content
        ) VALUES (
            1001,
            1,
            5.5,  -- 这个评分超出范围，应该触发约束错误
            '这个评分应该失败'
        );
        
        RAISE EXCEPTION '约束测试失败：允许了超出范围的评分';
    EXCEPTION 
        WHEN check_violation THEN
            RAISE NOTICE '评分范围约束测试通过';
    END;

    -- 测试必填字段
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id,
            rating,
            content
        ) VALUES (
            1001,
            4.5,
            '缺少user_id的评论'
        );
        
        RAISE EXCEPTION '约束测试失败：允许了缺少必填字段的数据';
    EXCEPTION 
        WHEN not_null_violation THEN
            RAISE NOTICE '必填字段约束测试通过';
    END;

    -- 测试成功完成
    RAISE NOTICE '所有基础数据测试通过';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE '测试失败: %', SQLERRM;
        RAISE;
END;
$$; 