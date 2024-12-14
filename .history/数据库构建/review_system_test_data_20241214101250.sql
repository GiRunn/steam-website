-- 插入评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) 
VALUES
(1001, 1, 4.5, '这游戏真不错！', 10, true, 'PC', 'zh_CN', '2024-12-07 09:53:44.223425+08'),
(1001, 2, 4.0, 'Great game!', 15, true, 'PS5', 'en_US', '2024-12-07 09:54:12.123456+08'),
(1002, 3, 3.5, '面白いゲームですね', 8, true, 'PC', 'ja_JP', '2024-12-31 23:59:59.999999+08'),
(1001, 4, 5.0, '非常推荐！', 20, true, 'PC', 'zh_CN', '2025-01-01 00:00:01.345678+08'),
(1002, 5, 4.8, 'Awesome!', 12, true, 'XBOX', 'en_US', '2025-01-15 10:20:30.456789+08');

-- 插入回复数据
INSERT INTO review_system.review_replies_partitioned
(review_id, user_id, content, language, created_at)
VALUES
(1, 2, '同意你的观点！', 'zh_CN', '2024-12-07 10:00:00+08'),
(1, 3, 'Thanks for sharing!', 'en_US', '2024-12-07 10:30:00+08'),
(4, 5, '确实很棒！', 'zh_CN', '2025-01-01 09:00:00+08');

-- 验证数据
SELECT 
    r.game_id,
    COUNT(*) as review_count,
    AVG(r.rating) as avg_rating,
    COUNT(*) FILTER (WHERE r.is_recommended) as recommended_count,
    s.total_reviews,
    s.average_rating,
    s.recommended_count
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_summary_partitioned s 
    ON r.game_id = s.game_id
GROUP BY r.game_id, s.total_reviews, s.average_rating, s.recommended_count
ORDER BY r.game_id; 

-- 验证分区创建情况
SELECT 
    parent.relname as 父表名,
    child.relname as 分区名,
    pg_get_expr(child.relpartbound, child.oid) as 分区范围
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
WHERE parent.relname IN (
    'reviews_partitioned', 
    'review_replies_partitioned', 
    'review_summary_partitioned'
)
ORDER BY parent.relname, child.relname;