-- 1. 创建2024年12月的分区
DO $$
DECLARE
    dec_start TIMESTAMP WITH TIME ZONE := '2024-12-01 00:00:00+08';
    jan_start TIMESTAMP WITH TIME ZONE := '2025-01-01 00:00:00+08';
    feb_start TIMESTAMP WITH TIME ZONE := '2025-02-01 00:00:00+08';
BEGIN
    -- 创建2024年12月分区
    -- 评论分区
    EXECUTE format(
        'CREATE TABLE review_system.reviews_y2024m12 PARTITION OF review_system.reviews_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        dec_start, jan_start
    );
    
    -- 回复分区
    EXECUTE format(
        'CREATE TABLE review_system.review_replies_y2024m12 PARTITION OF review_system.review_replies_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        dec_start, jan_start
    );
    
    -- 汇总分区
    EXECUTE format(
        'CREATE TABLE review_system.review_summary_y2024m12 PARTITION OF review_system.review_summary_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        dec_start, jan_start
    );

    -- 创建2025年1月分区
    -- 评论分区
    EXECUTE format(
        'CREATE TABLE review_system.reviews_y2025m01 PARTITION OF review_system.reviews_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        jan_start, feb_start
    );
    
    -- 回复分区
    EXECUTE format(
        'CREATE TABLE review_system.review_replies_y2025m01 PARTITION OF review_system.review_replies_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        jan_start, feb_start
    );
    
    -- 汇总分区
    EXECUTE format(
        'CREATE TABLE review_system.review_summary_y2025m01 PARTITION OF review_system.review_summary_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        jan_start, feb_start
    );
END $$;

-- 2. 验证分区创建
SELECT 
    parent.relname as parent_table,
    child.relname as partition_name,
    pg_get_expr(child.relpartbound, child.oid) as partition_range
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
WHERE parent.relname IN (
    'reviews_partitioned', 
    'review_replies_partitioned', 
    'review_summary_partitioned'
)
ORDER BY parent.relname, child.relname; 