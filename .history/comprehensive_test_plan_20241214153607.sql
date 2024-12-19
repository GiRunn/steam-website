/******************************************
 * 游戏评论系统综合测试方案 v1.0
 * 测试目标：验证评论系统的完整功能、性能和数据一致性
 ******************************************/

-- 第一部分：基础数据准备
--------------------------

-- 1.1 清理测试数据
DROP SCHEMA IF EXISTS review_system CASCADE;

-- 1.2 按顺序执行建表脚本
-- (按照生成顺序.md中的顺序执行)

-- 1.3 插入基础测试数据
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

/* 预期结果：
- 应成功插入5条评论
- 触发器应自动创建对应月份的分区
- 触发器应自动更新汇总数据
*/

-- 第二部分：功能测试
--------------------------

-- 2.1 测试评论分区功能
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'review_system'
ORDER BY tablename;

/* 预期结果：
- 应显示所有创建的分区表
- 应包含当前月份的reviews_y2024m01等分区
- 每个分区大小应正确显示
*/

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

/* 预期结果：
游戏1001:
- total_reviews: 3
- avg_rating: 3.60
- positive_rate: 72.00
- pc_count: 2
- ps5_count: 1
- xbox_count: 0

游戏1002:
- total_reviews: 2
- avg_rating: 3.00
- positive_rate: 60.00
- pc_count: 1
- ps5_count: 0
- xbox_count: 1
*/

-- 2.3 测试评论回复功能
INSERT INTO review_system.review_replies_partitioned 
(review_id, user_id, content, language) 
VALUES 
(1, 201, '完全同意你的观点！', 'zh-CN'),
(1, 202, '确实，我也很喜欢这个游戏', 'zh-CN'),
(2, 203, 'What improvements would you suggest?', 'en-US');

-- 验证回复数据
SELECT 
    r.review_id,
    r.content as review_content,
    COUNT(rr.reply_id) as reply_count,
    array_agg(rr.content) as replies
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.review_id IN (1, 2)
GROUP BY r.review_id, r.content;

/* 预期结果：
review_id=1: 2条回复
review_id=2: 1条回复
*/

-- 2.4 测试软删除功能
UPDATE review_system.reviews_partitioned
SET deleted_at = CURRENT_TIMESTAMP,
    review_status = 'deleted'
WHERE review_id = 1;

-- 验证软删除效果
SELECT COUNT(*) as visible_reviews
FROM review_system.reviews_partitioned
WHERE game_id = 1001 
AND deleted_at IS NULL;

/* 预期结果：
visible_reviews: 2 (原来3条减去1条被软删除的)
*/

-- 第三部分：性能测试
--------------------------

-- 3.1 测试索引使用情况
EXPLAIN ANALYZE
SELECT r.*, rr.content as reply_content
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
WHERE r.game_id = 1001
    AND r.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;

/* 预期结果：
- 应使用game_id索引
- 应使用created_at分区裁剪
- 执行时间应在毫秒级别
*/

-- 3.2 测试分区裁剪效果
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM review_system.reviews_partitioned
WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'
AND created_at < CURRENT_DATE;

/* 预期结果：
- 应只扫描当前月份的分区
- 不应扫描其他月份的分区
*/

-- 第四部分：数据一致性测试
--------------------------

-- 4.1 测试触发器更新
UPDATE review_system.reviews_partitioned
SET rating = 5.0
WHERE review_id = 2;

-- 验证汇总数据是否正确更新
SELECT 
    game_id,
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    ROUND(positive_rate, 2) as positive_rate
FROM review_system.review_summary_partitioned
WHERE game_id = 1001
ORDER BY last_updated DESC
LIMIT 1;

/* 预期结果：
- average_rating应该增加
- positive_rate应该相应更新
*/

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
LIMIT 1;

/* 预期结果：
- operation: UPDATE
- old_rating: 3.8
- new_rating: 5.0
*/

-- 第五部分：边界测试
--------------------------

-- 5.1 测试评分边界
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, platform, language)
VALUES 
(1001, 106, 5.1, '测试超出范围的评分', 'PC', 'zh-CN');

/* 预期结果：
- 应该失败，因为rating检查约束限制在0-5之间
*/

-- 5.2 测试空值处理
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, platform, language)
VALUES 
(1001, 107, 4.0, NULL, 'PC', 'zh-CN');

/* 预期结果：
- 应该失败，因为content不允许为NULL
*/

-- 第六部分：清理测试数据
--------------------------
-- 仅在需要时执行
-- DROP SCHEMA IF EXISTS review_system CASCADE; 