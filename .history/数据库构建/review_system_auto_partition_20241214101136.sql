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
    partition_date := date_trunc('month', NEW.created_at);
    start_date := partition_date;
    end_date := start_date + interval '1 month';
    
    -- 构造分区名称
    partition_name := 'y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
    
    -- 检查并创建评论分区
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'review_system' 
        AND c.relname = 'reviews_' || partition_name
    ) THEN
        -- 创建评论分区
        EXECUTE format(
            'CREATE TABLE review_system.reviews_%s PARTITION OF review_system.reviews_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        -- 创建回复分区
        EXECUTE format(
            'CREATE TABLE review_system.review_replies_%s PARTITION OF review_system.review_replies_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        -- 创建汇总分区
        EXECUTE format(
            'CREATE TABLE review_system.review_summary_%s PARTITION OF review_system.review_summary_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        RAISE NOTICE '已自动创建分区: %', partition_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建触发器
CREATE TRIGGER trg_auto_create_partition
    BEFORE INSERT ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition();

-- 3. 创建回复表的自动分区触发器
CREATE TRIGGER trg_auto_create_reply_partition
    BEFORE INSERT ON review_system.review_replies_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition();

-- 4. 创建汇总表的自动分区触发器
CREATE TRIGGER trg_auto_create_summary_partition
    BEFORE INSERT ON review_system.review_summary_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.auto_create_partition(); 