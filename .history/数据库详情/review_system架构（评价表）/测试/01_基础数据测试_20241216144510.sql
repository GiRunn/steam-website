-- 基础数据插入测试
DO $$
DECLARE
    v_review_id BIGINT;
    v_reply_id BIGINT;
    v_start_time TIMESTAMP;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 测试评论插入
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, platform, language, is_recommended
        ) VALUES (
            1001, 1, 4.5, '这是一个测试评论', 10, 'PC', 'zh-CN', true
        ) RETURNING review_id INTO v_review_id;

        PERFORM review_system.record_test_result(
            '评论插入测试',
            '基础数据测试',
            '通过',
            NULL,
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '评论插入测试',
            '基础数据测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE NOTICE '评论插入测试失败: %', SQLERRM;
    END;

    -- 测试评论回复插入
    BEGIN
        v_start_time := clock_timestamp();
        
        INSERT INTO review_system.review_replies_partitioned (
            review_id, user_id, content, language
        ) VALUES (
            v_review_id, 2, '这是一个测试回复', 'zh-CN'
        ) RETURNING reply_id INTO v_reply_id;

        PERFORM review_system.record_test_result(
            '回复插入测试',
            '基础数据测试',
            '通过',
            NULL,
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '回复插入测试',
            '基础数据测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE NOTICE '回复插入测试失败: %', SQLERRM;
    END;
END $$; 