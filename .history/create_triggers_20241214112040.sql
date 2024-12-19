-- 创建自动分区管理函数
CREATE OR REPLACE FUNCTION review_system.create_partition_if_not_exists()
RETURNS trigger AS $$
DECLARE
    partition_date timestamp with time zone;
    partition_name text;
    start_date timestamp with time zone;
    end_date timestamp with time zone;
    partition_column text;
BEGIN
    -- 根据表名确定使用哪个分区列
    partition_column := CASE 
        WHEN TG_TABLE_NAME = 'review_summary_partitioned' THEN 'last_updated'
        ELSE 'created_at'
    END;

    -- 计算分区日期(按月)
    partition_date := date_trunc('month', 
        CASE 
            WHEN partition_column = 'last_updated' THEN NEW.last_updated
            ELSE NEW.created_at
        END
    );
    
    -- 生成分区名
    partition_name := TG_TABLE_NAME || '_y' || 
                     to_char(partition_date, 'YYYY') || 
                     'm' || to_char(partition_date, 'MM');
    
    -- 设置分区范围
    start_date := partition_date;
    end_date := partition_date + interval '1 month';
    
    -- 检查分区是否存在
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
        AND n.nspname = TG_TABLE_SCHEMA
    ) THEN
        -- 创建新分区
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I.%I PARTITION OF %I.%I 
            FOR VALUES FROM (%L) TO (%L)',
            TG_TABLE_SCHEMA, partition_name, TG_TABLE_SCHEMA, TG_TABLE_NAME,
            start_date, end_date
        );
        
        -- 为新分区创建索引
        IF partition_column = 'last_updated' THEN
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS %I ON %I.%I (game_id, last_updated)',
                'idx_' || partition_name || '_game_updated',
                TG_TABLE_SCHEMA, partition_name
            );
        ELSE
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS %I ON %I.%I (created_at)',
                'idx_' || partition_name || '_created_at',
                TG_TABLE_SCHEMA, partition_name
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建汇总数据更新函数
CREATE OR REPLACE FUNCTION review_system.update_review_summary()
RETURNS trigger AS $$
BEGIN
    -- 更新或插入汇总数据
    INSERT INTO review_system.review_summary_partitioned (
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