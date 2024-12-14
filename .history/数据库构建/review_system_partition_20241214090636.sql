-- 1. 创建分区表
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

-- 2. 创建月度分区
CREATE TABLE review_system.reviews_y2024m01 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE review_system.reviews_y2024m02 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 继续创建未来的月度分区...

-- 3. 创建回复分区表
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

-- 4. 创建回复月度分区
CREATE TABLE review_system.review_replies_y2024m01 PARTITION OF review_system.review_replies_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE review_system.review_replies_y2024m02 PARTITION OF review_system.review_replies_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 5. 创建汇总分区表
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

-- 6. 创建汇总月度分区
CREATE TABLE review_system.review_summary_y2024m01 PARTITION OF review_system.review_summary_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE review_system.review_summary_y2024m02 PARTITION OF review_system.review_summary_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 7. 创建必要的索引
CREATE INDEX idx_reviews_part_game_created ON review_system.reviews_partitioned (game_id, created_at);
CREATE INDEX idx_reviews_part_user_created ON review_system.reviews_partitioned (user_id, created_at);
CREATE INDEX idx_reviews_part_rating ON review_system.reviews_partitioned (rating);
CREATE INDEX idx_reviews_part_platform ON review_system.reviews_partitioned (platform);
CREATE INDEX idx_reviews_part_language ON review_system.reviews_partitioned (language);

CREATE INDEX idx_replies_part_review_created ON review_system.review_replies_partitioned (review_id, created_at);
CREATE INDEX idx_replies_part_user_created ON review_system.review_replies_partitioned (user_id, created_at);
CREATE INDEX idx_replies_part_parent ON review_system.review_replies_partitioned (parent_id);

CREATE INDEX idx_summary_part_game_updated ON review_system.review_summary_partitioned (game_id, last_updated); 