-- 创建评论系统schema
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建自动创建分区的函数
CREATE OR REPLACE FUNCTION review_system.create_partition_if_not_exists(
    partition_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 计算分区的开始和结束日期
    start_date := DATE_TRUNC('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    
    -- 构造分区名称 (例如: reviews_y2024m01)
    partition_name := 'reviews_y' || 
                     TO_CHAR(partition_date, 'YYYY') || 
                     'm' || 
                     TO_CHAR(partition_date, 'MM');

    -- 检查分区是否已存在
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'review_system'
        AND c.relname = partition_name
    ) THEN
        -- 创建评论主表分区
        EXECUTE format(
            $$ CREATE TABLE review_system.%I 
               PARTITION OF review_system.reviews_partitioned
               FOR VALUES FROM (%L) TO (%L) $$,
            partition_name,
            start_date,
            end_date
        );
        
        -- 创建评论回复表分区
        EXECUTE format(
            $$ CREATE TABLE review_system.replies_%I 
               PARTITION OF review_system.review_replies_partitioned
               FOR VALUES FROM (%L) TO (%L) $$,
            partition_name,
            start_date,
            end_date
        );
    END IF;
END;
$$ LANGUAGE plpgsql; 