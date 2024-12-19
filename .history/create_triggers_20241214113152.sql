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
    GROUP BY game_id;

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

CREATE TRIGGER trg_create_summary_partition
BEFORE INSERT ON review_system.review_summary_partitioned
FOR EACH ROW EXECUTE FUNCTION review_system.create_partition_if_not_exists();

-- 创建汇总更新触发器
CREATE TRIGGER trg_update_review_summary
AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
FOR EACH ROW EXECUTE FUNCTION review_system.update_review_summary(); 