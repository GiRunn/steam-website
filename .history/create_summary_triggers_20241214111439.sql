-- 创建汇总数据更新函数
CREATE OR REPLACE FUNCTION review_system.update_review_summary()
RETURNS trigger AS $$
BEGIN
    -- 更新或插入汇总数据
    INSERT INTO review_system.review_summary (
        game_id,
        total_reviews,
        average_rating,
        total_playtime_hours,
        total_likes,
        total_replies,
        replies_likes,
        pc_count,
        ps5_count,
        xbox_count,
        en_us_count,
        en_gb_count,
        zh_cn_count,
        es_es_count,
        ja_jp_count,
        recommended_count,
        last_updated
    )
    SELECT 
        NEW.game_id,
        COALESCE(COUNT(*), 0),
        COALESCE(AVG(rating), 0),
        COALESCE(SUM(playtime_hours), 0),
        COALESCE(SUM(likes_count), 0),
        COALESCE((SELECT COUNT(*) FROM review_system.review_replies_partitioned 
                  WHERE review_id IN (SELECT review_id FROM review_system.reviews_partitioned 
                                    WHERE game_id = NEW.game_id)), 0),
        COALESCE((SELECT SUM(likes_count) FROM review_system.review_replies_partitioned 
                  WHERE review_id IN (SELECT review_id FROM review_system.reviews_partitioned 
                                    WHERE game_id = NEW.game_id)), 0),
        COUNT(*) FILTER (WHERE platform = 'PC'),
        COUNT(*) FILTER (WHERE platform = 'PS5'),
        COUNT(*) FILTER (WHERE platform = 'XBOX'),
        COUNT(*) FILTER (WHERE language = 'en-US'),
        COUNT(*) FILTER (WHERE language = 'en-GB'),
        COUNT(*) FILTER (WHERE language = 'zh-CN'),
        COUNT(*) FILTER (WHERE language = 'es-ES'),
        COUNT(*) FILTER (WHERE language = 'ja-JP'),
        COUNT(*) FILTER (WHERE is_recommended = true),
        CURRENT_TIMESTAMP
    FROM review_system.reviews_partitioned
    WHERE game_id = NEW.game_id
    AND review_status = 'active'
    AND deleted_at IS NULL
    GROUP BY game_id
    ON CONFLICT (game_id) 
    DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        total_playtime_hours = EXCLUDED.total_playtime_hours,
        total_likes = EXCLUDED.total_likes,
        total_replies = EXCLUDED.total_replies,
        replies_likes = EXCLUDED.replies_likes,
        pc_count = EXCLUDED.pc_count,
        ps5_count = EXCLUDED.ps5_count,
        xbox_count = EXCLUDED.xbox_count,
        en_us_count = EXCLUDED.en_us_count,
        en_gb_count = EXCLUDED.en_gb_count,
        zh_cn_count = EXCLUDED.zh_cn_count,
        es_es_count = EXCLUDED.es_es_count,
        ja_jp_count = EXCLUDED.ja_jp_count,
        recommended_count = EXCLUDED.recommended_count,
        last_updated = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建分区管理触发器
CREATE TRIGGER trg_create_reviews_partition
BEFORE INSERT ON review_system.reviews_partitioned
FOR EACH ROW EXECUTE FUNCTION review_system.create_partition_if_not_exists();

CREATE TRIGGER trg_create_replies_partition
BEFORE INSERT ON review_system.review_replies_partitioned
FOR EACH ROW EXECUTE FUNCTION review_system.create_partition_if_not_exists();

-- 创建汇总更新触发器
CREATE TRIGGER trg_update_review_summary
AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
FOR EACH ROW EXECUTE FUNCTION review_system.update_review_summary(); 