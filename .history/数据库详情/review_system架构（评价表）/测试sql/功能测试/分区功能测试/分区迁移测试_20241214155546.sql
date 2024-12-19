/******************************************
 * 分区迁移功能测试
 * 测试目标：验证分区表的迁移和重组功能
 ******************************************/

-- 测试准备
--------------------------
-- 创建迁移测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_migration_log (
    migration_id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(50),
    source_partition VARCHAR(100),
    target_partition VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    rows_migrated BIGINT,
    status VARCHAR(20),
    error_message TEXT,
    migration_details JSONB
);

-- 1. 分区重组测试
--------------------------

-- 1.1 创建分区重组函数
CREATE OR REPLACE FUNCTION review_system.reorganize_partition(
    p_partition_name TEXT,
    p_rebuild_indexes BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
DECLARE
    v_migration_id BIGINT;
    v_temp_table TEXT;
    v_row_count BIGINT;
    v_start_time TIMESTAMP;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 记录开始重组
    INSERT INTO review_system.partition_migration_log 
    (operation, source_partition, status)
    VALUES ('REORGANIZE', p_partition_name, 'IN_PROGRESS')
    RETURNING migration_id INTO v_migration_id;
    
    -- 创建临时表
    v_temp_table := p_partition_name || '_reorg';
    
    BEGIN
        -- 创建临时表结构
        EXECUTE format(
            'CREATE TABLE review_system.%I 
             (LIKE review_system.%I INCLUDING ALL)',
            v_temp_table, p_partition_name
        );
        
        -- 复制数据到临时表
        EXECUTE format(
            'INSERT INTO review_system.%I 
             SELECT * FROM review_system.%I
             ORDER BY created_at',
            v_temp_table, p_partition_name
        );
        
        -- 获取迁移的行数
        EXECUTE format(
            'SELECT COUNT(*) FROM review_system.%I',
            v_temp_table
        ) INTO v_row_count;
        
        -- 交换表
        EXECUTE format(
            'ALTER TABLE review_system.%I 
             RENAME TO %I_old',
            p_partition_name, p_partition_name
        );
        
        EXECUTE format(
            'ALTER TABLE review_system.%I 
             RENAME TO %I',
            v_temp_table, p_partition_name
        );
        
        -- 如果需要重建索引
        IF p_rebuild_indexes THEN
            EXECUTE format(
                'REINDEX TABLE review_system.%I',
                p_partition_name
            );
        END IF;
        
        -- 删除旧表
        EXECUTE format(
            'DROP TABLE review_system.%I_old',
            p_partition_name
        );
        
        -- 更新迁移状态
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            rows_migrated = v_row_count,
            status = 'COMPLETED',
            migration_details = jsonb_build_object(
                'duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
                'rebuilt_indexes', p_rebuild_indexes,
                'table_size', pg_size_pretty(pg_table_size('review_system.' || p_partition_name))
            )
        WHERE migration_id = v_migration_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- 记录错误
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            status = 'FAILED',
            error_message = SQLERRM
        WHERE migration_id = v_migration_id;
        
        -- 清理临时表
        EXECUTE format(
            'DROP TABLE IF EXISTS review_system.%I',
            v_temp_table
        );
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- 1.2 测试分区重组
DO $$
DECLARE
    v_partition_name TEXT;
BEGIN
    -- 获取当前月份分区名
    v_partition_name := 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 
                       'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 执行重组
    PERFORM review_system.reorganize_partition(v_partition_name, TRUE);
END;
$$;

-- 2. 分区合并测试
--------------------------

-- 2.1 创建分区合并函数
CREATE OR REPLACE FUNCTION review_system.merge_partitions(
    p_source_partition TEXT,
    p_target_partition TEXT
) RETURNS VOID AS $$
DECLARE
    v_migration_id BIGINT;
    v_row_count BIGINT;
    v_start_time TIMESTAMP;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 记录开始合并
    INSERT INTO review_system.partition_migration_log 
    (operation, source_partition, target_partition, status)
    VALUES ('MERGE', p_source_partition, p_target_partition, 'IN_PROGRESS')
    RETURNING migration_id INTO v_migration_id;
    
    BEGIN
        -- 移动数据到目标分区
        EXECUTE format(
            'INSERT INTO review_system.%I 
             SELECT * FROM review_system.%I',
            p_target_partition, p_source_partition
        );
        
        -- 获取迁移的行数
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        -- 删除源分区
        EXECUTE format(
            'DROP TABLE review_system.%I',
            p_source_partition
        );
        
        -- 更新迁移状态
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            rows_migrated = v_row_count,
            status = 'COMPLETED',
            migration_details = jsonb_build_object(
                'duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
                'target_size', pg_size_pretty(pg_table_size('review_system.' || p_target_partition))
            )
        WHERE migration_id = v_migration_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- 记录错误
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            status = 'FAILED',
            error_message = SQLERRM
        WHERE migration_id = v_migration_id;
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- 2.2 测试分区合并
DO $$
DECLARE
    v_source_partition TEXT;
    v_target_partition TEXT;
BEGIN
    -- 获取上个月和当前月的分区名
    v_source_partition := 'reviews_y' || 
                         to_char(CURRENT_DATE - interval '1 month', 'YYYY') || 
                         'm' || to_char(CURRENT_DATE - interval '1 month', 'MM');
    v_target_partition := 'reviews_y' || 
                         to_char(CURRENT_DATE, 'YYYY') || 
                         'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 执行合并
    PERFORM review_system.merge_partitions(v_source_partition, v_target_partition);
END;
$$;

-- 3. 分区拆分测试
--------------------------

-- 3.1 创建分区拆分函数
CREATE OR REPLACE FUNCTION review_system.split_partition(
    p_source_partition TEXT,
    p_split_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_migration_id BIGINT;
    v_new_partition_name TEXT;
    v_row_count BIGINT;
    v_start_time TIMESTAMP;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 生成新分区名
    v_new_partition_name := 'reviews_y' || 
                           to_char(p_split_date, 'YYYY') || 
                           'm' || to_char(p_split_date, 'MM');
    
    -- 记录开始拆分
    INSERT INTO review_system.partition_migration_log 
    (operation, source_partition, target_partition, status)
    VALUES ('SPLIT', p_source_partition, v_new_partition_name, 'IN_PROGRESS')
    RETURNING migration_id INTO v_migration_id;
    
    BEGIN
        -- 创建新分区
        EXECUTE format(
            'CREATE TABLE review_system.%I 
             (LIKE review_system.reviews_partitioned INCLUDING ALL)',
            v_new_partition_name
        );
        
        -- 移动数据到新分区
        EXECUTE format(
            'WITH moved_rows AS (
                DELETE FROM review_system.%I
                WHERE created_at >= %L
                RETURNING *
             )
             INSERT INTO review_system.%I 
             SELECT * FROM moved_rows',
            p_source_partition,
            p_split_date,
            v_new_partition_name
        );
        
        -- 获取迁移的行数
        EXECUTE format(
            'SELECT COUNT(*) FROM review_system.%I',
            v_new_partition_name
        ) INTO v_row_count;
        
        -- 更新迁移状态
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            rows_migrated = v_row_count,
            status = 'COMPLETED',
            migration_details = jsonb_build_object(
                'duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
                'new_partition_size', pg_size_pretty(pg_table_size('review_system.' || v_new_partition_name)),
                'source_partition_size', pg_size_pretty(pg_table_size('review_system.' || p_source_partition))
            )
        WHERE migration_id = v_migration_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- 记录错误
        UPDATE review_system.partition_migration_log
        SET 
            end_time = clock_timestamp(),
            status = 'FAILED',
            error_message = SQLERRM
        WHERE migration_id = v_migration_id;
        
        -- 清理新分区
        EXECUTE format(
            'DROP TABLE IF EXISTS review_system.%I',
            v_new_partition_name
        );
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- 3.2 测试分区拆分
DO $$
DECLARE
    v_source_partition TEXT;
    v_split_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 获取当前月份分区名
    v_source_partition := 'reviews_y' || 
                         to_char(CURRENT_DATE, 'YYYY') || 
                         'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 设置拆分日期为当月15号
    v_split_date := date_trunc('month', CURRENT_DATE) + interval '15 days';
    
    -- 执行拆分
    PERFORM review_system.split_partition(v_source_partition, v_split_date);
END;
$$;

-- 4. 迁移报告生成
--------------------------

-- 4.1 生成迁移操作报告
SELECT 
    operation,
    source_partition,
    target_partition,
    start_time,
    end_time,
    end_time - start_time as duration,
    rows_migrated,
    status,
    error_message,
    migration_details
FROM review_system.partition_migration_log
ORDER BY start_time DESC
LIMIT 10;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理迁移日志
TRUNCATE review_system.partition_migration_log;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.reorganize_partition(TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS review_system.merge_partitions(TEXT, TEXT);
DROP FUNCTION IF EXISTS review_system.split_partition(TEXT, TIMESTAMP WITH TIME ZONE);
*/ 