-- 1. 测试评论插入
INSERT INTO review_system.reviews_partitioned (
    game_id,
    user_id,
    rating,
    content,
    playtime_hours,
    is_recommended,
    platform,
    language,
    created_at
) VALUES 
(1001, 1, 4.5, '非常好玩的游戏！', 10, true, 'PC', 'zh-CN', CURRENT_TIMESTAMP),
(1001, 2, 4.0, 'Great game!', 15, true, 'PS5', 'en-US', CURRENT_TIMESTAMP),
(1001, 3, 3.5, 'Buen juego', 8, true, 'XBOX', 'es-ES', CURRENT_TIMESTAMP);

-- 2. 测试评论回复
INSERT INTO review_system.review_replies_partitioned (
    review_id,
    user_id,
    content,
    language,
    created_at
) VALUES 
(1, 4, '同意你的观点！', 'zh-CN', CURRENT_TIMESTAMP),
(1, 5, 'Thanks for sharing', 'en-US', CURRENT_TIMESTAMP);

-- 3. 检查分区是否自动创建
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'review_system' 
ORDER BY tablename;

-- 4. 检查汇总数据是否正确更新
SELECT 
    game_id,
    total_reviews,
    average_rating,
    total_playtime_hours,
    pc_count,
    ps5_count,
    xbox_count,
    en_us_count,
    zh_cn_count,
    es_es_count,
    positive_rate,
    avg_playtime_hours
FROM review_system.review_summary_partitioned
WHERE game_id = 1001;

-- 5. 测试评论更新
UPDATE review_system.reviews_partitioned
SET rating = 5.0,
    content = '更新后的评论：非常棒！'
WHERE game_id = 1001 AND user_id = 1;

-- 6. 再次检查汇总数据
SELECT 
    game_id,
    total_reviews,
    average_rating,
    positive_rate
FROM review_system.review_summary_partitioned
WHERE game_id = 1001;

-- 7. 测试删除评论
UPDATE review_system.reviews_partitioned
SET deleted_at = CURRENT_TIMESTAMP
WHERE game_id = 1001 AND user_id = 1;

-- 8. 检查删除后的汇总数据
SELECT 
    game_id,
    total_reviews,
    average_rating,
    positive_rate
FROM review_system.review_summary_partitioned
WHERE game_id = 1001;

-- 9. 检查审计日志
SELECT 
    operation,
    table_name,
    old_data,
    new_data,
    changed_at
FROM review_system.review_audit_log
ORDER BY changed_at DESC
LIMIT 5;

-- 10. 测试不同月份的分区创建
INSERT INTO review_system.reviews_partitioned (
    game_id,
    user_id,
    rating,
    content,
    playtime_hours,
    is_recommended,
    platform,
    language,
    created_at
) VALUES 
(1001, 6, 4.8, '明年的评论', 20, true, 'PC', 'zh-CN', '2025-01-01 10:00:00+08');

-- 11. 检查是否创建了新的月份分区
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'review_system' 
  AND tablename LIKE '%y2025%'
ORDER BY tablename; 