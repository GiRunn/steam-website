-- 1. 插入评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) 
VALUES
-- 赛博朋克2077的评论
(1001, 1, 4.5, '画面非常震撼，剧情也很棒！夜之城的氛围营造得很好。', 120, true, 'PC', 'zh_CN', '2024-12-01 10:00:00+08'),
(1001, 2, 3.5, 'Great graphics but some bugs still exist.', 80, true, 'PS5', 'en_US', '2024-12-02 15:30:00+08'),
(1001, 3, 5.0, 'ストーリーが素晴らしい！', 200, true, 'PC', 'ja_JP', '2024-12-03 20:15:00+08'),

-- 艾尔登法环的评论
(1002, 4, 4.8, '魂系最佳作品，地图探索非常有意思', 150, true, 'PC', 'zh_CN', '2024-12-05 09:20:00+08'),
(1002, 5, 4.0, 'Challenging but rewarding!', 100, true, 'XBOX', 'en_US', '2024-12-06 14:45:00+08'),

-- 博德之门3的评论
(1003, 6, 5.0, 'CRPG的新标杆，剧情和自由度都很棒', 180, true, 'PC', 'zh_CN', '2024-12-08 11:30:00+08'),
(1003, 7, 4.7, 'Best RPG of the year!', 160, true, 'PS5', 'en_US', '2024-12-09 16:20:00+08');

-- 2. 插入回复数据
INSERT INTO review_system.review_replies_partitioned
(review_id, user_id, content, language, created_at)
VALUES
-- 赛博朋克2077评论的回复
(1, 8, '完全同意！夜之城真的太美了', 'zh_CN', '2024-12-01 10:30:00+08'),
(1, 9, '优化确实比发售时好多了', 'zh_CN', '2024-12-01 11:00:00+08'),
(2, 10, 'The latest patch fixed most issues', 'en_US', '2024-12-02 16:00:00+08'),

-- 艾尔登法环评论的回复
(4, 11, '确实，探索要素做得很棒', 'zh_CN', '2024-12-05 10:00:00+08'),
(5, 12, 'Try using magic build!', 'en_US', '2024-12-06 15:00:00+08'),

-- 博德之门3评论的回复
(6, 13, '剧情分支太多了，每周目都有新发现', 'zh_CN', '2024-12-08 12:00:00+08'),
(7, 14, 'The voice acting is amazing', 'en_US', '2024-12-09 17:00:00+08');

-- 3. 验证数据
-- 检查评论数据
SELECT 
    g.game_name,
    COUNT(r.*) as review_count,
    ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
    COUNT(*) FILTER (WHERE r.is_recommended) as recommended_count,
    COUNT(*) FILTER (WHERE r.platform = 'PC') as pc_count,
    COUNT(*) FILTER (WHERE r.platform = 'PS5') as ps5_count,
    COUNT(*) FILTER (WHERE r.platform = 'XBOX') as xbox_count
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
GROUP BY g.game_id, g.game_name
ORDER BY g.game_id;

-- 检查回复数据
SELECT 
    g.game_name,
    r.content as review_content,
    COUNT(rp.*) as reply_count,
    STRING_AGG(rp.content, ' | ') as replies
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
LEFT JOIN review_system.review_replies_partitioned rp ON r.review_id = rp.review_id
GROUP BY g.game_id, g.game_name, r.review_id, r.content
ORDER BY g.game_id, r.review_id;

-- 检查分区情况
SELECT 
    parent.relname as parent_table,
    child.relname as partition_name,
    pg_get_expr(child.relpartbound, child.oid) as partition_range,
    pg_size_pretty(pg_relation_size(child.oid)) as partition_size,
    (SELECT count(*) FROM ONLY review_system.reviews_partitioned) as row_count
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