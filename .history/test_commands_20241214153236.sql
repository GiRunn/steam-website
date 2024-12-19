-- 1. 插入一些测试评论数据
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language) 
VALUES 
(1001, 101, 4.5, '这游戏太棒了！画面精美，玩法有趣。', 25, true, 'PC', 'zh-CN'),
(1001, 102, 3.8, 'Good game but needs some improvements', 15, true, 'PS5', 'en-US'),
(1001, 103, 2.5, 'メカニックは面白いですが、バグが多すぎます', 8, false, 'PC', 'ja-JP');

-- 2. 添加一些评论回复
INSERT INTO review_system.review_replies_partitioned 
(review_id, user_id, content, language) 
VALUES 
(1, 201, '完全同意你的观点！', 'zh-CN'),
(1, 202, '确实，我也很喜欢这个游戏', 'zh-CN'),
(2, 203, 'What improvements would you suggest?', 'en-US');

-- 3. 查看游戏的评论统计
SELECT 
    game_id,
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    ROUND(positive_rate, 2) as positive_percentage,
    pc_count,
    ps5_count,
    xbox_count,
    total_playtime_hours,
    ROUND(avg_playtime_hours, 2) as avg_playtime
FROM review_system.review_summary_partitioned
WHERE game_id = 1001
ORDER BY last_updated DESC
LIMIT 1;

-- 4. 按语言查看评论分布
SELECT 
    language,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM(playtime_hours) as total_playtime
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
GROUP BY language
ORDER BY review_count DESC;

-- 5. 测试软删除功能
UPDATE review_system.reviews_partitioned
SET deleted_at = CURRENT_TIMESTAMP,
    review_status = 'deleted'
WHERE review_id = 1;

-- 6. 查看分区情况
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'review_system'
ORDER BY tablename;

-- 7. 测试审计日志
SELECT 
    operation,
    table_name,
    record_id,
    old_data,
    new_data,
    changed_at
FROM review_system.review_audit_log
ORDER BY changed_at DESC
LIMIT 5;

-- 8. 查看某个游戏的评论趋势
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(DISTINCT user_id) as unique_users
FROM review_system.reviews_partitioned
WHERE game_id = 1001
    AND deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 9. 测试评论更新功能
UPDATE review_system.reviews_partitioned
SET rating = 4.0,
    content = '更新后的评论内容',
    updated_at = CURRENT_TIMESTAMP
WHERE review_id = 2;

-- 10. 性能测试：使用索引查询
EXPLAIN ANALYZE
SELECT r.*, rr.content as reply_content
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.game_id = 1001
    AND r.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND r.deleted_at IS NULL
ORDER BY r.created_at DESC; 