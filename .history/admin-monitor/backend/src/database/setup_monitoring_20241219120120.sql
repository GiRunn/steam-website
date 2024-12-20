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

-- 创建默认分区
CREATE TABLE IF NOT EXISTS review_system.reviews_default PARTITION OF review_system.reviews_partitioned
    DEFAULT;

-- 创建最近一年的月度分区
DO $$
BEGIN
    FOR i IN 0..11 LOOP
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.reviews_p%s 
             PARTITION OF review_system.reviews_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            to_char(CURRENT_DATE - (i || ' month')::interval, 'YYYY_MM'),
            date_trunc('month', CURRENT_DATE - (i || ' month')::interval),
            date_trunc('month', CURRENT_DATE - ((i-1) || ' month')::interval)
        );
    END LOOP;
END $$;

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

-- 创建回复表的默认分区
CREATE TABLE IF NOT EXISTS review_system.review_replies_default PARTITION OF review_system.review_replies_partitioned
    DEFAULT;

-- 创建回复表的月度分区
DO $$
BEGIN
    FOR i IN 0..11 LOOP
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.review_replies_p%s 
             PARTITION OF review_system.review_replies_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            to_char(CURRENT_DATE - (i || ' month')::interval, 'YYYY_MM'),
            date_trunc('month', CURRENT_DATE - (i || ' month')::interval),
            date_trunc('month', CURRENT_DATE - ((i-1) || ' month')::interval)
        );
    END LOOP;
END $$;

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

-- 插入一些测试数据
INSERT INTO review_system.reviews_partitioned (game_id, user_id, rating, content, created_at)
SELECT 
    floor(random() * 100 + 1)::integer as game_id,
    floor(random() * 1000 + 1)::integer as user_id,
    floor(random() * 5 + 1)::integer as rating,
    'Test review content ' || i as content,
    timestamp '2023-01-01' + (random() * (NOW() - timestamp '2023-01-01')) as created_at
FROM generate_series(1, 1000) as i;

-- 插入一些回复测试数据
INSERT INTO review_system.review_replies_partitioned (review_id, user_id, content, created_at)
SELECT 
    floor(random() * 1000 + 1)::integer as review_id,
    floor(random() * 1000 + 1)::integer as user_id,
    'Test reply content ' || i as content,
    timestamp '2023-01-01' + (random() * (NOW() - timestamp '2023-01-01')) as created_at
FROM generate_series(1, 500) as i;

-- 插入一些安全事件测试数据
INSERT INTO review_system.security_events (event_type, description, severity)
VALUES 
    ('suspicious_login', '检测到可疑登录尝试', 'warning'),
    ('failed_login', '多次登录失败', 'warning'),
    ('sql_injection', '检测到可能的SQL注入尝试', 'high'),
    ('spam_detected', '检测到垃圾评论', 'medium'); 