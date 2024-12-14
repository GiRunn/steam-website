-- 1. 插入游戏数据（如果还没有）
INSERT INTO games (game_id, game_name, description, release_date, price) 
VALUES 
(1001, '赛博朋克2077', '一款开放世界动作冒险RPG游戏，故事发生在夜之城', '2020-12-10', 298),
(1002, '艾尔登法环', '一款由宫崎英高指导的开放世界动作RPG', '2022-02-25', 298),
(1003, '博德之门3', '经典CRPG系列最新作品，基于DnD规则的RPG游戏', '2023-08-03', 298);

-- 2. 测试自动分区和汇总功能
-- 2.1 插入评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language, created_at) 
VALUES
-- 2024年12月的评论
(1001, 1, 4.5, '画面非常震撼，剧情也很棒！', 120, true, 'PC', 'zh_CN', '2024-12-01 10:00:00+08'),
(1002, 2, 4.0, 'Challenging but fun!', 80, true, 'PS5', 'en_US', '2024-12-15 15:30:00+08'),

-- 2025年1月的评论（测试自动创建新分区）
(1003, 3, 5.0, '最棒的CRPG!', 150, true, 'PC', 'zh_CN', '2025-01-01 00:00:01+08');

-- 2.2 插入回复数据
INSERT INTO review_system.review_replies_partitioned
(review_id, user_id, content, language, created_at)
VALUES
-- 2024年12月的回复
(1, 4, '完全同意！', 'zh_CN', '2024-12-01 10:30:00+08'),
(2, 5, 'Try using magic!', 'en_US', '2024-12-15 16:00:00+08'),

-- 2025年1月的回复（测试自动创建新分区）
(3, 6, '确实很棒！', 'zh_CN', '2025-01-01 00:30:00+08');

-- 3. 验证测试结果
-- 3.1 检查分区创建情况
SELECT 
    parent.relname as parent_table,
    child.relname as partition_name,
    pg_get_expr(child.relpartbound, child.oid) as partition_range
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

-- 3.2 检查评论数据
SELECT 
    g.game_name,
    r.rating,
    r.content,
    r.platform,
    r.language,
    r.created_at,
    COUNT(rp.*) as reply_count
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
LEFT JOIN review_system.review_replies_partitioned rp ON r.review_id = rp.review_id
GROUP BY g.game_name, r.review_id, r.rating, r.content, r.platform, r.language, r.created_at
ORDER BY r.created_at;

-- 3.3 检查汇总数据
SELECT 
    g.game_name,
    s.total_reviews,
    s.average_rating,
    s.total_playtime_hours,
    s.pc_count,
    s.ps5_count,
    s.recommended_count,
    s.last_updated
FROM review_system.review_summary_partitioned s
JOIN games g ON s.game_id = g.game_id
ORDER BY s.last_updated;

-- 3.4 检查审计日志
SELECT 
    operation,
    table_name,
    record_id,
    changed_at,
    old_data,
    new_data
FROM review_system.review_audit_log
ORDER BY changed_at; 