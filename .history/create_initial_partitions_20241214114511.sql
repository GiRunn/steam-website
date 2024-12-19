-- 创建当前月份的分区
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    start_date timestamp with time zone;
    end_date timestamp with time zone;
BEGIN
    -- 计算当前月份的开始和结束日期
    start_date := date_trunc('month', current_date);
    end_date := start_date + interval '1 month';
    
    -- 创建评论表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.reviews_y%sm%s PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );
    
    -- 创建回复表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.replies_y%sm%s PARTITION OF review_system.review_replies_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );
    
    -- 创建汇总表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.summary_y%sm%s PARTITION OF review_system.review_summary_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );
END $$;

-- 插入初始汇总数据
INSERT INTO review_system.review_summary_partitioned (
    game_id,
    last_updated
) VALUES (
    1001,
    CURRENT_TIMESTAMP
); 