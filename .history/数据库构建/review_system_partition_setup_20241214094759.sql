-- 1. 创建schema（如果不存在）
CREATE SCHEMA IF NOT EXISTS review_system;

-- 2. 重新创建分区表
DROP TABLE IF EXISTS review_system.reviews_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_replies_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_partitioned CASCADE;

-- 3. 创建主分区表
CREATE TABLE review_system.reviews_partitioned (
    review_id BIGSERIAL,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN,
    platform VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT reviews_partitioned_pkey PRIMARY KEY (game_id, created_at, review_id)
) PARTITION BY RANGE (created_at);

CREATE TABLE review_system.review_replies_partitioned (
    reply_id BIGSERIAL,
    review_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    parent_id BIGINT,
    content TEXT,
    likes_count INTEGER DEFAULT 0,
    reply_status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT review_replies_partitioned_pkey PRIMARY KEY (review_id, created_at, reply_id)
) PARTITION BY RANGE (created_at);

CREATE TABLE review_system.review_summary_partitioned (
    summary_id BIGSERIAL,
    game_id INTEGER NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(4,2) DEFAULT 0,
    total_playtime_hours BIGINT DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    replies_likes INTEGER DEFAULT 0,
    pc_count INTEGER DEFAULT 0,
    ps5_count INTEGER DEFAULT 0,
    xbox_count INTEGER DEFAULT 0,
    en_us_count INTEGER DEFAULT 0,
    en_gb_count INTEGER DEFAULT 0,
    zh_cn_count INTEGER DEFAULT 0,
    es_es_count INTEGER DEFAULT 0,
    ja_jp_count INTEGER DEFAULT 0,
    recommended_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    positive_rate DECIMAL(5,2),
    avg_playtime_hours DECIMAL(10,2),
    CONSTRAINT review_summary_partitioned_pkey PRIMARY KEY (game_id, last_updated)
) PARTITION BY RANGE (last_updated);

-- 4. 创建2024年12月的分区
CREATE TABLE review_system.reviews_y2024m12 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-12-01 00:00:00+08') TO ('2025-01-01 00:00:00+08');

CREATE TABLE review_system.review_replies_y2024m12 PARTITION OF review_system.review_replies_partitioned
    FOR VALUES FROM ('2024-12-01 00:00:00+08') TO ('2025-01-01 00:00:00+08');

CREATE TABLE review_system.review_summary_y2024m12 PARTITION OF review_system.review_summary_partitioned
    FOR VALUES FROM ('2024-12-01 00:00:00+08') TO ('2025-01-01 00:00:00+08');

-- 5. 创建索引
CREATE INDEX idx_reviews_part_game_created ON review_system.reviews_partitioned (game_id, created_at);
CREATE INDEX idx_reviews_part_user_created ON review_system.reviews_partitioned (user_id, created_at);
CREATE INDEX idx_reviews_part_rating ON review_system.reviews_partitioned (rating);
CREATE INDEX idx_reviews_part_platform ON review_system.reviews_partitioned (platform);
CREATE INDEX idx_reviews_part_language ON review_system.reviews_partitioned (language);

CREATE INDEX idx_replies_part_review_created ON review_system.review_replies_partitioned (review_id, created_at);
CREATE INDEX idx_replies_part_user_created ON review_system.review_replies_partitioned (user_id, created_at);
CREATE INDEX idx_replies_part_parent ON review_system.review_replies_partitioned (parent_id);

CREATE INDEX idx_summary_part_game_updated ON review_system.review_summary_partitioned (game_id, last_updated);

-- 6. 验证分区创建
SELECT 
    nmsp_parent.nspname AS parent_schema,
    parent.relname AS parent_table,
    child.relname AS partition_name,
    pg_get_expr(child.relpartbound, child.oid) AS partition_range
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
WHERE parent.relname IN ('reviews_partitioned', 'review_replies_partitioned', 'review_summary_partitioned')
ORDER BY parent.relname, child.relname; 