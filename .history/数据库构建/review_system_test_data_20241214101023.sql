-- 1. 插入2024年12月的评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) 
VALUES
-- 2024年12月的数据
(1001, 1, 4.5, '这游戏真不错！', 10, true, 'PC', 'zh_CN', '2024-12-07 09:53:44.223425+08'),
(1001, 2, 4.0, 'Great game!', 15, true, 'PS5', 'en_US', '2024-12-07 09:54:12.123456+08'),
(1002, 3, 3.5, '面白いゲームですね', 8, true, 'PC', 'ja_JP', '2024-12-31 23:59:59.999999+08'),

-- 2025年1月的数据（应该自动创建新分区）
(1001, 4, 5.0, '非常推荐！', 20, true, 'PC', 'zh_CN', '2025-01-01 00:00:01.345678+08'),
(1002, 5, 4.8, 'Awesome!', 12, true, 'XBOX', 'en_US', '2025-01-15 10:20:30.456789+08');

-- 2. 插入对应的回复数据
INSERT INTO review_system.review_replies_partitioned
(review_id, user_id, content, language, created_at)
VALUES
-- 2024年12月的回复
(1, 2, '同意你的观点！', 'zh_CN', '2024-12-07 10:00:00+08'),
(1, 3, 'Thanks for sharing!', 'en_US', '2024-12-07 10:30:00+08'),

-- 2025年1月的回复
(4, 5, '确实很棒！', 'zh_CN', '2025-01-01 09:00:00+08');

-- 3. 插入汇总数据
INSERT INTO review_system.review_summary_partitioned
(game_id, total_reviews, average_rating, total_playtime_hours, pc_count, ps5_count, xbox_count, 
 zh_cn_count, en_us_count, ja_jp_count, recommended_count, last_updated)
VALUES
-- 2024年12月的汇总
(1001, 2, 4.25, 25, 1, 1, 0, 1, 1, 0, 2, '2024-12-07 10:00:00+08'),
(1002, 1, 3.50, 8, 1, 0, 0, 0, 0, 1, 1, '2024-12-31 23:59:59+08'),

-- 2025年1月的汇总
(1001, 3, 4.50, 45, 2, 1, 0, 2, 1, 0, 3, '2025-01-15 10:30:00+08'),
(1002, 2, 4.15, 20, 1, 0, 1, 0, 1, 1, 2, '2025-01-15 10:35:00+08');

-- 4. 验证分区情况
SELECT 
    parent.relname as 父表名,
    child.relname as 分区名,
    pg_get_expr(child.relpartbound, child.oid) as 分区范围,
    count(*) as 数据量
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
    LEFT JOIN review_system.reviews_partitioned p ON true
WHERE parent.relname IN (
    'reviews_partitioned', 
    'review_replies_partitioned', 
    'review_summary_partitioned'
)
GROUP BY parent.relname, child.relname, child.relpartbound, child.oid
ORDER BY parent.relname, child.relname; 