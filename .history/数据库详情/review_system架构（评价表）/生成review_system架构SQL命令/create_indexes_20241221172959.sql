-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON review_system.reviews_partitioned(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON review_system.reviews_partitioned(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON review_system.reviews_partitioned(review_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON review_system.reviews_partitioned(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON review_system.reviews_partitioned(rating);

-- 回复表索引
CREATE INDEX IF NOT EXISTS idx_replies_review_id ON review_system.review_replies_partitioned(review_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON review_system.review_replies_partitioned(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent_id ON review_system.review_replies_partitioned(parent_id);
CREATE INDEX IF NOT EXISTS idx_replies_status ON review_system.review_replies_partitioned(reply_status);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON review_system.review_replies_partitioned(created_at);

-- 汇总表索引
CREATE INDEX IF NOT EXISTS idx_summary_part_game_updated ON review_system.review_summary_partitioned(game_id, last_updated);
CREATE INDEX IF NOT EXISTS idx_summary_part_rating ON review_system.review_summary_partitioned(average_rating); 

-- 优化现有索引
DROP INDEX IF EXISTS idx_reviews_game_id;
CREATE INDEX idx_reviews_game_rating ON review_system.reviews_partitioned(game_id, rating)
    INCLUDE (user_id, created_at) -- 包含常用字段
    WHERE review_status = 'active'; -- 部分索引

-- 添加复合索引
CREATE INDEX idx_reviews_user_game ON review_system.reviews_partitioned(user_id, game_id, created_at)
    WHERE review_status = 'active';

-- 添加分区表本地索引
CREATE OR REPLACE FUNCTION review_system.create_partition_indexes(
    p_partition_name TEXT
) RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (game_id, created_at, rating)',
        'idx_' || p_partition_name || '_game_created_rating',
        'review_system', p_partition_name
    );
    
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (user_id, created_at)',
        'idx_' || p_partition_name || '_user_created',
        'review_system', p_partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- 添加BRIN索引用于时间范围查询
CREATE INDEX idx_reviews_created_at_brin ON review_system.reviews_partitioned 
    USING BRIN (created_at) WITH (pages_per_range = 128);

-- 为热门查询添加覆盖索引
CREATE INDEX idx_reviews_summary ON review_system.reviews_partitioned
    (game_id, created_at, rating, review_status)
    INCLUDE (likes_count, playtime_hours);