-- 创建自动创建分区的函数
CREATE OR REPLACE FUNCTION review_system.create_partition_if_not_exists()
RETURNS TRIGGER AS $$
DECLARE
    partition_date timestamp with time zone;
    partition_name text;
    start_date timestamp with time zone;
    end_date timestamp with time zone;
    table_prefix text;
    parent_table text;
    base_table text;
BEGIN
    -- 获取父表名，并处理分区表名
    parent_table := TG_TABLE_NAME;
    
    -- 如果是分区表名，提取基本表名
    IF parent_table ~ '_y\d{4}m\d{2}$' THEN
        CASE 
            WHEN parent_table ~ '^reviews_' THEN
                base_table := 'reviews_partitioned';
            WHEN parent_table ~ '^replies_' THEN
                base_table := 'review_replies_partitioned';
            WHEN parent_table ~ '^summary_' THEN
                base_table := 'review_summary_partitioned';
            ELSE
                RAISE EXCEPTION 'Invalid partition table name: %', parent_table;
        END CASE;
    ELSE
        base_table := parent_table;
    END IF;
    
    -- 计算分区日期(按月)
    CASE base_table
        WHEN 'reviews_partitioned' THEN
            partition_date := date_trunc('month', NEW.created_at);
            table_prefix := 'reviews';
        WHEN 'review_replies_partitioned' THEN
            partition_date := date_trunc('month', NEW.created_at);
            table_prefix := 'replies';
        WHEN 'review_summary_partitioned' THEN
            partition_date := date_trunc('month', NEW.last_updated);
            table_prefix := 'summary';
        ELSE
            RAISE EXCEPTION 'Unknown parent table: %', base_table;
    END CASE;
    
    -- 生成分区名
    partition_name := table_prefix || '_y' || 
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
            TG_TABLE_SCHEMA, partition_name, TG_TABLE_SCHEMA, base_table,
            start_date, end_date
        );
        
        RAISE NOTICE 'Created new partition: %.% for parent table %', TG_TABLE_SCHEMA, partition_name, base_table;
        
        -- 为新分区创建索引
        IF base_table = 'review_summary_partitioned' THEN
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

-- 创建更新汇总数据的函数
CREATE OR REPLACE FUNCTION review_system.update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 计算好评率
    NEW.positive_rate = (NEW.average_rating / 5) * 100;
    
    -- 计算平均游戏时长
    NEW.avg_playtime_hours = 
        CASE 
            WHEN NEW.total_reviews > 0 THEN NEW.total_playtime_hours::numeric / NEW.total_reviews
            ELSE 0
        END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新评论汇总的函数
CREATE OR REPLACE FUNCTION review_system.update_review_summary()
RETURNS TRIGGER AS $$
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