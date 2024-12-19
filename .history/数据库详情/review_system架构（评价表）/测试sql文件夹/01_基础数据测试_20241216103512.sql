-- 连接数据库
\c games

-- 设置测试数据
DO $$
BEGIN
    -- 清理测试数据
    DELETE FROM review_system.reviews_partitioned WHERE game_id = 99999;
    DELETE FROM review_system.review_replies_partitioned WHERE review_id IN 
        (SELECT review_id FROM review_system.reviews_partitioned WHERE game_id = 99999);
    
    -- 插入测试评论
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1001, 4.5, '这是一个测试评论', 10, 'PC', 'zh-CN', true);
    
    -- 测试评论插入
    PERFORM review_system.assert_equals(
        '测试评论插入',
        1,
        (SELECT COUNT(*) FROM review_system.reviews_partitioned WHERE game_id = 99999)
    );
    
    -- 测试汇总数据更新
    PERFORM review_system.assert_equals(
        '测试汇总数据生成',
        1,
        (SELECT COUNT(*) FROM review_system.review_summary_partitioned WHERE game_id = 99999)
    );
    
    -- 测试评分计算
    PERFORM review_system.assert_equals(
        '测试平均评分计算',
        4.5::DECIMAL(3,2),
        (SELECT average_rating FROM review_system.review_summary_partitioned 
         WHERE game_id = 99999 ORDER BY last_updated DESC LIMIT 1)
    );
END;
$$; 