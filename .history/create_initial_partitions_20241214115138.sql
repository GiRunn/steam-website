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
    
    -- 直接创建评论表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.reviews_y%sm%s PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );
    
    -- 直接创建回复表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.replies_y%sm%s PARTITION OF review_system.review_replies_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );
    
    -- 直接创建汇总表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.summary_y%sm%s PARTITION OF review_system.review_summary_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        start_date,
        end_date
    );

    -- 创建分区索引
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_reviews_y%sm%s_created_at ON review_system.reviews_y%sm%s(created_at)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM')
    );
    
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_replies_y%sm%s_created_at ON review_system.replies_y%sm%s(created_at)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM')
    );
    
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_summary_y%sm%s_game_updated ON review_system.summary_y%sm%s(game_id, last_updated)',
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM'),
        to_char(current_date, 'YYYY'),
        to_char(current_date, 'MM')
    );
END $$;

-- 插入初始汇总数据（使用当前时间戳）
DO $$
DECLARE
    v_timestamp timestamp with time zone := CURRENT_TIMESTAMP;
BEGIN
    INSERT INTO review_system.review_summary_partitioned (
        game_id,
        total_reviews,
        average_rating,
        total_playtime_hours,
        total_likes,
        total_replies,
        replies_likes,
        pc_count,
        ps5_count,
        xbox_count,
        en_us_count,
        en_gb_count,
        zh_cn_count,
        es_es_count,
        ja_jp_count,
        recommended_count,
        last_updated
    ) VALUES (
        1001,  -- game_id
        0,     -- total_reviews
        0,     -- average_rating
        0,     -- total_playtime_hours
        0,     -- total_likes
        0,     -- total_replies
        0,     -- replies_likes
        0,     -- pc_count
        0,     -- ps5_count
        0,     -- xbox_count
        0,     -- en_us_count
        0,     -- en_gb_count
        0,     -- zh_cn_count
        0,     -- es_es_count
        0,     -- ja_jp_count
        0,     -- recommended_count
        v_timestamp  -- last_updated
    );
END $$; 