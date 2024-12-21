-- 优化分区策略

-- 0. 确保基础分区表存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename = 'reviews_partitioned'
    ) THEN
        CREATE TABLE review_system.reviews_partitioned (
            review_id BIGSERIAL,
            game_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
            content TEXT NOT NULL,
            playtime_hours INTEGER,
            platform VARCHAR(50),
            language VARCHAR(10),
            is_recommended BOOLEAN DEFAULT true,
            likes_count INTEGER DEFAULT 0,
            review_status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE,
            PRIMARY KEY (review_id, created_at)
        ) PARTITION BY RANGE (created_at);
    END IF;
END $$;

-- 1. 首先创建新表结构
CREATE TABLE review_system.reviews_partitioned_new (
    review_id BIGSERIAL,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating DECIMAL(2,1),
    content TEXT,
    playtime_hours INTEGER,
    platform VARCHAR(20),
    language VARCHAR(10),
    is_recommended BOOLEAN,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    -- 修改主键，包含分区键
    PRIMARY KEY (review_id, created_at, game_id)
) PARTITION BY RANGE (created_at, game_id);

-- 2. 创建分区
CREATE OR REPLACE FUNCTION review_system.create_review_partitions()
RETURNS void AS $$
DECLARE
    partition_date date;
    game_range int;
BEGIN
    FOR partition_date IN 
        SELECT generate_series(
            date_trunc('month', CURRENT_DATE),
            date_trunc('month', CURRENT_DATE + interval '12 month'),
            interval '1 month'
        )
    LOOP
        -- 按游戏ID范围分区
        FOR game_range IN 1..10 LOOP
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS reviews_%s_game_%s 
                 PARTITION OF review_system.reviews_partitioned_new
                 FOR VALUES FROM (%L, %s) TO (%L, %s)',
                to_char(partition_date, 'YYYY_MM'),
                game_range,
                partition_date,
                (game_range - 1) * 1000 + 1,
                partition_date + interval '1 month',
                game_range * 1000
            );
            
            -- 为每个分区创建本地索引
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS idx_reviews_%s_game_%s_composite 
                 ON reviews_%s_game_%s (game_id, created_at, rating)',
                to_char(partition_date, 'YYYY_MM'),
                game_range,
                to_char(partition_date, 'YYYY_MM'),
                game_range
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建必要的索引
CREATE INDEX idx_reviews_game_rating ON review_system.reviews_partitioned_new
    (game_id, rating)
    INCLUDE (user_id, created_at)
    WHERE review_status = 'active';

CREATE INDEX idx_reviews_created_at_brin ON review_system.reviews_partitioned_new 
    USING BRIN (created_at) WITH (pages_per_range = 128);

-- 4. 迁移数据（如果需要）
INSERT INTO review_system.reviews_partitioned_new
SELECT * FROM review_system.reviews_partitioned;

-- 5. 重命名表
ALTER TABLE review_system.reviews_partitioned RENAME TO reviews_partitioned_old;
ALTER TABLE review_system.reviews_partitioned_new RENAME TO reviews_partitioned;

-- 6. 删除旧表（确认数据迁移成功后）
-- DROP TABLE review_system.reviews_partitioned_old;

-- 7. 执行分区创建
SELECT review_system.create_review_partitions();

-- 8. 创建全局索引
CREATE INDEX IF NOT EXISTS reviews_partitioned_new_game_id_idx 
ON review_system.reviews_partitioned_new (game_id, created_at);

CREATE INDEX IF NOT EXISTS reviews_partitioned_new_user_id_idx 
ON review_system.reviews_partitioned_new (user_id, created_at);

-- 9. 添加分区表注释
COMMENT ON TABLE review_system.reviews_partitioned_new 
IS '游戏评论分区表 - 按时间范围分区';