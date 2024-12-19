-- 1. 插入评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language) 
VALUES
-- 2Take1游戏的评论
(1001, 1, 4.8, '最强辅助，功能齐全，防护给力！', 100, true, 'PC', 'zh-CN'),
(1001, 2, 4.9, 'Best menu ever! Great protection.', 150, true, 'PC', 'en-US'),
(1001, 3, 4.7, '非常好用的菜单，值得推荐', 80, true, 'PC', 'zh-CN'),

-- Stand游戏的评论
(1002, 1, 4.5, '稳定性很好，性价比高', 90, true, 'PC', 'zh-CN'),
(1002, 4, 4.6, 'Very stable menu, good price!', 120, true, 'PC', 'en-GB'),

-- Frontier游戏的评论
(1003, 5, 4.8, '素晴らしいメニュー！', 200, true, 'PC', 'ja-JP');

-- 2. 插入评论回复
INSERT INTO review_system.review_replies_partitioned 
(review_id, user_id, content, language) 
VALUES
(1, 4, '同意，确实是最强的', 'zh-CN'),
(1, 5, '防护确实没得说', 'zh-CN'),
(2, 3, 'Totally agree!', 'en-US'),
(4, 2, '性价比确实不错', 'zh-CN');

-- 3. 验证数据
-- 检查评论数据
SELECT 
    r.review_id,
    g.title as game_name,
    u.username as reviewer,
    r.rating,
    r.content,
    r.platform,
    r.language,
    r.created_at
FROM review_system.reviews_partitioned r
JOIN games g ON r.game_id = g.game_id
JOIN user_system.users u ON r.user_id = u.user_id
ORDER BY r.created_at;

-- 检查回复数据
SELECT 
    rr.reply_id,
    r.content as review_content,
    u.username as replier,
    rr.content as reply_content,
    rr.created_at
FROM review_system.review_replies_partitioned rr
JOIN review_system.reviews_partitioned r ON rr.review_id = r.review_id
JOIN user_system.users u ON rr.user_id = u.user_id
ORDER BY rr.created_at;

-- 检查汇总数据
SELECT 
    g.title as game_name,
    s.total_reviews,
    s.average_rating,
    s.total_replies,
    s.pc_count,
    s.zh_cn_count,
    s.en_us_count,
    s.ja_jp_count,
    s.last_updated
FROM review_system.review_summary_partitioned s
JOIN games g ON s.game_id = g.game_id
ORDER BY s.last_updated;

-- 检查分区情况
SELECT 
    parent.relname AS parent_table,
    child.relname AS partition_name,
    pg_get_expr(child.relpartbound, child.oid) AS partition_expression
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
JOIN pg_namespace n ON parent.relnamespace = n.oid
WHERE n.nspname = 'review_system'; 