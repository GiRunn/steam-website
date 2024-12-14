-- 1. 创建自动分区函数
CREATE OR REPLACE FUNCTION review_system.auto_create_partition()
RETURNS TRIGGER AS $$
DECLARE
    partition_date TIMESTAMP WITH TIME ZONE;
    partition_name TEXT;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 获取需要插入数据的月份
    IF TG_TABLE_NAME = 'review_summary_partitioned' THEN
        partition_date := date_trunc('month', NEW.last_updated);
    ELSE
        partition_date := date_trunc('month', NEW.created_at);
    END IF;
    
    start_date := partition_date;
    end_date := start_date + interval '1 month';
    partition_name := TG_TABLE_NAME || '_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
    
    -- 检查分区是否存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'review_system' 
        AND c.relname = partition_name
    ) THEN
        -- 创建分区
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.%I
             FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            TG_TABLE_NAME,
            start_date,
            end_date
        );
        
        RAISE NOTICE '已自动创建分区: %', partition_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建汇总数据更新函数
CREATE OR REPLACE FUNCTION review_system.update_review_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- 插入或更新汇总数据
    INSERT INTO review_system.review_summary_partitioned (
        game_id,
        total_reviews,
        average_rating,
        total_playtime_hours,
        pc_count,
        ps5_count,
        xbox_count,
        zh_cn_count,
        en_us_count,
        ja_jp_count,
        recommended_count,
        last_updated
    )
    SELECT 
        game_id,
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(playtime_hours) as total_playtime_hours,
        COUNT(*) FILTER (WHERE platform = 'PC') as pc_count,
        COUNT(*) FILTER (WHERE platform = 'PS5') as ps5_count,
        COUNT(*) FILTER (WHERE platform = 'XBOX') as xbox_count,
        COUNT(*) FILTER (WHERE language = 'zh_CN') as zh_cn_count,
        COUNT(*) FILTER (WHERE language = 'en_US') as en_us_count,
        COUNT(*) FILTER (WHERE language = 'ja_JP') as ja_jp_count,
        COUNT(*) FILTER (WHERE is_recommended = true) as recommended_count,
        CURRENT_TIMESTAMP
    FROM review_system.reviews_partitioned
    WHERE game_id = NEW.game_id
    GROUP BY game_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建审计日志函数
CREATE OR REPLACE FUNCTION review_system.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO review_system.review_audit_log (
            operation, 
            table_name,
            record_id,
            new_data,
            changed_by
        )
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            NEW.review_id,
            row_to_json(NEW),
            NEW.user_id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO review_system.review_audit_log (
            operation,
            table_name,
            record_id,
            old_data,
            new_data,
            changed_by
        )
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            NEW.review_id,
            row_to_json(OLD),
            row_to_json(NEW),
            NEW.user_id
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO review_system.review_audit_log (
            operation,
            table_name,
            record_id,
            old_data,
            changed_by
        )
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            OLD.review_id,
            row_to_json(OLD),
            OLD.user_id
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器
-- 自动分区触发器
CREATE TRIGGER trg_reviews_auto_partition
    BEFORE INSERT ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition();

CREATE TRIGGER trg_replies_auto_partition
    BEFORE INSERT ON review_system.review_replies_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition();

CREATE TRIGGER trg_summary_auto_partition
    BEFORE INSERT ON review_system.review_summary_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition();

-- 汇总数据触发器
CREATE TRIGGER trg_update_summary
    AFTER INSERT OR UPDATE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.update_review_summary();

-- 审计日志触发器
CREATE TRIGGER trg_reviews_audit
    AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.audit_trigger(); 