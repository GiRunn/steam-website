-- 触发器功能测试
DO $$
DECLARE
    v_review_id bigint;
    v_summary_record record;
BEGIN
    -- 测试评论统计触发器
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
        RAISE EXCEPTION '触发器测试失败：未找到汇总数据';
    END IF;

    IF v_summary_record.total_reviews < 1 THEN
        RAISE EXCEPTION '触发器测试失败：评论总数未更新';
    END IF;

    RAISE NOTICE '触发器测试通过：评论ID = %, 总评论数 = %', 
                 v_review_id, v_summary_record.total_reviews;
END $$; 