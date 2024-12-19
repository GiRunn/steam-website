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
BEGIN
    -- 获取父表名
    parent_table := TG_TABLE_NAME;
    
    -- 根据父表名确定分区日期和表前缀
    CASE parent_table
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
            RAISE EXCEPTION 'Unknown parent table: %', parent_table;
    END CASE;

    -- 生成分区名
    partition_name := table_prefix || '_y' || 
                     to_char(partition_date, 'YYYY') || 
                     'm' || to_char(partition_date, 'MM');
    
    -- 设置分区范围
    start_date := partition_date;
    end_date := partition_date + interval '1 month';

    -- 检查分区是否存在，如果不存在则创建
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
        AND n.nspname = TG_TABLE_SCHEMA
    ) THEN
        BEGIN
            -- 创建新分区
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I.%I PARTITION OF %I.%I 
                FOR VALUES FROM (%L) TO (%L)',
                TG_TABLE_SCHEMA, partition_name, TG_TABLE_SCHEMA, parent_table,
                start_date, end_date
            );
            
            RAISE NOTICE 'Created new partition: %.% for parent table % with date range % to %', 
                TG_TABLE_SCHEMA, partition_name, parent_table, start_date, end_date;

            -- 为新分区创建索引
            IF parent_table = 'review_summary_partitioned' THEN
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
        EXCEPTION WHEN OTHERS THEN
            -- 记录错误信息
            RAISE NOTICE 'Error creating partition: % (table: %, date: %)', 
                SQLERRM, parent_table, partition_date;
            RAISE;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;