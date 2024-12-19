-- 创建自动分区管理函数
CREATE OR REPLACE FUNCTION review_system.create_partition_if_not_exists()
RETURNS trigger AS $$
DECLARE
    partition_date timestamp with time zone;
    partition_name text;
    start_date timestamp with time zone;
    end_date timestamp with time zone;
BEGIN
    -- 计算分区日期(按月)
    IF TG_TABLE_NAME = 'review_summary_partitioned' THEN
        partition_date := date_trunc('month', NEW.last_updated);
    ELSE
        partition_date := date_trunc('month', NEW.created_at);
    END IF;
    
    -- 生成分区名 (修改这里，确保分区名唯一且不会递归)
    partition_name := CASE 
        WHEN TG_TABLE_NAME = 'review_summary_partitioned' THEN 'summary'
        WHEN TG_TABLE_NAME = 'reviews_partitioned' THEN 'reviews'
        WHEN TG_TABLE_NAME = 'review_replies_partitioned' THEN 'replies'
    END || '_y' || 
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
        IF TG_TABLE_NAME = 'review_summary_partitioned' THEN
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