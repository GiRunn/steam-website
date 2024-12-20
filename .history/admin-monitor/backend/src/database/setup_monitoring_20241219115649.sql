-- 创建监控所需的表和视图
CREATE SCHEMA IF NOT EXISTS review_system;

-- 创建评论分区表
CREATE TABLE IF NOT EXISTS review_system.reviews_partitioned (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (created_at);

-- 创建回复分区表
CREATE TABLE IF NOT EXISTS review_system.review_replies_partitioned (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (created_at);

-- 创建安全事件记录表
CREATE TABLE IF NOT EXISTS review_system.security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建监控视图
CREATE OR REPLACE VIEW review_system.monitoring_stats AS
SELECT
    COUNT(*) as total_reviews,
    ROUND(AVG(rating)::numeric, 2) as avg_rating,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as reviews_last_hour,
    COUNT(DISTINCT game_id) as unique_games_reviewed
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL; 