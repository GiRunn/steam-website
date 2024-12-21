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

-- 插入初始汇总数据前先确保分区存在
DO $$
DECLARE
    v_timestamp timestamp with time zone := CURRENT_TIMESTAMP;
    v_partition_name text;
    v_start_date timestamp with time zone;
    v_end_date timestamp with time zone;
BEGIN
    -- 计算分区日期
    v_start_date := date_trunc('month', v_timestamp);
    v_end_date := v_start_date + interval '1 month';
    v_partition_name := 'summary_y' || to_char(v_timestamp, 'YYYY') || 'm' || to_char(v_timestamp, 'MM');

    -- 检查并创建分区
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename = v_partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_summary_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            v_partition_name,
            v_start_date,
            v_end_date
        );
    END IF;

    -- 临时禁用触发器
    ALTER TABLE review_system.review_summary_partitioned DISABLE TRIGGER ALL;
    
    -- 插入数据
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
    
    -- 重新启用触发器
    ALTER TABLE review_system.review_summary_partitioned ENABLE TRIGGER ALL;
END $$;

-- 预创建未来6个月的分区
SELECT review_system.create_future_partitions(6);