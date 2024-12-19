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
    partition_date := date_trunc('month', NEW.created_at);
    
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
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I.%I (created_at)',
            'idx_' || partition_name || '_created_at',
            TG_TABLE_SCHEMA, partition_name
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 