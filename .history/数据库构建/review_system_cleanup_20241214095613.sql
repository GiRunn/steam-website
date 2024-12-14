-- 删除临时表
DROP TABLE IF EXISTS review_system.reviews_temp CASCADE;
DROP TABLE IF EXISTS review_system.review_replies_temp CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_temp CASCADE;

-- 删除旧表（使用CASCADE删除所有依赖对象）
DROP TABLE IF EXISTS review_system.reviews_old CASCADE;
DROP TABLE IF EXISTS review_system.review_replies_old CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_old CASCADE;

-- 删除备份表
DROP TABLE IF EXISTS review_system.reviews_backup CASCADE;

-- 删除迁移状态表
DROP TABLE IF EXISTS review_system.migration_status CASCADE;

-- 验证剩余表
SELECT 
    schemaname as 架构名,
    tablename as 表名,
    hasindexes as 是否有索引,
    hastriggers as 是否有触发器
FROM pg_tables
WHERE schemaname = 'review_system'
ORDER BY tablename;

-- 验证外键约束
SELECT 
    tc.table_name as 表名,
    tc.constraint_name as 约束名,
    tc.constraint_type as 约束类型,
    kcu.column_name as 列名
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'review_system'
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name; 