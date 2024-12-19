-- 分区功能测试用例
-- 1. 检查现有分区
SELECT 
    schemaname, tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables 
WHERE schemaname = 'review_system' 
    AND tablename ~ '^(reviews|replies|summary)_y[0-9]{4}m[0-9]{2}$'
ORDER BY tablename;

-- 2. 测试未来分区创建
SELECT review_system.create_future_partitions(3);

-- 3. 验证分区边界
SELECT 
    c.relname as partition_name,
    pg_get_expr(c.relpartbound, c.oid) as partition_bounds
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'review_system' 
    AND c.relispartition; 