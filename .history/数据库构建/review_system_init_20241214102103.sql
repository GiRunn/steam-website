-- 1. 创建schema
CREATE SCHEMA IF NOT EXISTS review_system;

-- 2. 创建主分区表
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

-- 3. 创建回复分区表
CREATE TABLE review_system.review_replies_partitioned (
    reply_id BIGSERIAL,
    review_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT,
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT review_replies_partitioned_pkey PRIMARY KEY (review_id, created_at, reply_id)
) PARTITION BY RANGE (created_at);

-- 4. 创建汇总分区表
CREATE TABLE review_system.review_summary_partitioned (
    summary_id BIGSERIAL,
    game_id INTEGER NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(4,2) DEFAULT 0,
    total_playtime_hours BIGINT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_summary_partitioned_pkey PRIMARY KEY (game_id, last_updated)
) PARTITION BY RANGE (last_updated); 