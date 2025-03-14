-- 1. LIKE查询修复示例
-- 错误写法
SELECT * FROM review_system.reviews_partitioned WHERE content LIKE '{}';

-- 正确写法
SELECT * FROM review_system.reviews_partitioned WHERE content LIKE $1;

-- 2. ORDER BY修复示例
-- 错误写法
SELECT * FROM review_system.reviews_partitioned ORDER BY {};

-- 正确写法
SELECT * FROM review_system.reviews_partitioned ORDER BY 
    CASE WHEN $1 = 'created_at' THEN created_at
         WHEN $1 = 'rating' THEN rating
         ELSE review_id END;

-- 3. 权限修复示例
REVOKE ALL ON review_system.reviews_partitioned FROM review_readonly;
GRANT SELECT ON review_system.reviews_partitioned TO review_readonly; 