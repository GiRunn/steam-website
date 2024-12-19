/******************************************
 * 游戏评论系统综合测试方案 v1.0
 * 测试目标：验证评论系统的完整功能、性能和数据一致性
 ******************************************/

-- 测试准备
--------------------------
-- 检查环境
DO $$ 
BEGIN
    -- 检查schema
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.schemata 
        WHERE schema_name = 'review_system'
    ) THEN
        RAISE EXCEPTION 'Schema review_system does not exist';
    END IF;
    
    -- 检查必要的表
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'review_system'
        AND table_name IN ('reviews_partitioned', 'review_replies_partitioned', 'review_summary_partitioned')
    ) THEN
        RAISE EXCEPTION 'Required tables do not exist';
    END IF;
END
$$;

-- 清理测试数据
BEGIN;
    DELETE FROM review_system.reviews_partitioned 
    WHERE game_id IN (1001, 1002);
    
    DELETE FROM review_system.review_replies_partitioned 
    WHERE review_id IN (
        SELECT review_id 
        FROM review_system.reviews_partitioned 
        WHERE game_id IN (1001, 1002)
    );
COMMIT;

-- 第一部分：基础数据准备
--------------------------

-- 1.1 插入基础测试数据
BEGIN;
    INSERT INTO review_system.reviews_partitioned 
    (game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language) 
    VALUES 
    -- 游戏1的评论
    (1001, 101, 4.5, '这游戏太棒了！画面精美，玩法有趣。', 25, true, 'PC', 'zh-CN'),
    (1001, 102, 3.8, 'Good game but needs improvements', 15, true, 'PS5', 'en-US'),
    (1001, 103, 2.5, 'メカニックは面白いですが、バグが多すぎます', 8, false, 'PC', 'ja-JP'),
    -- 游戏2的评论
    (1002, 104, 5.0, 'Best game ever!', 100, true, 'PC', 'en-US'),
    (1002, 105, 1.0, '太差劲了，完全不推荐', 2, false, 'XBOX', 'zh-CN');

    -- 验证插入结果
    SELECT COUNT(*) as inserted_reviews
    FROM review_system.reviews_partitioned
    WHERE game_id IN (1001, 1002);
COMMIT;

-- 第二部分：功能测试
--------------------------

-- 2.1 测试评论分区功能
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'review_system'
AND tablename ~ '^reviews_y\d{4}m\d{2}$'
ORDER BY tablename;

-- 2.2 测试评论统计功能
SELECT 
    game_id,
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    ROUND(positive_rate, 2) as positive_percentage,
    pc_count,
    ps5_count,
    xbox_count
FROM review_system.review_summary_partitioned
WHERE game_id IN (1001, 1002)
ORDER BY game_id;

-- 2.3 测试评论回复功能
BEGIN;
    INSERT INTO review_system.review_replies_partitioned 
    (review_id, user_id, content, language) 
    VALUES 
    (
        (SELECT review_id FROM review_system.reviews_partitioned WHERE game_id = 1001 LIMIT 1),
        201, 
        '完全同意你的观点！', 
        'zh-CN'
    );

    -- 验证回复数据
    SELECT 
        r.review_id,
        r.content as review_content,
        rr.content as reply_content
    FROM review_system.reviews_partitioned r
    JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
    WHERE r.game_id = 1001;
COMMIT;

-- 第三部分：性能测试
--------------------------

-- 3.1 测试索引使用情况
EXPLAIN (ANALYZE, BUFFERS)
SELECT r.*, rr.content as reply_content
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.game_id = 1001
    AND r.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;

-- 3.2 测试分区裁剪效果
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*)
FROM review_system.reviews_partitioned
WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'
AND created_at < CURRENT_DATE;

-- 第四部分：数据一致性测试
--------------------------

-- 4.1 测试触发器更新
BEGIN;
    UPDATE review_system.reviews_partitioned
    SET rating = 5.0
    WHERE game_id = 1001 AND user_id = 101;

    -- 验证汇总数据是否正确更新
    SELECT 
        game_id,
        total_reviews,
        ROUND(average_rating, 2) as avg_rating,
        ROUND(positive_rate, 2) as positive_rate
    FROM review_system.review_summary_partitioned
    WHERE game_id = 1001;
COMMIT;

-- 4.2 测试审计日志
SELECT 
    operation,
    table_name,
    record_id,
    old_data->>'rating' as old_rating,
    new_data->>'rating' as new_rating,
    changed_at
FROM review_system.review_audit_log
WHERE table_name = 'reviews_partitioned'
ORDER BY changed_at DESC
LIMIT 5;

-- 第五部分：清理测试数据
--------------------------
BEGIN;
    -- 清理测试数据
    DELETE FROM review_system.reviews_partitioned 
    WHERE game_id IN (1001, 1002);

    -- 验证清理结果
    SELECT COUNT(*) as remaining_reviews
    FROM review_system.reviews_partitioned
    WHERE game_id IN (1001, 1002);
COMMIT; 