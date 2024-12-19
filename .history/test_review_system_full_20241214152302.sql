-- 1. 创建下个月的分区（针对所有分区表）
DO $$
DECLARE
    next_month timestamp with time zone := date_trunc('month', CURRENT_TIMESTAMP + interval '1 month');
    partition_start timestamp with time zone;
    partition_end timestamp with time zone;
BEGIN
    -- 计算分区范围
    partition_start := next_month;
    partition_end := partition_start + interval '1 month';
    
    -- 创建评论表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.reviews_y%sm%s PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(next_month, 'YYYY'),
        to_char(next_month, 'MM'),
        partition_start,
        partition_end
    );
    
    -- 创建回复表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.replies_y%sm%s PARTITION OF review_system.review_replies_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(next_month, 'YYYY'),
        to_char(next_month, 'MM'),
        partition_start,
        partition_end
    );
    
    -- 创建汇总表分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.summary_y%sm%s PARTITION OF review_system.review_summary_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        to_char(next_month, 'YYYY'),
        to_char(next_month, 'MM'),
        partition_start,
        partition_end
    );
    
    RAISE NOTICE 'Created partitions for %', to_char(next_month, 'YYYY-MM');
END $$;

-- 2. 测试当前月份评论插入
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
-- 中文评论
(1001, 1, 4.5, '非常好玩的游戏！画面精美，剧情丰富。', 10, true, 'PC', 'zh-CN', CURRENT_TIMESTAMP),
(1001, 2, 4.0, '游戏体验不错，但优化还需要改进。', 15, true, 'PS5', 'zh-CN', CURRENT_TIMESTAMP),
-- 英文评论
(1001, 3, 3.5, 'Great game but needs some improvements.', 8, true, 'XBOX', 'en-US', CURRENT_TIMESTAMP),
(1001, 4, 5.0, 'One of the best games I have ever played!', 20, true, 'PC', 'en-GB', CURRENT_TIMESTAMP),
-- 日文评论
(1001, 5, 4.8, 'とても面白いゲームです！', 12, true, 'PS5', 'ja-JP', CURRENT_TIMESTAMP);

-- 3. 测试下个月评论插入（测试自动创建分区）
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
(1001, 6, 4.2, 'Next month review test', 25, true, 'PC', 'en-US', CURRENT_TIMESTAMP + interval '1 month');

-- 4. 测试评论回复
INSERT INTO review_system.review_replies_partitioned (
    review_id,
    user_id,
    content,
    language,
    created_at
) VALUES 
-- 当前月份回复
(1, 7, '完全同意你的观点！', 'zh-CN', CURRENT_TIMESTAMP),
(1, 8, 'Thanks for sharing!', 'en-US', CURRENT_TIMESTAMP),
-- 下个月回复
(1, 9, 'Next month reply test', 'en-US', CURRENT_TIMESTAMP + interval '1 month');

-- 5. 测试评论更新
UPDATE review_system.reviews_partitioned
SET rating = 5.0,
    content = '更新后的评论：非常棒！游戏体验极佳！',
    updated_at = CURRENT_TIMESTAMP
WHERE game_id = 1001 AND user_id = 1;

-- 6. 测试评论删除（软删除）
UPDATE review_system.reviews_partitioned
SET deleted_at = CURRENT_TIMESTAMP,
    review_status = 'deleted'
WHERE game_id = 1001 AND user_id = 2;

-- 7. 测试不同游戏的评论
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
(1002, 10, 4.0, 'Another game review', 5, true, 'PC', 'en-US', CURRENT_TIMESTAMP),
(1003, 11, 3.5, '另一个游戏的评论', 8, false, 'PS5', 'zh-CN', CURRENT_TIMESTAMP);

-- 8. 测试查询
-- 检查分区创建情况
SELECT 
    schemaname, 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables 
WHERE schemaname = 'review_system' 
ORDER BY tablename;

-- 检查评论统计
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
    s.en_us_count,
    s.zh_cn_count,
    s.ja_jp_count
FROM review_system.review_summary_partitioned s
WHERE s.game_id IN (1001, 1002, 1003)
ORDER BY s.game_id, s.last_updated DESC;

-- 检查语言分布
SELECT 
    language,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
GROUP BY language
ORDER BY review_count DESC;

-- 检查平台分布
SELECT 
    platform,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL
GROUP BY platform
ORDER BY review_count DESC;

-- 检查回复数量
SELECT 
    r.review_id,
    r.content as review_content,
    COUNT(rr.reply_id) as reply_count
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.deleted_at IS NULL
GROUP BY r.review_id, r.content
ORDER BY reply_count DESC;

-- 检查审计日志
SELECT 
    operation,
    table_name,
    record_id,
    changed_at
FROM review_system.review_audit_log
ORDER BY changed_at DESC
LIMIT 10;

-- 9. 测试分区范围查询
EXPLAIN ANALYZE
SELECT *
FROM review_system.reviews_partitioned
WHERE created_at BETWEEN 
    date_trunc('month', CURRENT_TIMESTAMP) 
    AND date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'
AND deleted_at IS NULL;

-- 10. 测试汇总数据一致性
WITH ReviewStats AS (
    SELECT 
        game_id,
        COUNT(*) as actual_total_reviews,
        AVG(rating) as actual_avg_rating,
        SUM(playtime_hours) as actual_total_playtime
    FROM review_system.reviews_partitioned
    WHERE deleted_at IS NULL
    GROUP BY game_id
)
SELECT 
    r.game_id,
    r.actual_total_reviews,
    s.total_reviews as summary_total_reviews,
    ROUND(r.actual_avg_rating, 2) as actual_avg_rating,
    ROUND(s.average_rating, 2) as summary_avg_rating,
    r.actual_total_playtime,
    s.total_playtime_hours as summary_total_playtime
FROM ReviewStats r
JOIN review_system.review_summary_partitioned s ON r.game_id = s.game_id
WHERE s.last_updated = (
    SELECT MAX(last_updated)
    FROM review_system.review_summary_partitioned s2
    WHERE s2.game_id = s.game_id
); 