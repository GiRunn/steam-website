/******************************************
 * 读性能基准测试
 * 测试目标：验证评论系统的读取性能
 ******************************************/

-- 测试准备
--------------------------
-- 创建性能测试日志表
CREATE TABLE IF NOT EXISTS review_system.performance_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    rows_processed BIGINT,
    rows_per_second DECIMAL(10,2),
    test_parameters JSONB,
    execution_plan JSONB,
    notes TEXT
);

-- 1. 单表查询性能测试
--------------------------

-- 1.1 测试简单条件查询
EXPLAIN ANALYZE
SELECT *
FROM review_system.reviews_partitioned
WHERE game_id = 9001
AND created_at >= CURRENT_DATE - interval '30 days'
AND deleted_at IS NULL;

-- 1.2 测试聚合查询
EXPLAIN ANALYZE
SELECT 
    DATE_TRUNC('day', created_at) as review_date,
    COUNT(*) as review_count,
    AVG(rating) as avg_rating
FROM review_system.reviews_partitioned
WHERE game_id = 9001
AND created_at >= CURRENT_DATE - interval '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY review_date;

-- 2. 关联查询性能测试
--------------------------

-- 2.1 测试评论与回复关联查询
EXPLAIN ANALYZE
SELECT 
    r.review_id,
    r.content as review_content,
    COUNT(rr.reply_id) as reply_count,
    MAX(rr.created_at) as last_reply_time
FROM review_system.reviews_partitioned r
LEFT JOIN review_system.review_replies_partitioned rr 
    ON r.review_id = rr.review_id
WHERE r.game_id = 9001
AND r.created_at >= CURRENT_DATE - interval '30 days'
GROUP BY r.review_id, r.content;

-- 3. 分页查询性能测试
--------------------------

-- 3.1 测试基础分页
EXPLAIN ANALYZE
SELECT *
FROM review_system.reviews_partitioned
WHERE game_id = 9001
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- 3.2 测试游标分页
BEGIN;
DECLARE review_cursor CURSOR FOR
    SELECT *
    FROM review_system.reviews_partitioned
    WHERE game_id = 9001
    AND deleted_at IS NULL
    ORDER BY created_at DESC;
    
FETCH 20 FROM review_cursor;
CLOSE review_cursor;
COMMIT;

-- 4. 全文搜索性能测试
--------------------------

-- 4.1 测试内容搜索
EXPLAIN ANALYZE
SELECT *
FROM review_system.reviews_partitioned
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'game & good');

-- 5. 性能报告生成
--------------------------

-- 5.1 生成测试报告
SELECT 
    test_name,
    duration,
    rows_processed,
    rows_per_second,
    jsonb_pretty(execution_plan) as execution_plan
FROM review_system.performance_test_log
ORDER BY start_time DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
TRUNCATE review_system.performance_test_log;
*/ 