/******************************************
 * 评论回复功能测试
 * 测试目标：验证评论回复的功能完整性
 ******************************************/

-- 测试准备
--------------------------
-- 清理测试数据
DELETE FROM review_system.review_replies_partitioned 
WHERE review_id IN (
    SELECT review_id 
    FROM review_system.reviews_partitioned 
    WHERE game_id = 9001
);

-- 创建测试用的主评论
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, platform, language
) VALUES 
(9001, 901, 4.5, '测试主评论', 'PC', 'zh-CN')
RETURNING review_id INTO test_review_id;

-- 1. 创建回复测试
--------------------------

-- 1.1 测试创建直接回复
INSERT INTO review_system.review_replies_partitioned (
    review_id,
    user_id,
    content,
    language
) VALUES 
(test_review_id, 902, '这是一个直接回复', 'zh-CN')
RETURNING reply_id, content;

/* 预期结果：
- 成功创建回复
- 返回新创建的回复ID
- 触发评论汇总数据更新
*/

-- 1.2 测试创建嵌套回复
WITH first_reply AS (
    SELECT reply_id 
    FROM review_system.review_replies_partitioned 
    WHERE review_id = test_review_id 
    LIMIT 1
)
INSERT INTO review_system.review_replies_partitioned (
    review_id,
    user_id,
    parent_id,
    content,
    language
) VALUES 
(test_review_id, 903, (SELECT reply_id FROM first_reply), '这是一个嵌套回复', 'zh-CN')
RETURNING reply_id, parent_id, content;

/* 预期结果：
- 成功创建嵌套回复
- parent_id应正确设置
*/

-- 1.3 测试多语言回复
INSERT INTO review_system.review_replies_partitioned (
    review_id,
    user_id,
    content,
    language
) VALUES 
(test_review_id, 904, 'This is an English reply', 'en-US'),
(test_review_id, 905, '这是中文回复', 'zh-CN'),
(test_review_id, 906, '日本語の返信です', 'ja-JP');

/* 预期结果：
- 成功插入不同语言的回复
- 语言标记应正确设置
*/

-- 2. 查询回复测试
--------------------------

-- 2.1 测试获取评论的所有回复
SELECT 
    rr.reply_id,
    rr.user_id,
    rr.parent_id,
    rr.content,
    rr.language,
    rr.created_at
FROM review_system.review_replies_partitioned rr
WHERE rr.review_id = test_review_id
    AND rr.deleted_at IS NULL
ORDER BY 
    COALESCE(rr.parent_id, rr.reply_id),
    rr.created_at;

-- 2.2 测试获取回复树结构
WITH RECURSIVE reply_tree AS (
    -- 基础查询：获取顶层回复
    SELECT 
        reply_id,
        parent_id,
        content,
        1 as level,
        ARRAY[reply_id] as path
    FROM review_system.review_replies_partitioned
    WHERE review_id = test_review_id
        AND parent_id IS NULL
        AND deleted_at IS NULL
    
    UNION ALL
    
    -- 递归查询：获取子回复
    SELECT 
        r.reply_id,
        r.parent_id,
        r.content,
        rt.level + 1,
        rt.path || r.reply_id
    FROM review_system.review_replies_partitioned r
    JOIN reply_tree rt ON r.parent_id = rt.reply_id
    WHERE r.deleted_at IS NULL
)
SELECT 
    reply_id,
    parent_id,
    REPEAT('    ', level - 1) || content as content,
    level,
    path
FROM reply_tree
ORDER BY path;

/* 预期结果：
- 应显示正确的回复层级结构
- 路径信息应正确
*/

-- 3. 更新回复测试
--------------------------

-- 3.1 测试更新回复内容
UPDATE review_system.review_replies_partitioned
SET 
    content = '更新后的回复内容',
    updated_at = CURRENT_TIMESTAMP
WHERE reply_id = (
    SELECT reply_id 
    FROM review_system.review_replies_partitioned 
    WHERE review_id = test_review_id 
    LIMIT 1
)
RETURNING reply_id, content, updated_at;

-- 3.2 测试更新回复状态
UPDATE review_system.review_replies_partitioned
SET reply_status = 'hidden'
WHERE reply_id IN (
    SELECT reply_id
    FROM review_system.review_replies_partitioned
    WHERE review_id = test_review_id
        AND parent_id IS NOT NULL
);

/* 预期结果：
- 内容应成功更新
- 状态应正确变更
*/

-- 4. 删除回复测试
--------------------------

-- 4.1 测试软删除单个回复
UPDATE review_system.review_replies_partitioned
SET 
    deleted_at = CURRENT_TIMESTAMP,
    reply_status = 'deleted'
WHERE reply_id = (
    SELECT reply_id 
    FROM review_system.review_replies_partitioned 
    WHERE review_id = test_review_id 
    AND parent_id IS NULL
    LIMIT 1
)
RETURNING reply_id, deleted_at, reply_status;

-- 4.2 测试级联删除效果
WITH RECURSIVE reply_tree AS (
    -- 基础查询：获取被删除的回复
    SELECT reply_id
    FROM review_system.review_replies_partitioned
    WHERE deleted_at IS NOT NULL
    
    UNION ALL
    
    -- 递归查询：获取子回复
    SELECT r.reply_id
    FROM review_system.review_replies_partitioned r
    JOIN reply_tree rt ON r.parent_id = rt.reply_id
)
UPDATE review_system.review_replies_partitioned
SET 
    deleted_at = CURRENT_TIMESTAMP,
    reply_status = 'deleted'
WHERE reply_id IN (SELECT reply_id FROM reply_tree);

/* 预期结果：
- 父回复被删除时，所有子回复应标记为删除
*/

-- 5. 性能和约束测试
--------------------------

-- 5.1 测试回复深度限制
WITH RECURSIVE deep_reply AS (
    SELECT 
        reply_id,
        1 as depth
    FROM review_system.review_replies_partitioned
    WHERE review_id = test_review_id
        AND parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        r.reply_id,
        dr.depth + 1
    FROM review_system.review_replies_partitioned r
    JOIN deep_reply dr ON r.parent_id = dr.reply_id
    WHERE dr.depth < 5  -- 限制最大深度
)
SELECT MAX(depth) as max_depth
FROM deep_reply;

/* 预期结果：
- 回复深度不应超过系统限制
*/

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.review_replies_partitioned 
WHERE review_id IN (
    SELECT review_id 
    FROM review_system.reviews_partitioned 
    WHERE game_id = 9001
);

DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;
*/ 