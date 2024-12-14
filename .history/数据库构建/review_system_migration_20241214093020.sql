-- 1. 直接从原表迁移数据到分区表
INSERT INTO review_system.reviews_partitioned
SELECT * FROM review_system.reviews;

INSERT INTO review_system.review_replies_partitioned
SELECT * FROM review_system.review_replies;

INSERT INTO review_system.review_summary_partitioned
SELECT * FROM review_system.review_summary;

-- 2. 验证数据迁移
SELECT 
    'Original (reviews)' as source,
    COUNT(*) as count,
    MIN(created_at) as min_date,
    MAX(created_at) as max_date
FROM review_system.reviews
UNION ALL
SELECT 
    'Partitioned (reviews)' as source,
    COUNT(*) as count,
    MIN(created_at) as min_date,
    MAX(created_at) as max_date
FROM review_system.reviews_partitioned;

-- 3. 检查分区数据分布
SELECT 
    child.relname AS partition_name,
    COUNT(*) as record_count
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
    LEFT JOIN review_system.reviews_partitioned p ON true
WHERE parent.relname = 'reviews_partitioned'
GROUP BY child.relname
ORDER BY child.relname;

-- 4. 如果迁移成功，重命名原表（可选）
-- ALTER TABLE review_system.reviews RENAME TO reviews_old;
-- ALTER TABLE review_system.review_replies RENAME TO review_replies_old;
-- ALTER TABLE review_system.review_summary RENAME TO review_summary_old;

-- 5. 创建视图以保持兼容性（可选）
-- CREATE OR REPLACE VIEW review_system.reviews AS 
-- SELECT * FROM review_system.reviews_partitioned; 