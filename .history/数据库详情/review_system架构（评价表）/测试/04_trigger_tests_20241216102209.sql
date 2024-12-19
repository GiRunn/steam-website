-- 触发器测试
DO $$ 
BEGIN
    -- 测试评论汇总更新触发器
    PERFORM test_framework.run_test(
        '评论汇总数据更新触发器测试',
        '触发器测试',
        $$
        -- 插入测试数据
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, platform, language, is_recommended
        ) VALUES 
        (2001, 1, 5.0, '触发器测试评论1', 'PC', 'zh-CN', true),
        (2001, 2, 4.0, '触发器测试评论2', 'PS5', 'zh-CN', true),
        (2001, 3, 3.0, '触发器测试评论3', 'XBOX', 'zh-CN', false);
        
        -- 验证汇总数据
        SELECT test_framework.assert_equals(
            3::bigint,
            (SELECT total_reviews 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 2001
             ORDER BY last_updated DESC 
             LIMIT 1),
            '游戏2001的总评论数应该为3'
        );
        
        -- 验证平均评分
        SELECT test_framework.assert_equals(
            4.0::numeric,
            (SELECT average_rating 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 2001
             ORDER BY last_updated DESC 
             LIMIT 1),
            '游戏2001的平均评分应该为4.0'
        );
        $$
    );

    -- 测试平台统计更新触发器
    PERFORM test_framework.run_test(
        '平台统计更新触发器测试',
        '触发器测试',
        $$
        SELECT test_framework.assert_equals(
            1::bigint,
            (SELECT pc_count 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 2001
             ORDER BY last_updated DESC 
             LIMIT 1),
            'PC平台评论数应该为1'
        );
        $$
    );

    -- 测试语言统计更新触发器
    PERFORM test_framework.run_test(
        '语言统计更新触发器测试',
        '触发器测试',
        $$
        SELECT test_framework.assert_equals(
            3::bigint,
            (SELECT zh_cn_count 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 2001
             ORDER BY last_updated DESC 
             LIMIT 1),
            '中文评论数应该为3'
        );
        $$
    );

    -- 测试评论删除触发器
    PERFORM test_framework.run_test(
        '评论删除触发器测试',
        '触发器测试',
        $$
        -- 软删除一条评论
        UPDATE review_system.reviews_partitioned 
        SET deleted_at = CURRENT_TIMESTAMP,
            review_status = 'deleted'
        WHERE game_id = 2001 AND user_id = 3;
        
        -- 验证汇总数据更新
        SELECT test_framework.assert_equals(
            2::bigint,
            (SELECT total_reviews 
             FROM review_system.review_summary_partitioned 
             WHERE game_id = 2001
             ORDER BY last_updated DESC 
             LIMIT 1),
            '删除后总评论数应该为2'
        );
        $$
    );
END $$; 