/******************************************
 * 游戏评论系统安全性测试方案 v1.0
 * 测试目标：验证系统的安全性、权限控制和数据保护
 ******************************************/

-- 第一部分：用户权限测试
--------------------------

-- 1.1 创建测试用户和角色
CREATE ROLE review_readonly LOGIN PASSWORD 'readonly123';
CREATE ROLE review_editor LOGIN PASSWORD 'editor123';
CREATE ROLE review_admin LOGIN PASSWORD 'admin123';

-- 1.2 设置基础权限
GRANT USAGE ON SCHEMA review_system TO review_readonly, review_editor, review_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA review_system TO review_readonly;
GRANT SELECT, INSERT, UPDATE ON review_system.reviews_partitioned, 
    review_system.review_replies_partitioned TO review_editor;
GRANT ALL PRIVILEGES ON SCHEMA review_system TO review_admin;

/* 预期结果：
- review_readonly 只能查询数据
- review_editor 能查询和修改评论数据
- review_admin 拥有所有权限
*/

-- 1.3 测试只读用户权限
SET ROLE review_readonly;

-- 尝试查询数据（应该成功）
SELECT * FROM review_system.reviews_partitioned LIMIT 1;

-- 尝试插入数据（应该失败）
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, platform, language)
VALUES (1001, 108, 4.0, '测试权限', 'PC', 'zh-CN');

-- 第二部分：数据安全性测试
--------------------------

-- 2.1 测试SQL注入防护
-- 使用参数化查询测试
PREPARE review_query(int) AS
SELECT * FROM review_system.reviews_partitioned 
WHERE game_id = $1 AND deleted_at IS NULL;

EXECUTE review_query(1001); -- 正常查询
EXECUTE review_query('1001; DROP TABLE reviews;'); -- 尝试注入（应该失败）

-- 2.2 测试敏感数据保护
-- 创建脱敏视图
CREATE OR REPLACE VIEW review_system.reviews_safe_view AS
SELECT 
    review_id,
    game_id,
    CASE 
        WHEN LENGTH(user_id::text) > 4 
        THEN CONCAT('***', RIGHT(user_id::text, 4))
        ELSE '***'
    END as masked_user_id,
    rating,
    CASE 
        WHEN language = 'zh-CN' THEN content
        ELSE translate(content, '@#$%^&*()_+', '***********')
    END as safe_content,
    platform,
    language,
    created_at
FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL;

-- 授权访问脱敏视图
GRANT SELECT ON review_system.reviews_safe_view TO review_readonly;

-- 第三部分：审计和监控测试
--------------------------

-- 3.1 测试审计日志完整性
-- 执行一系列操作
INSERT INTO review_system.reviews_partitioned 
(game_id, user_id, rating, content, platform, language)
VALUES (1001, 109, 4.0, '测试审计', 'PC', 'zh-CN');

UPDATE review_system.reviews_partitioned
SET content = '更新的内容'
WHERE review_id = (SELECT MAX(review_id) FROM review_system.reviews_partitioned);

DELETE FROM review_system.reviews_partitioned
WHERE review_id = (SELECT MAX(review_id) FROM review_system.reviews_partitioned);

-- 验证审计日志是否完整记录
SELECT operation, table_name, record_id, changed_at
FROM review_system.review_audit_log
WHERE changed_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
ORDER BY changed_at DESC;

-- 3.2 测试并发访问控制
-- 创建测试函数模拟并发更新
CREATE OR REPLACE FUNCTION test_concurrent_updates()
RETURNS void AS $$
DECLARE
    v_review_id int;
BEGIN
    -- 获取一个测试评论ID
    SELECT review_id INTO v_review_id 
    FROM review_system.reviews_partitioned 
    LIMIT 1;
    
    -- 开启事务1
    BEGIN
        -- 模拟并发更新
        UPDATE review_system.reviews_partitioned
        SET rating = 4.0
        WHERE review_id = v_review_id;
        
        -- 模拟延迟
        PERFORM pg_sleep(2);
        
        -- 提交事务
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Transaction 1 failed: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- 第四部分：数据完整性测试
--------------------------

-- 4.1 测试外键约束
INSERT INTO review_system.review_replies_partitioned 
(review_id, user_id, content, language)
VALUES 
(999999, 201, '测试不存在的评论ID', 'zh-CN');

/* 预期结果：
- 应该失败，因为引用了不存在的review_id
*/

-- 4.2 测试数据一致性
BEGIN;
    -- 尝试在事务中更新数据
    UPDATE review_system.reviews_partitioned
    SET rating = 4.5
    WHERE review_id = 1;
    
    -- 验证汇总数据是否正确更新
    SELECT average_rating
    FROM review_system.review_summary_partitioned
    WHERE game_id = (
        SELECT game_id 
        FROM review_system.reviews_partitioned 
        WHERE review_id = 1
    );
ROLLBACK;

-- 第五部分：性能安全测试
--------------------------

-- 5.1 测试资源限制
ALTER ROLE review_readonly SET statement_timeout = '5s';
ALTER ROLE review_readonly SET idle_in_transaction_timeout = '30s';

-- 测试长时间查询（应该在5秒后超时）
SET ROLE review_readonly;
SELECT COUNT(*) 
FROM review_system.reviews_partitioned r1
CROSS JOIN review_system.reviews_partitioned r2;

-- 5.2 测试连接限制
ALTER ROLE review_readonly CONNECTION LIMIT 5;

-- 第六部分：清理安全测试数据
--------------------------
-- DROP ROLE IF EXISTS review_readonly;
-- DROP ROLE IF EXISTS review_editor;
-- DROP ROLE IF EXISTS review_admin;
-- DROP VIEW IF EXISTS review_system.reviews_safe_view; 