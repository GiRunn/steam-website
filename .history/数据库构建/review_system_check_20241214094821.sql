-- 1. 查看review_system模式下的所有表
SELECT 
    schemaname as 架构名,
    tablename as 表名,
    tableowner as 所有者,
    tablespace as 表空间,
    hasindexes as 是否有索引,
    hasrules as 是否有规则,
    hastriggers as 是否有触发器
FROM pg_tables
WHERE schemaname = 'review_system'
ORDER BY tablename;

-- 2. 查看分区表结构
\d review_system.reviews_partitioned
\d review_system.review_replies_partitioned
\d review_system.review_summary_partitioned

-- 3. 查看所有分区信息
SELECT 
    nmsp_parent.nspname as 架构名,
    parent.relname as 父表名,
    child.relname as 分区名,
    pg_get_expr(child.relpartbound, child.oid) as 分区范围
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
WHERE parent.relname IN (
    'reviews_partitioned', 
    'review_replies_partitioned', 
    'review_summary_partitioned'
)
ORDER BY parent.relname, child.relname;

-- 4. 查看所有索引
SELECT 
    schemaname as 架构名,
    tablename as 表名,
    indexname as 索引名,
    indexdef as 索引定义
FROM pg_indexes
WHERE schemaname = 'review_system'
ORDER BY tablename, indexname;

-- 5. 查看表的大小和行数
SELECT 
    schemaname as 架构名,
    relname as 表名,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) as 总大小,
    pg_size_pretty(pg_relation_size(schemaname || '.' || relname)) as 表大小,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || relname)) as 索引大小,
    n_live_tup as 行数
FROM pg_stat_user_tables
WHERE schemaname = 'review_system'
ORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC;

-- 6. 查看每个分区的数据分布
SELECT 
    child.relname as 分区名,
    pg_size_pretty(pg_relation_size(child.oid)) as 分区大小,
    (SELECT count(*) FROM pg_class c2 WHERE c2.relname = child.relname) as 行数
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname IN (
    'reviews_partitioned', 
    'review_replies_partitioned', 
    'review_summary_partitioned'
)
ORDER BY child.relname;

-- 7. 查看表的列信息
SELECT 
    table_name as 表名,
    column_name as 列名,
    data_type as 数据类型,
    column_default as 默认值,
    is_nullable as 允许空值,
    character_maximum_length as 最大长度
FROM information_schema.columns
WHERE table_schema = 'review_system'
ORDER BY table_name, ordinal_position;

-- 8. 查看表的约束
SELECT 
    tc.table_name as 表名,
    tc.constraint_name as 约束名,
    tc.constraint_type as 约束类型,
    kcu.column_name as 列名,
    rc.update_rule as 更新规则,
    rc.delete_rule as 删除规则
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'review_system'
ORDER BY tc.table_name, tc.constraint_name; 