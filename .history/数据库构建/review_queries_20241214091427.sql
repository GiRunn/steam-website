-- 1. 基础查询：获取游戏1001的所有评价
SELECT 
    r.review_id,
    r.user_id,
    u.username,
    u.nickname,
    r.rating,
    r.content,
    r.playtime_hours,
    r.likes_count,
    r.platform,
    r.language,
    r.created_at,
    r.is_recommended,
    COUNT(rr.reply_id) as reply_count
FROM review_system.reviews_partitioned r
LEFT JOIN user_system.users u ON r.user_id = u.user_id
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.game_id = 1001
    AND r.review_status = 'active'
    AND r.deleted_at IS NULL
GROUP BY 
    r.review_id,
    r.user_id,
    u.username,
    u.nickname,
    r.rating,
    r.content,
    r.playtime_hours,
    r.likes_count,
    r.platform,
    r.language,
    r.created_at,
    r.is_recommended
ORDER BY r.created_at DESC;

-- 2. 带回复的详细查询：获取游戏1001的所有评价及其回复
WITH review_data AS (
    SELECT 
        r.review_id,
        r.user_id,
        u.username as reviewer_name,
        u.nickname as reviewer_nickname,
        r.rating,
        r.content as review_content,
        r.playtime_hours,
        r.likes_count as review_likes,
        r.platform,
        r.language,
        r.created_at as review_time,
        r.is_recommended
    FROM review_system.reviews_partitioned r
    LEFT JOIN user_system.users u ON r.user_id = u.user_id
    WHERE r.game_id = 1001
        AND r.review_status = 'active'
        AND r.deleted_at IS NULL
),
reply_data AS (
    SELECT 
        rr.review_id,
        rr.reply_id,
        rr.user_id as replier_id,
        u.username as replier_name,
        u.nickname as replier_nickname,
        rr.content as reply_content,
        rr.likes_count as reply_likes,
        rr.created_at as reply_time,
        rr.parent_id
    FROM review_system.review_replies_partitioned rr
    LEFT JOIN user_system.users u ON rr.user_id = u.user_id
    WHERE rr.reply_status = 'active'
    AND rr.deleted_at IS NULL
)
SELECT 
    rd.*,
    json_agg(
        json_build_object(
            'reply_id', rp.reply_id,
            'replier_name', rp.replier_name,
            'replier_nickname', rp.replier_nickname,
            'content', rp.reply_content,
            'likes', rp.reply_likes,
            'reply_time', rp.reply_time,
            'parent_id', rp.parent_id
        ) ORDER BY rp.reply_time
    ) FILTER (WHERE rp.reply_id IS NOT NULL) as replies
FROM review_data rd
LEFT JOIN reply_data rp ON rd.review_id = rp.review_id
GROUP BY 
    rd.review_id,
    rd.user_id,
    rd.reviewer_name,
    rd.reviewer_nickname,
    rd.rating,
    rd.review_content,
    rd.playtime_hours,
    rd.review_likes,
    rd.platform,
    rd.language,
    rd.review_time,
    rd.is_recommended
ORDER BY rd.review_time DESC;

-- 3. 获取游戏1001的评价统计信息
SELECT 
    rs.*,
    g.title as game_title
FROM review_system.review_summary_partitioned rs
JOIN public.games g ON rs.game_id = g.game_id
WHERE rs.game_id = 1001
ORDER BY rs.last_updated DESC
LIMIT 1;

-- 4. 按时间段查询评价
SELECT 
    r.review_id,
    r.rating,
    r.content,
    r.created_at,
    u.username,
    u.nickname
FROM review_system.reviews_partitioned r
JOIN user_system.users u ON r.user_id = u.user_id
WHERE r.game_id = 1001
    AND r.review_status = 'active'
    AND r.deleted_at IS NULL
    AND r.created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY r.created_at DESC;

-- 5. 按评分区间统计
SELECT 
    CASE 
        WHEN rating >= 4.5 THEN '极好评 (4.5-5.0)'
        WHEN rating >= 4.0 THEN '好评 (4.0-4.4)'
        WHEN rating >= 3.0 THEN '中评 (3.0-3.9)'
        ELSE '差评 (0-2.9)'
    END as rating_range,
    COUNT(*) as review_count,
    ROUND(AVG(playtime_hours), 2) as avg_playtime,
    ROUND(AVG(likes_count), 2) as avg_likes
FROM review_system.reviews_partitioned
WHERE game_id = 1001
    AND review_status = 'active'
    AND deleted_at IS NULL
GROUP BY 
    CASE 
        WHEN rating >= 4.5 THEN '极好评 (4.5-5.0)'
        WHEN rating >= 4.0 THEN '好评 (4.0-4.4)'
        WHEN rating >= 3.0 THEN '中评 (3.0-3.9)'
        ELSE '差评 (0-2.9)'
    END
ORDER BY 
    CASE rating_range
        WHEN '极好评 (4.5-5.0)' THEN 1
        WHEN '好评 (4.0-4.4)' THEN 2
        WHEN '中评 (3.0-3.9)' THEN 3
        ELSE 4
    END; 