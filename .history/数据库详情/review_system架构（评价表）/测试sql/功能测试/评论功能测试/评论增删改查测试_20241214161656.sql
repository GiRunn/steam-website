/******************************************
 * 评论基础CRUD功能测试
 * 测试目标：验证评论的基本增删改查功能
 ******************************************/

-- 测试准备
--------------------------
-- 清理测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id IN (9001, 9002, 9003);

-- 1. 创建评论测试
--------------------------

-- 1.1 测试正常创建评论
INSERT INTO review_system.reviews_partitioned (
    game_id, 
    user_id, 
    rating, 
    content, 
    playtime_hours, 
    is_recommended, 
    platform, 
    language
) VALUES 
(9001, 901, 4.5, '测试评论内容1', 10, true, 'PC', 'zh-CN')
RETURNING review_id, rating, content;

/* 预期结果：
- 成功插入评论
- 返回新创建的评论ID
- 触发汇总数据更新
*/

-- 1.2 测试边界值创建
-- 测试最小评分
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, platform, language
) VALUES 
(9001, 902, 0.0, '最低评分测试', 'PC', 'zh-CN');

-- 测试最大评分
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, platform, language
) VALUES 
(9001, 903, 5.0, '最高评分测试', 'PC', 'zh-CN');

/* 预期结果：
- 两条评论都应成功插入
- 评分应严格在0-5范围内
*/

-- 1.3 测试非法值创建（应该失败）
-- 测试超出范围的评分
BEGIN;
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, platform, language
    ) VALUES 
    (9001, 904, 5.1, '非法评分测试', 'PC', 'zh-CN');
ROLLBACK;

-- 测试必填字段为空
BEGIN;
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, platform, language
    ) VALUES 
    (9001, 905, NULL, '评分为空测试', 'PC', 'zh-CN');
ROLLBACK;

/* 预期结果：
- 两次插入都应该失败
- 应该有适当的错误消息
*/

-- 2. 查询评论测试
--------------------------

-- 2.1 测试单条评论查询
SELECT 
    review_id,
    game_id,
    user_id,
    rating,
    content,
    created_at
FROM review_system.reviews_partitioned
WHERE review_id = (
    SELECT review_id 
    FROM review_system.reviews_partitioned 
    WHERE game_id = 9001 
    LIMIT 1
);

-- 2.2 测试评论列表查询
SELECT 
    review_id,
    rating,
    content,
    created_at
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL
ORDER BY created_at DESC;

-- 2.3 测试评论统计查询
SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL;

/* 预期结果：
- 所有查询都应返回正确的结果
- 查询性能应在可接受范围内
*/

-- 3. 更新评论测试
--------------------------

-- 3.1 测试正常更新
UPDATE review_system.reviews_partitioned
SET 
    rating = 4.0,
    content = '更新后的评论内容',
    updated_at = CURRENT_TIMESTAMP
WHERE review_id = (
    SELECT review_id 
    FROM review_system.reviews_partitioned 
    WHERE game_id = 9001 
    LIMIT 1
)
RETURNING review_id, rating, content, updated_at;

/* 预期结果：
- 成功更新评论
- updated_at应被更新
- 触发汇总数据更新
*/

-- 3.2 测试非法更新（应该失败）
BEGIN;
    UPDATE review_system.reviews_partitioned
    SET rating = 5.5
    WHERE game_id = 9001;
ROLLBACK;

/* 预期结果：
- 更新应该失败
- 应该有适当的错误消息
*/

-- 4. 删除评论测试
--------------------------

-- 4.1 测试软删除
UPDATE review_system.reviews_partitioned
SET 
    deleted_at = CURRENT_TIMESTAMP,
    review_status = 'deleted'
WHERE review_id = (
    SELECT review_id 
    FROM review_system.reviews_partitioned 
    WHERE game_id = 9001 
    LIMIT 1
)
RETURNING review_id, deleted_at, review_status;

/* 预期结果：
- 评论应被标记为删除
- 不应在普通查询中显示
- 触发汇总数据更新
*/

-- 4.2 验证软删除效果
SELECT COUNT(*) as visible_reviews
FROM review_system.reviews_partitioned
WHERE game_id = 9001 
    AND deleted_at IS NULL;

-- 4.3 测试删除后的汇总数据
SELECT 
    total_reviews,
    average_rating,
    positive_rate
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

/* 预期结果：
- 汇总数据应正确反映删除后的状态
*/

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id IN (9001, 9002, 9003);
*/ 

--