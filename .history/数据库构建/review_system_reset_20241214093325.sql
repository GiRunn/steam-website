-- 1. 删除所有相关表
DROP TABLE IF EXISTS review_system.reviews CASCADE;
DROP TABLE IF EXISTS review_system.review_replies CASCADE;
DROP TABLE IF EXISTS review_system.review_summary CASCADE;
DROP TABLE IF EXISTS review_system.reviews_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_replies_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_partitioned CASCADE;

-- 2. 重新创建分区表
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

-- 3. 创建2024年12月的分区
CREATE TABLE review_system.reviews_y2024m12 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-12-01 00:00:00+08') TO ('2025-01-01 00:00:00+08');

-- 4. 插入示例数据
INSERT INTO review_system.reviews_partitioned (game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) VALUES
(1001, 1, 4.5, '这游戏真不错！', 10, true, 'PC', 'zh_CN', '2024-12-07 09:53:44.223425+08'),
(1001, 2, 4.0, 'Great game!', 15, true, 'PS5', 'en_US', '2024-12-07 09:54:12.123456+08'),
(1001, 3, 3.5, '面白いゲームですね', 8, true, 'PC', 'ja_JP', '2024-12-07 09:55:22.234567+08'),
(1001, 4, 5.0, '非常推荐！', 20, true, 'PC', 'zh_CN', '2024-12-07 09:56:33.345678+08'),
(1001, 5, 4.8, 'Awesome!', 12, true, 'XBOX', 'en_US', '2024-12-07 09:57:44.456789+08'),
(1002, 1, 3.0, '一般般吧', 5, false, 'PC', 'zh_CN', '2024-12-07 09:58:55.567890+08'),
(1002, 2, 2.5, 'Not recommended', 3, false, 'PS5', 'en_US', '2024-12-07 09:59:11.246291+08');

-- 5. 创建索引
CREATE INDEX idx_reviews_part_game_created ON review_system.reviews_partitioned (game_id, created_at);
CREATE INDEX idx_reviews_part_user_created ON review_system.reviews_partitioned (user_id, created_at);
CREATE INDEX idx_reviews_part_rating ON review_system.reviews_partitioned (rating);
CREATE INDEX idx_reviews_part_platform ON review_system.reviews_partitioned (platform);
CREATE INDEX idx_reviews_part_language ON review_system.reviews_partitioned (language);

-- 6. 验证数据
SELECT 
    game_id,
    COUNT(*) as review_count,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN is_recommended THEN 1 END) as recommended_count
FROM review_system.reviews_partitioned
GROUP BY game_id
ORDER BY game_id; 