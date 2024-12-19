-- 确保review_system架构存在
CREATE SCHEMA IF NOT EXISTS review_system;

-- 删除现有的评论系统表（按照依赖关系顺序删除）
DROP TABLE IF EXISTS review_system.review_replies_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.reviews_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_summary CASCADE;

-- 删除相关的触发器函数
DROP FUNCTION IF EXISTS review_system.create_partition_if_not_exists() CASCADE;
DROP FUNCTION IF EXISTS review_system.update_review_summary() CASCADE; 