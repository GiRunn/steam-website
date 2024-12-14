-- 1. 创建临时表
CREATE TABLE review_system.reviews_temp (
    review_id BIGINT,
    game_id INTEGER,
    user_id INTEGER,
    rating DECIMAL(2,1),
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER,
    review_status VARCHAR(20),
    is_recommended BOOLEAN,
    platform VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_system.review_replies_temp (
    reply_id BIGINT,
    review_id BIGINT,
    user_id INTEGER,
    parent_id BIGINT,
    content TEXT,
    likes_count INTEGER,
    reply_status VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_system.review_summary_temp (
    summary_id BIGINT,
    game_id INTEGER,
    total_reviews INTEGER,
    average_rating DECIMAL(4,2),
    total_playtime_hours BIGINT,
    total_likes INTEGER,
    total_replies INTEGER,
    replies_likes INTEGER,
    pc_count INTEGER,
    ps5_count INTEGER,
    xbox_count INTEGER,
    en_us_count INTEGER,
    en_gb_count INTEGER,
    zh_cn_count INTEGER,
    es_es_count INTEGER,
    ja_jp_count INTEGER,
    recommended_count INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE,
    positive_rate DECIMAL(5,2),
    avg_playtime_hours DECIMAL(10,2)
); 