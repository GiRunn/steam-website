-- 1. reviews_partitioned 表结构
\d review_system.reviews_partitioned

-- 2. 分区信息
SELECT 
    nmsp_parent.nspname AS parent_schema,
    parent.relname AS parent_table,
    child.relname AS partition_name,
    pg_get_expr(child.relpartbound, child.oid) AS partition_range
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
WHERE parent.relname IN ('reviews_partitioned', 'review_replies_partitioned', 'review_summary_partitioned')
ORDER BY parent.relname, child.relname; 