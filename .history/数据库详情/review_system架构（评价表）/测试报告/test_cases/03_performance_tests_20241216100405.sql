-- 性能测试用例
-- 1. 批量插入测试
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..10000 LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES (
            1001 + (i % 10), -- 10个不同的游戏
            i, 
            3.5 + random() * 1.5,
            'Performance test review #' || i,
            floor(random() * 100)::integer,
            CASE floor(random() * 3)::integer 
                WHEN 0 THEN 'PC' 
                WHEN 1 THEN 'PS5' 
                ELSE 'XBOX' 
            END,
            CASE floor(random() * 3)::integer 
                WHEN 0 THEN 'en-US' 
                WHEN 1 THEN 'zh-CN' 
                ELSE 'ja-JP' 
            END,
            random() > 0.5
        );
    END LOOP;
END $$;

-- 2. 查询性能测试
EXPLAIN ANALYZE
SELECT 
    r.game_id,
    COUNT(*) as review_count,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT r.platform) as platform_count,
    COUNT(DISTINCT r.language) as language_count
FROM review_system.reviews_partitioned r
WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY r.game_id
ORDER BY review_count DESC; 