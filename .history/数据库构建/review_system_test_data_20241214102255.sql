-- 1. 插入评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) 
VALUES
-- 2024年12月的评论
-- 赛博朋克2077的评论
(1001, 1, 4.5, '画面非常震撼，夜之城的氛围营造得很好，但偶尔还是有些小bug', 120, true, 'PC', 'zh_CN', '2024-12-01 10:00:00+08'),
(1001, 2, 3.5, 'Great graphics and story, but still has some minor issues', 80, true, 'PS5', 'en_US', '2024-12-02 15:30:00+08'),
(1001, 3, 5.0, 'ナイトシティの世界観が素晴らしい！', 200, true, 'PC', 'ja_JP', '2024-12-03 20:15:00+08'),

-- 艾尔登法环的评论
(1002, 4, 4.8, '魂系最佳作品，开放世界探索非常有意思', 150, true, 'PC', 'zh_CN', '2024-12-05 09:20:00+08'),
(1002, 5, 4.0, 'Challenging but rewarding! Love the world design', 100, true, 'XBOX', 'en_US', '2024-12-06 14:45:00+08'),

-- 2025年1月的评论
-- 博德之门3的评论
(1003, 6, 5.0, 'CRPG新标杆，剧情和自由度都很棒，值得推荐', 180, true, 'PC', 'zh_CN', '2025-01-01 11:30:00+08'),
(1003, 7, 4.7, 'Best RPG of the year! Amazing voice acting', 160, true, 'PS5', 'en_US', '2025-01-02 16:20:00+08');

-- 2. 插入回复数据
INSERT INTO review_system.review_replies_partitioned
(review_id, user_id, content, language, created_at)
VALUES
-- 2024年12月的回复
-- 赛博朋克2077评论的回复
(1, 8, '完全同意！夜之城的细节真的很棒', 'zh_CN', '2024-12-01 10:30:00+08'),
(1, 9, '现在的优化确实比发售时好很多了', 'zh_CN', '2024-12-01 11:00:00+08'),
(2, 10, 'The latest patch fixed most issues', 'en_US', '2024-12-02 16:00:00+08'),

-- 艾尔登法环评论的回复
(4, 11, '确实，探索要素做得很棒，地图设计很精妙', 'zh_CN', '2024-12-05 10:00:00+08'),
(5, 12, 'Try using magic build, it makes the game easier!', 'en_US', '2024-12-06 15:00:00+08'),

-- 2025年1月的回复
-- 博德之门3评论的回复
(6, 13, '剧情分支太多了，每周目都能发现新内容', 'zh_CN', '2025-01-01 12:00:00+08'),
(7, 14, 'The voice acting and writing are amazing', 'en_US', '2025-01-02 17:00:00+08');

-- 3. 验证数据
-- 3.1 检查评论数据和回复数量
SELECT 
    g.game_name,
    r.rating,
    r.content as review_content,
    r.platform,
    r.language,
    r.created_at,
    COUNT(rp.*) as reply_count,
    STRING_AGG(rp.content, ' | ') as replies
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
LEFT JOIN review_system.review_replies_partitioned rp ON r.review_id = rp.review_id
GROUP BY g.game_name, r.review_id, r.rating, r.content, r.platform, r.language, r.created_at
ORDER BY r.created_at;

-- 3.2 检查游戏评分汇总
SELECT 
    g.game_name,
    s.total_reviews,
    ROUND(s.average_rating::numeric, 2) as avg_rating,
    s.total_playtime_hours,
    s.pc_count,
    s.ps5_count,
    s.xbox_count,
    s.recommended_count,
    s.last_updated
FROM review_system.review_summary_partitioned s
JOIN games g ON s.game_id = g.game_id
ORDER BY s.last_updated DESC;

-- 3.3 检查语言分布
SELECT 
    g.game_name,
    COUNT(*) FILTER (WHERE r.language = 'zh_CN') as chinese_reviews,
    COUNT(*) FILTER (WHERE r.language = 'en_US') as english_reviews,
    COUNT(*) FILTER (WHERE r.language = 'ja_JP') as japanese_reviews
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
GROUP BY g.game_id, g.game_name
ORDER BY g.game_id;

-- 3.4 检查平台分布
SELECT 
    g.game_name,
    COUNT(*) FILTER (WHERE r.platform = 'PC') as pc_reviews,
    COUNT(*) FILTER (WHERE r.platform = 'PS5') as ps5_reviews,
    COUNT(*) FILTER (WHERE r.platform = 'XBOX') as xbox_reviews,
    ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
    ROUND(AVG(r.playtime_hours)::numeric, 2) as avg_playtime
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
GROUP BY g.game_id, g.game_name
ORDER BY g.game_id;