-- 创建评论主分区表
CREATE TABLE review_system.reviews_partitioned (
    review_id BIGSERIAL,
    game_id BIGINT REFERENCES games(game_id),
    user_id BIGINT REFERENCES user_system.users(user_id),
    rating DECIMAL(3,2),
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN,
    platform VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT reviews_pkey PRIMARY KEY (review_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建回复分区表
CREATE TABLE review_system.review_replies_partitioned (
    reply_id BIGSERIAL,
    review_id BIGINT,
    user_id BIGINT REFERENCES user_system.users(user_id),
    parent_id BIGINT,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    reply_status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT replies_pkey PRIMARY KEY (reply_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建汇总分区表
CREATE TABLE review_system.review_summary_partitioned (
    summary_id BIGSERIAL,
    game_id BIGINT REFERENCES games(game_id),
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
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
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    positive_rate DECIMAL(5,2),
    avg_playtime_hours DECIMAL(10,2),
    CONSTRAINT summary_pkey PRIMARY KEY (summary_id, last_updated),
    CONSTRAINT unique_game_id_per_partition UNIQUE (game_id, last_updated)
) PARTITION BY RANGE (last_updated);

-- 创建审计日志表
CREATE TABLE review_system.review_audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(20),
    record_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    changed_by BIGINT REFERENCES user_system.users(user_id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 