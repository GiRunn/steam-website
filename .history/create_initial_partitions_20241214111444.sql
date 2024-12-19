-- 创建当前月份的初始分区
DO $$
DECLARE
    current_date timestamp with time zone := date_trunc('month', CURRENT_TIMESTAMP);
    next_date timestamp with time zone := current_date + interval '1 month';
    partition_name text;
BEGIN
    -- 创建评论表初始分区
    partition_name := 'reviews_partitioned_y' || 
                     to_char(current_date, 'YYYY') || 
                     'm' || to_char(current_date, 'MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, current_date, next_date
    );
    
    -- 创建回复表初始分区
    partition_name := 'review_replies_partitioned_y' || 
                     to_char(current_date, 'YYYY') || 
                     'm' || to_char(current_date, 'MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_replies_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, current_date, next_date
    );
END $$; 