-- 1. 查看所有分区
SELECT tablename, 
       pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables 
WHERE schemaname = 'review_system' 
AND tablename LIKE 'reviews_y%'
ORDER BY tablename;

-- 2. 查看最新评论数据
SELECT review_id,
       game_id,
       user_id,
       rating,
       content,
       playtime_hours,
       platform,
       language,
       created_at,
       review_status
FROM review_system.reviews_partitioned
ORDER BY created_at DESC
LIMIT 20;

-- 3. 查看评论汇总数据
SELECT game_id,
       total_reviews,
       average_rating,
       total_playtime_hours,
       pc_count,
       ps5_count,
       xbox_count,
       last_updated
FROM review_system.review_summary_partitioned
ORDER BY last_updated DESC
LIMIT 10;

-- 4. 按游戏ID统计评论
SELECT game_id,
       COUNT(*) as review_count,
       AVG(rating) as avg_rating,
       SUM(playtime_hours) as total_playtime
FROM review_system.reviews_partitioned
GROUP BY game_id
ORDER BY review_count DESC
LIMIT 10;

-- 5. 查看平台分布
SELECT platform,
       COUNT(*) as count,
       AVG(rating) as avg_rating
FROM review_system.reviews_partitioned
WHERE platform IS NOT NULL
GROUP BY platform
ORDER BY count DESC;

-- 6. 查看语言分布
SELECT language,
       COUNT(*) as count
FROM review_system.reviews_partitioned
WHERE language IS NOT NULL
GROUP BY language
ORDER BY count DESC;

-- 7. 查看并发测试数据
SELECT COUNT(*) as total_concurrent_reviews,
       MIN(created_at) as earliest_review,
       MAX(created_at) as latest_review,
       AVG(rating) as avg_rating
FROM review_system.reviews_partitioned
WHERE content LIKE '并发测试评论%';

-- 8. 查看备份历史
SELECT backup_id,
       backup_type,
       backup_status,
       file_path,
       start_time,
       end_time
FROM review_system.backup_history
ORDER BY start_time DESC;

-- 9. 检查分区状态
SELECT t.schemaname || '.' || t.tablename as partition_name,
       pg_size_pretty(pg_relation_size(t.schemaname || '.' || t.tablename)) as size,
       s.n_live_tup as live_tuples,
       s.n_dead_tup as dead_tuples,
       s.last_vacuum,
       s.last_analyze
FROM pg_stat_user_tables s
JOIN pg_tables t ON s.relname = t.tablename AND s.schemaname = t.schemaname
WHERE t.schemaname = 'review_system'
AND t.tablename LIKE 'reviews_y%'
ORDER BY t.tablename DESC;

-- 10. 查看评分分布
SELECT ROUND(rating) as rating_rounded,
       COUNT(*) as count,
       COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM review_system.reviews_partitioned
GROUP BY ROUND(rating)
ORDER BY rating_rounded;

-- 11. 查看每小时评论数量趋势
SELECT DATE_TRUNC('hour', created_at) as hour,
       COUNT(*) as review_count
FROM review_system.reviews_partitioned
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- 12. 查看测试用户的评论
SELECT user_id,
       COUNT(*) as review_count,
       AVG(rating) as avg_rating,
       MIN(created_at) as first_review,
       MAX(created_at) as last_review
FROM review_system.reviews_partitioned
WHERE user_id IN (1, 2, 3)  -- 测试用户ID
GROUP BY user_id
ORDER BY user_id;