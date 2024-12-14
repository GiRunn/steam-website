-- 1. 创建自动创建分区的存储过程
CREATE OR REPLACE PROCEDURE review_system.create_next_month_partitions()
LANGUAGE plpgsql
AS $$
DECLARE
    next_month_start DATE;
    next_month_end DATE;
    partition_name TEXT;
BEGIN
    -- 获取下个月的开始和结束日期
    next_month_start := date_trunc('month', current_date + interval '1 month');
    next_month_end := next_month_start + interval '1 month';
    
    -- 创建评论分区
    partition_name := 'reviews_y' || to_char(next_month_start, 'YYYY') || 'm' || to_char(next_month_start, 'MM');
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        next_month_start,
        next_month_end
    );
    
    -- 创建回复分区
    partition_name := 'review_replies_y' || to_char(next_month_start, 'YYYY') || 'm' || to_char(next_month_start, 'MM');
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_replies_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        next_month_start,
        next_month_end
    );
    
    -- 创建汇总分区
    partition_name := 'review_summary_y' || to_char(next_month_start, 'YYYY') || 'm' || to_char(next_month_start, 'MM');
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_summary_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        next_month_start,
        next_month_end
    );
END;
$$;

-- 2. 创建数据清理存储过程
CREATE OR REPLACE PROCEDURE review_system.cleanup_old_partitions(months_to_keep INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
BEGIN
    partition_date := date_trunc('month', current_date - (months_to_keep || ' months')::interval);
    
    -- 清理评论分区
    partition_name := 'reviews_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
    EXECUTE format('DROP TABLE IF EXISTS review_system.%I', partition_name);
    
    -- 清理回复分区
    partition_name := 'review_replies_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
    EXECUTE format('DROP TABLE IF EXISTS review_system.%I', partition_name);
    
    -- 清理汇总分区
    partition_name := 'review_summary_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
    EXECUTE format('DROP TABLE IF EXISTS review_system.%I', partition_name);
END;
$$; 