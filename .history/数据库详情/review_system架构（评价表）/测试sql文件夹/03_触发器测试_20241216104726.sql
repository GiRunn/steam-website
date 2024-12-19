-- 测试触发器功能
DO $$
DECLARE
    test_review_id BIGINT;
    initial_likes INTEGER;
    updated_likes INTEGER;
BEGIN
    -- 插入测试评论
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1002, 4.0, '这是触发器测试评论', 5, 'PS5', 'zh-CN', true)
    RETURNING review_id INTO test_review_id;
    
    -- 获取初始点赞数
    SELECT likes_count INTO initial_likes 
    FROM review_system.reviews_partitioned 
    WHERE review_id = test_review_id;
    
    -- 更新点赞数
    UPDATE review_system.reviews_partitioned 
    SET likes_count = likes_count + 1
    WHERE review_id = test_review_id;
    
    -- 获取更新后的点赞数
    SELECT likes_count INTO updated_likes 
    FROM review_system.reviews_partitioned 
    WHERE review_id = test_review_id;
    
    -- 测试点赞数更新
    PERFORM review_system.assert_equals(
        '测试点赞数更新',
        initial_likes + 1,
        updated_likes
    );
    
    -- 测试汇总数据更新触发器
    PERFORM review_system.assert_equals(
        '测试汇总数据更新',
        TRUE,
        EXISTS (
            SELECT 1 
            FROM review_system.review_summary_partitioned 
            WHERE game_id = 99999 
            AND total_likes = (
                SELECT SUM(likes_count) 
                FROM review_system.reviews_partitioned 
                WHERE game_id = 99999
            )
        )
    );
END;
$$; 