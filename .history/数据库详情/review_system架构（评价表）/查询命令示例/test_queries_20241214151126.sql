-- 1. 查看所有已创建的分区表
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'review_system' 
ORDER BY tablename;

-- 2. 查看某个游戏的所有评论
SELECT 
    r.review_id,
    r.game_id,
    r.user_id,
    r.rating,
    r.content,
    r.playtime_hours,
    r.likes_count,
    r.platform,
    r.language,
    r.created_at,
    r.is_recommended
FROM review_system.reviews_partitioned r
WHERE r.game_id = 1001
    AND r.deleted_at IS NULL
    AND r.review_status = 'active'
ORDER BY r.created_at DESC;

-- 3. 查看某个评论的所有回复
SELECT 
    rr.reply_id,
    rr.review_id,
    rr.user_id,
    rr.content,
    rr.likes_count,
    rr.language,
    rr.created_at
FROM review_system.review_replies_partitioned rr
WHERE rr.review_id = 1
    AND rr.deleted_at IS NULL
    AND rr.reply_status = 'active'
ORDER BY rr.created_at;

-- 4. 查看游戏评论汇总数据
SELECT 
    s.game_id,
    s.total_reviews,
    ROUND(s.average_rating, 2) as avg_rating,
    s.total_playtime_hours,
    ROUND(s.avg_playtime_hours, 2) as avg_playtime,
    ROUND(s.positive_rate, 2) as positive_rate,
    s.pc_count,
    s.ps5_count,
    s.xbox_count,
    s.total_likes,
    s.total_replies,
    s.last_updated
FROM review_system.review_summary_partitioned s
WHERE s.game_id = 1001
ORDER BY s.last_updated DESC
LIMIT 1;

-- 5. 按语言统计评论分布
SELECT 
    language,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM(playtime_hours) as total_playtime
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
    AND review_status = 'active'
GROUP BY language
ORDER BY review_count DESC;

-- 6. 按平台统计评论分布
SELECT 
    platform,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    ROUND(AVG(playtime_hours), 2) as avg_playtime
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
    AND review_status = 'active'
GROUP BY platform
ORDER BY review_count DESC;

-- 7. 查看最近的审计日志
SELECT 
    log_id,
    operation,
    table_name,
    record_id,
    old_data,
    new_data,
    changed_at
FROM review_system.review_audit_log
ORDER BY changed_at DESC
LIMIT 10;

-- 8. 查看分区表的索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'review_system'
ORDER BY idx_scan DESC;

-- 9. 按月份统计评论数量趋势
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(DISTINCT user_id) as unique_users
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
    AND review_status = 'active'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 10. 查看高评分游戏（平均评分>=4.0）
SELECT 
    s.game_id,
    s.total_reviews,
    ROUND(s.average_rating, 2) as avg_rating,
    ROUND(s.positive_rate, 2) as positive_rate,
    s.total_playtime_hours,
    ROUND(s.avg_playtime_hours, 2) as avg_playtime
FROM review_system.review_summary_partitioned s
WHERE s.average_rating >= 4.0
    AND s.total_reviews >= 3  -- 至少3条评论
ORDER BY s.average_rating DESC, s.total_reviews DESC;

-- 11. 检查分区键范围
SELECT 
    c.relname as partition_name,
    pg_get_expr(c.relpartbound, c.oid) as partition_range
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'review_system'
    AND c.relispartition
ORDER BY c.relname;

-- 12. 性能测试：查找特定时间范围的评论
EXPLAIN ANALYZE
SELECT *
FROM review_system.reviews_partitioned
WHERE created_at BETWEEN '2024-12-01' AND '2024-12-31'
    AND deleted_at IS NULL
    AND review_status = 'active';