-- 触发器功能测试
DO $$
DECLARE
    review_id bigint;
    summary_record record;
BEGIN
    -- 测试评论统计触发器
    PERFORM review_system.run_test(
        '评论统计触发器测试',
        '触发器测试',
        $$
        WITH inserted_review AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, platform, language, is_recommended
            ) VALUES (
                1001, 1, 4.5, '触发器测试评论', 'PC', 'zh-CN', true
            ) RETURNING review_id, game_id
        )
        SELECT EXISTS (
            SELECT 1
            FROM review_system.review_summary_partitioned s
            JOIN inserted_review r ON s.game_id = r.game_id
            WHERE s.total_reviews > 0
        );
        $$
    );

    -- 测试评分统计更新
    PERFORM review_system.run_test(
        '评分统计更新测试',
        '触发器测试',
        $$
        WITH test_data AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES 
                (1002, 1, 5.0, '测试评论1'),
                (1002, 2, 4.0, '测试评论2')
            RETURNING game_id
        )
        SELECT 
            CASE 
                WHEN s.average_rating = 4.5 THEN true 
                ELSE false 
            END
        FROM review_system.review_summary_partitioned s
        JOIN test_data t ON s.game_id = t.game_id
        LIMIT 1;
        $$
    );

    -- 测试平台统计更新
    PERFORM review_system.run_test(
        '平台统计更新测试',
        '触发器测试',
        $$
        WITH test_data AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, platform
            ) VALUES 
                (1003, 1, 4.0, '平台测试1', 'PC'),
                (1003, 2, 4.0, '平台测试2', 'PS5')
            RETURNING game_id
        )
        SELECT 
            CASE 
                WHEN s.pc_count = 1 AND s.ps5_count = 1 THEN true 
                ELSE false 
            END
        FROM review_system.review_summary_partitioned s
        JOIN test_data t ON s.game_id = t.game_id
        LIMIT 1;
        $$
    );
END;
$$; 