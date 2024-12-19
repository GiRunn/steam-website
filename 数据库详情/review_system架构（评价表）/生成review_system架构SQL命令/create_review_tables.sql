-- 创建review_system架构
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建审计日志表
CREATE TABLE review_system.review_audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(20) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by BIGINT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建评论主表(分区表)
CREATE TABLE review_system.reviews_partitioned (
    review_id BIGSERIAL,
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    content TEXT NOT NULL,
    playtime_hours INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN,
    platform VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (review_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建评论回复主表(分区表)
CREATE TABLE review_system.review_replies_partitioned (
    reply_id BIGSERIAL,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    reply_status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (reply_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建评论汇总主表(分区表)
CREATE TABLE review_system.review_summary_partitioned (
    summary_id BIGSERIAL,
    game_id BIGINT NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_playtime_hours INTEGER DEFAULT 0,
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
    positive_rate DECIMAL(5,2),
    avg_playtime_hours DECIMAL(10,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (summary_id, last_updated),
    CONSTRAINT unique_game_id_per_partition UNIQUE (game_id, last_updated)
) PARTITION BY RANGE (last_updated); 