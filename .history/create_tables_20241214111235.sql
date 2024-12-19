-- 创建评论主表
CREATE TABLE review_system.reviews_partitioned (
    review_id BIGSERIAL,
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating DECIMAL(3,2),
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN,
    platform VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT reviews_pkey PRIMARY KEY (review_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建评论回复表
CREATE TABLE review_system.review_replies_partitioned (
    reply_id BIGSERIAL,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    reply_status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT replies_pkey PRIMARY KEY (reply_id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建评论汇总表
CREATE TABLE review_system.review_summary (
    game_id BIGINT PRIMARY KEY,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_playtime_hours INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    platform_stats JSONB DEFAULT '{}'::jsonb,
    language_stats JSONB DEFAULT '{}'::jsonb,
    recommendation_rate DECIMAL(5,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 