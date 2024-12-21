-- 查看所有分区
SELECT tablename, pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables 
WHERE schemaname = 'review_system' 
AND tablename LIKE 'reviews_y%'
ORDER BY tablename;

-- 查看评论数据
SELECT 
    review_id,
    game_id,
    user_id,
    rating,
    content,
    playtime_hours,
    platform,
    language,
    created_at
FROM review_system.reviews_partitioned
ORDER BY created_at DESC
LIMIT 10;

-- 查看汇总数据
SELECT 
    game_id,
    total_reviews,
    average_rating,
    total_playtime_hours,
    pc_count,
    ps5_count,
    xbox_count,
    last_updated
FROM review_system.review_summary_partitioned
ORDER BY last_updated DESC
LIMIT 5;

-- 查看测试插入的评论
SELECT * FROM review_system.reviews_partitioned
WHERE content LIKE '%测试评论%'
OR content LIKE '%并发测试%';

-- 查看分区统计信息
SELECT 
    schemaname || '.' || tablename as partition_name,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as size,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_analyze
FROM pg_stat_user_tables s
JOIN pg_tables t ON s.relname = t.tablename AND s.schemaname = t.schemaname
WHERE t.schemaname = 'review_system'
AND t.tablename LIKE 'reviews_y%'
ORDER BY t.tablename DESC;