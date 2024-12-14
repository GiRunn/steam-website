-- 删除临时表
DROP TABLE IF EXISTS review_system.reviews_temp;
DROP TABLE IF EXISTS review_system.review_replies_temp;
DROP TABLE IF EXISTS review_system.review_summary_temp;

-- 删除旧表
DROP TABLE IF EXISTS review_system.reviews_old;
DROP TABLE IF EXISTS review_system.review_replies_old;
DROP TABLE IF EXISTS review_system.review_summary_old;

-- 删除备份表
DROP TABLE IF EXISTS review_system.reviews_backup;

-- 删除迁移状态表
DROP TABLE IF EXISTS review_system.migration_status;

-- 验证剩余表
SELECT 
    schemaname as 架构名,
    tablename as 表名
FROM pg_tables
WHERE schemaname = 'review_system'
ORDER BY tablename; 