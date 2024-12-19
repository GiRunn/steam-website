/******************************************
 * 分区维护功能测试
 * 测试目标：验证分区表的维护操作和管理功能
 ******************************************/

-- 测试准备
--------------------------
-- 创建维护日志表
CREATE TABLE IF NOT EXISTS review_system.partition_maintenance_log (
    log_id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(50),
    partition_name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    rows_affected BIGINT,
    status VARCHAR(20),
    error_message TEXT
);

-- 1. 分区预创建测试
--------------------------

-- 1.1 创建未来3个月的分区
DO $$
DECLARE
    v_month timestamp;
    v_partition_name text;
    v_start_time timestamp;
    v_end_time timestamp;
BEGIN
    FOR i IN 1..3 LOOP
        v_month := date_trunc('month', CURRENT_DATE + (i || ' month')::interval);
        v_partition_name := 'reviews_y' || to_char(v_month, 'YYYY') || 'm' || to_char(v_month, 'MM');
        v_start_time := v_month;
        v_end_time := v_month + interval '1 month';
        
        -- 记录开始
        INSERT INTO review_system.partition_maintenance_log 
        (operation, partition_name, start_time, status)
        VALUES ('CREATE_PARTITION', v_partition_name, CURRENT_TIMESTAMP, 'IN_PROGRESS');
        
        -- 创建分区
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I 
             PARTITION OF review_system.reviews_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            v_partition_name, v_start_time, v_end_time
        );
        
        -- 记录完成
        UPDATE review_system.partition_maintenance_log
        SET 
            end_time = CURRENT_TIMESTAMP,
            status = 'COMPLETED'
        WHERE partition_name = v_partition_name
        AND operation = 'CREATE_PARTITION'
        AND end_time IS NULL;
    END LOOP;
END;
$$;

-- 2. 分区清理测试
--------------------------

-- 2.1 识别过期分区（超过12个月的分区）
WITH old_partitions AS (
    SELECT 
        schemaname,
        tablename,
        to_timestamp(
            substring(tablename from 'y(\d{4})m(\d{2})$'),
            'YYYYMM'
        ) as partition_date
    FROM pg_tables
    WHERE schemaname = 'review_system'
    AND tablename ~ '^reviews_y\d{4}m\d{2}$'
)
SELECT *
FROM old_partitions
WHERE partition_date < date_trunc('month', CURRENT_DATE - interval '12 month')
ORDER BY partition_date;

-- 2.2 备份并清理过期分区
DO $$
DECLARE
    v_partition record;
    v_backup_table text;
    v_rows_affected bigint;
BEGIN
    FOR v_partition IN (
        SELECT 
            schemaname,
            tablename,
            to_timestamp(
                substring(tablename from 'y(\d{4})m(\d{2})$'),
                'YYYYMM'
            ) as partition_date
        FROM pg_tables
        WHERE schemaname = 'review_system'
        AND tablename ~ '^reviews_y\d{4}m\d{2}$'
        AND to_timestamp(
            substring(tablename from 'y(\d{4})m(\d{2})$'),
            'YYYYMM'
        ) < date_trunc('month', CURRENT_DATE - interval '12 month')
    ) LOOP
        -- 记录开始
        INSERT INTO review_system.partition_maintenance_log 
        (operation, partition_name, start_time, status)
        VALUES ('CLEANUP_PARTITION', v_partition.tablename, CURRENT_TIMESTAMP, 'IN_PROGRESS');
        
        -- 创建备份表
        v_backup_table := 'backup_' || v_partition.tablename;
        EXECUTE format(
            'CREATE TABLE review_system.%I (LIKE review_system.%I INCLUDING ALL)',
            v_backup_table, v_partition.tablename
        );
        
        -- 复制数据到备份表
        EXECUTE format(
            'INSERT INTO review_system.%I SELECT * FROM review_system.%I',
            v_backup_table, v_partition.tablename
        );
        
        -- 获取影响的行数
        EXECUTE format('SELECT COUNT(*) FROM review_system.%I', v_backup_table)
        INTO v_rows_affected;
        
        -- 删除原分区
        EXECUTE format('DROP TABLE review_system.%I', v_partition.tablename);
        
        -- 记录完成
        UPDATE review_system.partition_maintenance_log
        SET 
            end_time = CURRENT_TIMESTAMP,
            rows_affected = v_rows_affected,
            status = 'COMPLETED'
        WHERE partition_name = v_partition.tablename
        AND operation = 'CLEANUP_PARTITION'
        AND end_time IS NULL;
    END LOOP;
END;
$$;

-- 3. 分区优化测试
--------------------------

-- 3.1 重建分区索引
DO $$
DECLARE
    v_partition record;
BEGIN
    FOR v_partition IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'review_system'
        AND tablename ~ '^reviews_y\d{4}m\d{2}$'
    ) LOOP
        -- 记录开始
        INSERT INTO review_system.partition_maintenance_log 
        (operation, partition_name, start_time, status)
        VALUES ('REINDEX_PARTITION', v_partition.tablename, CURRENT_TIMESTAMP, 'IN_PROGRESS');
        
        -- 重建索引
        EXECUTE format('REINDEX TABLE review_system.%I', v_partition.tablename);
        
        -- 记录完成
        UPDATE review_system.partition_maintenance_log
        SET 
            end_time = CURRENT_TIMESTAMP,
            status = 'COMPLETED'
        WHERE partition_name = v_partition.tablename
        AND operation = 'REINDEX_PARTITION'
        AND end_time IS NULL;
    END LOOP;
END;
$$;

-- 3.2 更新分区统计信息
DO $$
DECLARE
    v_partition record;
BEGIN
    FOR v_partition IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'review_system'
        AND tablename ~ '^reviews_y\d{4}m\d{2}$'
    ) LOOP
        -- 记录开始
        INSERT INTO review_system.partition_maintenance_log 
        (operation, partition_name, start_time, status)
        VALUES ('ANALYZE_PARTITION', v_partition.tablename, CURRENT_TIMESTAMP, 'IN_PROGRESS');
        
        -- 更新统计信息
        EXECUTE format('ANALYZE review_system.%I', v_partition.tablename);
        
        -- 记录完成
        UPDATE review_system.partition_maintenance_log
        SET 
            end_time = CURRENT_TIMESTAMP,
            status = 'COMPLETED'
        WHERE partition_name = v_partition.tablename
        AND operation = 'ANALYZE_PARTITION'
        AND end_time IS NULL;
    END LOOP;
END;
$$;

-- 4. 分区监控测试
--------------------------

-- 4.1 检查分区大小和使用情况
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size,
    (SELECT n_live_tup FROM pg_stat_user_tables 
     WHERE schemaname = p.schemaname AND relname = p.tablename) as row_count
FROM pg_tables p
WHERE schemaname = 'review_system'
AND tablename ~ '^reviews_y\d{4}m\d{2}$'
ORDER BY tablename;

-- 4.2 检查维护操作历史
SELECT 
    operation,
    partition_name,
    start_time,
    end_time,
    end_time - start_time as duration,
    rows_affected,
    status,
    error_message
FROM review_system.partition_maintenance_log
ORDER BY start_time DESC
LIMIT 10;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理维护日志
TRUNCATE review_system.partition_maintenance_log;

-- 清理备份表
DO $$
DECLARE
    v_table record;
BEGIN
    FOR v_table IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'review_system'
        AND tablename LIKE 'backup_reviews_%'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS review_system.%I', v_table.tablename);
    END LOOP;
END;
$$;
*/ 