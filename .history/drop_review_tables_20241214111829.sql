-- 确保review_system架构存在
CREATE SCHEMA IF NOT EXISTS review_system;

-- 删除现有的分区表（按照依赖关系顺序删除）
DROP TABLE IF EXISTS review_system.review_summary_y2024m12 CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_y2025m01 CASCADE;
DROP TABLE IF EXISTS review_system.review_summary_partitioned CASCADE;

-- 删除其他相关表
DROP TABLE IF EXISTS review_system.review_audit_log CASCADE;

-- 删除触发器和函数
DROP TRIGGER IF EXISTS trg_summary_auto_partition ON review_system.review_summary_partitioned CASCADE;
DROP FUNCTION IF EXISTS review_system.auto_create_partition() CASCADE;

-- 删除我们将要创建的新表（以防万一它们存在）
DROP TABLE IF EXISTS review_system.review_replies_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.reviews_partitioned CASCADE;
DROP TABLE IF EXISTS review_system.review_summary CASCADE;

-- 删除我们将要创建的新函数
DROP FUNCTION IF EXISTS review_system.create_partition_if_not_exists() CASCADE;
DROP FUNCTION IF EXISTS review_system.update_review_summary() CASCADE; 