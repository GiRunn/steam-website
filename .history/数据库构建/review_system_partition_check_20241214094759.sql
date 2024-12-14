-- 1. 查看所有分区表及其子分区
SELECT 
    nmsp_parent.nspname AS parent_schema,
    parent.relname AS parent_table,
    nmsp_child.nspname AS child_schema,
    child.relname AS child_table,
    pg_get_expr(child.relpartbound, child.oid) AS partition_expression
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
    JOIN pg_namespace nmsp_child ON child.relnamespace = nmsp_child.oid
WHERE parent.relname IN ('reviews_partitioned', 'review_replies_partitioned', 'review_summary_partitioned')
ORDER BY parent.relname, child.relname;

-- 2. 查看每个分区表的数据量
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE tablename LIKE '%partitioned%' OR tablename LIKE 'reviews_y%' OR tablename LIKE 'review_replies_y%'
ORDER BY schemaname, tablename;

-- 3. 查看分区表的索引信息
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename LIKE '%partitioned%' OR tablename LIKE 'reviews_y%' OR tablename LIKE 'review_replies_y%'
ORDER BY schemaname, tablename, indexname;

-- 4. 检查分区边界和范围
SELECT 
    c.relname as table_name,
    pg_get_partkeydef(c.oid) as partition_key,
    pg_get_expr(c.relpartbound, c.oid) as partition_bound
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relispartition
AND n.nspname = 'review_system'
ORDER BY c.relname;

-- 5. 查看每个分区的具体数据分布
WITH partition_info AS (
    SELECT 
        schemaname || '.' || tablename as full_table_name,
        n_live_tup as row_count
    FROM pg_stat_user_tables
    WHERE tablename LIKE 'reviews_y%'
)
SELECT 
    full_table_name,
    row_count,
    round(100.0 * row_count / sum(row_count) over (), 2) as percentage
FROM partition_info
WHERE row_count > 0
ORDER BY full_table_name;

-- 6. 检查分区表的约束
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname LIKE '%partitioned%' OR c.relname LIKE 'reviews_y%'
ORDER BY n.nspname, c.relname, con.conname;

-- 7. 检查分区表的触发器
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname LIKE '%partitioned%' OR c.relname LIKE 'reviews_y%'
ORDER BY n.nspname, c.relname, t.tgname;

-- 8. 检查分区表的存储参数
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    c.reloptions as storage_parameters
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname LIKE '%partitioned%' OR c.relname LIKE 'reviews_y%'
ORDER BY n.nspname, c.relname;

-- 9. 检查是否有孤立的子分区
WITH RECURSIVE partition_tree AS (
    -- 获取所有父分区表
    SELECT 
        c.oid,
        c.relname,
        0 as level
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname IN ('reviews_partitioned', 'review_replies_partitioned', 'review_summary_partitioned')
    AND n.nspname = 'review_system'
    
    UNION ALL
    
    -- 递归获取所有子分区
    SELECT 
        i.inhrelid,
        c.relname,
        p.level + 1
    FROM partition_tree p
    JOIN pg_inherits i ON i.inhparent = p.oid
    JOIN pg_class c ON c.oid = i.inhrelid
)
SELECT 
    relname as partition_name,
    level as nesting_level
FROM partition_tree
ORDER BY level, relname;

-- 10. 查看分区表的访问统计信息
SELECT 
    schemaname,
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE relname LIKE '%partitioned%' OR relname LIKE 'reviews_y%'
ORDER BY schemaname, relname;

-- 11. 创建一个更详细的分区检查存储过程
CREATE OR REPLACE PROCEDURE review_system.check_partition_status()
LANGUAGE plpgsql
AS $$
DECLARE
    v_min_date TIMESTAMP WITH TIME ZONE;
    v_max_date TIMESTAMP WITH TIME ZONE;
    v_partition_count INTEGER;
    v_missing_partitions TEXT[];
    v_current_date DATE;
    v_partition_name TEXT;
BEGIN
    -- 获取数据时间范围
    SELECT MIN(created_at), MAX(created_at)
    INTO v_min_date, v_max_date
    FROM review_system.reviews;
    
    RAISE NOTICE 'Data range: % to %', v_min_date, v_max_date;
    
    -- 检查现有分区
    SELECT COUNT(*)
    INTO v_partition_count
    FROM pg_inherits i
    JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_class p ON i.inhparent = p.oid
    WHERE p.relname = 'reviews_partitioned';
    
    RAISE NOTICE 'Found % existing partitions', v_partition_count;
    
    -- 检查每个月的分区是否存在
    v_current_date := DATE_TRUNC('month', v_min_date)::DATE;
    WHILE v_current_date <= DATE_TRUNC('month', v_max_date)::DATE LOOP
        v_partition_name := 'reviews_y' || TO_CHAR(v_current_date, 'YYYY') || 'm' || TO_CHAR(v_current_date, 'MM');
        
        IF NOT EXISTS (
            SELECT 1
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'review_system'
            AND c.relname = v_partition_name
        ) THEN
            v_missing_partitions := array_append(v_missing_partitions, v_partition_name);
        END IF;
        
        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;
    
    -- 报告缺失的分区
    IF array_length(v_missing_partitions, 1) > 0 THEN
        RAISE NOTICE 'Missing partitions: %', array_to_string(v_missing_partitions, ', ');
        
        -- 自动创建缺失的分区
        FOR v_partition_name IN SELECT unnest(v_missing_partitions) LOOP
            v_current_date := TO_DATE(
                substring(v_partition_name from 'y(\d{4})m(\d{2})'),
                'YYYYMM'
            );
            
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
                FOR VALUES FROM (%L) TO (%L)',
                v_partition_name,
                v_current_date,
                v_current_date + INTERVAL '1 month'
            );
            
            RAISE NOTICE 'Created partition: %', v_partition_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'All required partitions exist';
    END IF;
    
    -- 检查数据分布
    FOR v_current_date IN 
        SELECT DISTINCT DATE_TRUNC('month', created_at)::DATE
        FROM review_system.reviews
        ORDER BY 1
    LOOP
        v_partition_name := 'reviews_y' || TO_CHAR(v_current_date, 'YYYY') || 'm' || TO_CHAR(v_current_date, 'MM');
        
        EXECUTE format('
            SELECT COUNT(*)
            FROM review_system.%I',
            v_partition_name
        );
        
        RAISE NOTICE 'Partition % contains % rows', 
            v_partition_name, 
            (SELECT COUNT(*) FROM review_system.reviews WHERE DATE_TRUNC('month', created_at) = v_current_date);
    END LOOP;
END;
$$; 