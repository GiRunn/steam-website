-- 触发器功能测试
DO $$
DECLARE
    v_review_id bigint;
    v_summary_record record;
    v_start_time timestamp;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 测试评论统计触发器
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, platform, language, is_recommended
        ) VALUES (
            1001, 1, 4.5, '触发器测试评论', 'PC', 'zh-CN', true
        ) RETURNING review_id INTO v_review_id;

        -- 验证汇总数据更新
        SELECT * FROM review_system.review_summary_partitioned 
        WHERE game_id = 1001 
        ORDER BY last_updated DESC 
        LIMIT 1 
        INTO v_summary_record;

        IF v_summary_record IS NULL THEN
            PERFORM review_system.record_test_result(
                '评论统计触发器测试',
                '触发器测试',
                '失败',
                '未找到汇总数据',
                clock_timestamp() - v_start_time
            );
            RAISE EXCEPTION '触发器测试失败：未找到汇总数据';
        END IF;

        IF v_summary_record.total_reviews < 1 THEN
            PERFORM review_system.record_test_result(
                '评论统计触发器测试',
                '触发器测试',
                '失败',
                '评论总数未更新',
                clock_timestamp() - v_start_time
            );
            RAISE EXCEPTION '触发器测试失败：评论总数未更新';
        END IF;

        PERFORM review_system.record_test_result(
            '评论统计触发器测试',
            '触发器测试',
            '通过',
            NULL,
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '评论统计触发器测试',
            '触发器测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 