-- 创建处理评论插入的触发器函数
CREATE OR REPLACE FUNCTION review_system.handle_review_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. 确保分区存在
    PERFORM review_system.create_partition_if_not_exists(NEW.created_at);
    
    -- 2. 更新汇总数据
    INSERT INTO review_system.review_summary (
        game_id,
        total_reviews,
        average_rating,
        total_playtime_hours,
        platform_stats,
        language_stats,
        recommendation_rate
    )
    VALUES (
        NEW.game_id,
        1,
        NEW.rating,
        COALESCE(NEW.playtime_hours, 0),
        jsonb_build_object(NEW.platform, 1),
        jsonb_build_object(NEW.language, 1),
        CASE WHEN NEW.is_recommended THEN 100.0 ELSE 0.0 END
    )
    ON CONFLICT (game_id) DO UPDATE SET
        total_reviews = review_summary.total_reviews + 1,
        average_rating = (review_summary.average_rating * review_summary.total_reviews + NEW.rating) / (review_summary.total_reviews + 1),
        total_playtime_hours = review_summary.total_playtime_hours + COALESCE(NEW.playtime_hours, 0),
        platform_stats = review_summary.platform_stats || 
            jsonb_build_object(
                NEW.platform, 
                COALESCE((review_summary.platform_stats->>NEW.platform)::integer, 0) + 1
            ),
        language_stats = review_summary.language_stats || 
            jsonb_build_object(
                NEW.language, 
                COALESCE((review_summary.language_stats->>NEW.language)::integer, 0) + 1
            ),
        recommendation_rate = (
            review_summary.recommendation_rate * review_summary.total_reviews + 
            CASE WHEN NEW.is_recommended THEN 100.0 ELSE 0.0 END
        ) / (review_summary.total_reviews + 1),
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建处理回复插入的触发器函数
CREATE OR REPLACE FUNCTION review_system.handle_reply_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_game_id BIGINT;
BEGIN
    -- 1. 确保分区存在
    PERFORM review_system.create_partition_if_not_exists(NEW.created_at);
    
    -- 2. 获取对应的game_id
    SELECT game_id INTO v_game_id
    FROM review_system.reviews_partitioned
    WHERE review_id = NEW.review_id;
    
    -- 3. 更新汇总数据
    UPDATE review_system.review_summary
    SET total_replies = total_replies + 1,
        last_updated = CURRENT_TIMESTAMP
    WHERE game_id = v_game_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trg_review_insert
    BEFORE INSERT ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.handle_review_insert();

CREATE TRIGGER trg_reply_insert
    BEFORE INSERT ON review_system.review_replies_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.handle_reply_insert(); 