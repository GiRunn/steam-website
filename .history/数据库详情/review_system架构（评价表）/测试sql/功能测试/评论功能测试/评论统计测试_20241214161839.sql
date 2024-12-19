/******************************************
 * 评论统计功能测试
 * 测试目标：验证评论统计数据的准确性和实时性
 ******************************************/

-- 测试准备
--------------------------
-- 清理测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id IN (9001, 9002);

DELETE FROM review_system.review_summary_partitioned
WHERE game_id IN (9001, 9002);

-- 1. 基础统计测试
--------------------------

-- 1.1 插入测试数据
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, playtime_hours, 
    is_recommended, platform, language
) VALUES 
-- 游戏9001的评论
(9001, 901, 5.0, '非常好玩', 100, true, 'PC', 'zh-CN'),
(9001, 902, 4.0, 'Pretty good', 50, true, 'PS5', 'en-US'),
(9001, 903, 3.0, '一般般', 30, false, 'PC', 'zh-CN'),
(9001, 904, 2.0, 'Not good', 10, false, 'XBOX', 'en-US'),
(9001, 905, 1.0, '很差', 5, false, 'PC', 'zh-CN'),
-- 游戏9002的评论
(9002, 906, 4.5, '推荐', 80, true, 'PC', 'zh-CN'),
(9002, 907, 4.8, 'Excellent', 120, true, 'PS5', 'en-US');

-- 1.2 验证基础统计数据
SELECT 
    game_id,
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    ROUND(positive_rate, 2) as positive_rate,
    total_playtime_hours,
    ROUND(avg_playtime_hours, 2) as avg_playtime
FROM review_system.review_summary_partitioned
WHERE game_id IN (9001, 9002)
ORDER BY game_id;

/* 预期结果：
游戏9001:
- total_reviews: 5
- avg_rating: 3.00
- positive_rate: 60.00
- total_playtime_hours: 195
- avg_playtime: 39.00

游戏9002:
- total_reviews: 2
- avg_rating: 4.65
- positive_rate: 93.00
- total_playtime_hours: 200
- avg_playtime: 100.00
*/

-- 2. 平台统计测试
--------------------------

-- 2.1 测试平台分布统计
SELECT 
    game_id,
    pc_count,
    ps5_count,
    xbox_count,
    ROUND(100.0 * pc_count / total_reviews, 2) as pc_percentage,
    ROUND(100.0 * ps5_count / total_reviews, 2) as ps5_percentage,
    ROUND(100.0 * xbox_count / total_reviews, 2) as xbox_percentage
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

/* 预期结果：
- pc_count: 3 (60%)
- ps5_count: 1 (20%)
- xbox_count: 1 (20%)
*/

-- 3. 语言分布测试
--------------------------

-- 3.1 测试语言分布统计
SELECT 
    game_id,
    en_us_count,
    zh_cn_count,
    ROUND(100.0 * en_us_count / total_reviews, 2) as en_percentage,
    ROUND(100.0 * zh_cn_count / total_reviews, 2) as zh_percentage
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

/* 预期结果：
- en_us_count: 2 (40%)
- zh_cn_count: 3 (60%)
*/

-- 4. 实时统计更新测试
--------------------------

-- 4.1 测试新增评论的统计更新
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, playtime_hours, 
    is_recommended, platform, language
) VALUES 
(9001, 908, 5.0, '新增好评', 60, true, 'PC', 'zh-CN');

-- 验证统计是否实时更新
SELECT 
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    pc_count,
    zh_cn_count
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

/* 预期结果：
- total_reviews应增加1
- average_rating应相应调整
- pc_count应增加1
- zh_cn_count应增加1
*/

-- 4.2 测试删除评论的统计更新
UPDATE review_system.reviews_partitioned
SET 
    deleted_at = CURRENT_TIMESTAMP,
    review_status = 'deleted'
WHERE game_id = 9001 
AND user_id = 908;

-- 验证统计是否实时更新
SELECT 
    total_reviews,
    ROUND(average_rating, 2) as avg_rating,
    pc_count,
    zh_cn_count
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

/* 预期结果：
- 统计数据应恢复到删除前的状态
*/

-- 5. 汇总数据一致性测试
--------------------------

-- 5.1 测试统计数据与实际数据的一致性
WITH ReviewStats AS (
    SELECT 
        game_id,
        COUNT(*) as actual_total_reviews,
        AVG(rating) as actual_avg_rating,
        SUM(playtime_hours) as actual_total_playtime,
        COUNT(*) FILTER (WHERE platform = 'PC') as actual_pc_count,
        COUNT(*) FILTER (WHERE language = 'zh-CN') as actual_zh_count
    FROM review_system.reviews_partitioned
    WHERE deleted_at IS NULL
    AND game_id = 9001
    GROUP BY game_id
)
SELECT 
    r.actual_total_reviews = s.total_reviews as total_reviews_match,
    ABS(r.actual_avg_rating - s.average_rating) < 0.01 as avg_rating_match,
    r.actual_pc_count = s.pc_count as pc_count_match,
    r.actual_zh_count = s.zh_cn_count as zh_count_match
FROM ReviewStats r
JOIN review_system.review_summary_partitioned s ON r.game_id = s.game_id;

/* 预期结果：
- 所有比较结果应为true
*/

-- 6. 性能测试
--------------------------

-- 6.1 测试大量评论的统计性能
EXPLAIN ANALYZE
SELECT 
    game_id,
    COUNT(*) as total_reviews,
    AVG(rating) as avg_rating,
    COUNT(*) FILTER (WHERE platform = 'PC') as pc_count
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL
GROUP BY game_id;

/* 预期结果：
- 查询应使用索引
- 执行时间应在可接受范围内
*/

-- 7. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id IN (9001, 9002);

DELETE FROM review_system.review_summary_partitioned
WHERE game_id IN (9001, 9002);
*/ 

--已完成测试