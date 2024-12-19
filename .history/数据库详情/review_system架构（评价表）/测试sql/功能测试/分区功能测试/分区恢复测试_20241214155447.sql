/******************************************
 * 分区恢复功能测试
 * 测试目标：验证分区表的备份和恢复功能
 ******************************************/

-- 测试准备
--------------------------
-- 创建恢复测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_recovery_log (
    recovery_id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(50),
    partition_name VARCHAR(100),
    backup_file VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    rows_affected BIGINT,
    status VARCHAR(20),
    error_message TEXT,
    recovery_details JSONB
);

-- 1. 分区备份测试
--------------------------

-- 1.1 创建备份函数
CREATE OR REPLACE FUNCTION review_system.backup_partition(
    p_partition_name TEXT,
    p_backup_path TEXT
) RETURNS VOID AS $$
DECLARE
    v_recovery_id BIGINT;
    v_full_backup_path TEXT;
    v_row_count BIGINT;
BEGIN
    -- 记录开始备份
    INSERT INTO review_system.partition_recovery_log 
    (operation, partition_name, backup_file, status)
    VALUES ('BACKUP', p_partition_name, p_backup_path, 'IN_PROGRESS')
    RETURNING recovery_id INTO v_recovery_id;
    
    -- 构建完整备份路径
    v_full_backup_path := p_backup_path || '/' || p_partition_name || '_' || 
                         to_char(CURRENT_TIMESTAMP, 'YYYYMMDD_HH24MISS') || '.backup';
    
    -- 执行备份
    EXECUTE format(
        'COPY review_system.%I TO %L WITH (FORMAT binary)',
        p_partition_name, v_full_backup_path
    );
    
    -- 获取备份的行数
    EXECUTE format('SELECT COUNT(*) FROM review_system.%I', p_partition_name)
    INTO v_row_count;
    
    -- 更新备份状态
    UPDATE review_system.partition_recovery_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        rows_affected = v_row_count,
        status = 'COMPLETED',
        recovery_details = jsonb_build_object(
            'backup_size', pg_size_pretty(pg_table_size('review_system.' || p_partition_name)),
            'backup_path', v_full_backup_path,
            'backup_time', CURRENT_TIMESTAMP
        )
    WHERE recovery_id = v_recovery_id;
    
EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    UPDATE review_system.partition_recovery_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        status = 'FAILED',
        error_message = SQLERRM
    WHERE recovery_id = v_recovery_id;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- 1.2 测试分区备份
DO $$
DECLARE
    v_partition_name TEXT;
    v_backup_path TEXT := '/tmp/review_system_backups'; -- 根据实际环境修改路径
BEGIN
    -- 获取当前月份分区名
    v_partition_name := 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 
                       'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 创建备份目录
    EXECUTE format('CREATE DIRECTORY IF NOT EXISTS %L', v_backup_path);
    
    -- 执行备份
    PERFORM review_system.backup_partition(v_partition_name, v_backup_path);
END;
$$;

-- 2. 分区恢复测试
--------------------------

-- 2.1 创建恢复函数
CREATE OR REPLACE FUNCTION review_system.restore_partition(
    p_partition_name TEXT,
    p_backup_file TEXT,
    p_validate_only BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
    v_recovery_id BIGINT;
    v_temp_table TEXT;
    v_row_count BIGINT;
BEGIN
    -- 记录开始恢复
    INSERT INTO review_system.partition_recovery_log 
    (operation, partition_name, backup_file, status)
    VALUES (
        CASE WHEN p_validate_only THEN 'VALIDATE' ELSE 'RESTORE' END,
        p_partition_name, 
        p_backup_file, 
        'IN_PROGRESS'
    )
    RETURNING recovery_id INTO v_recovery_id;
    
    -- 创建临时表用于恢复验证
    v_temp_table := p_partition_name || '_restore_temp';
    EXECUTE format(
        'CREATE TABLE review_system.%I (LIKE review_system.%I INCLUDING ALL)',
        v_temp_table, p_partition_name
    );
    
    -- 从备份文件恢复数据到临时表
    EXECUTE format(
        'COPY review_system.%I FROM %L WITH (FORMAT binary)',
        v_temp_table, p_backup_file
    );
    
    -- 获取恢复的行数
    EXECUTE format('SELECT COUNT(*) FROM review_system.%I', v_temp_table)
    INTO v_row_count;
    
    IF NOT p_validate_only THEN
        -- 执行实际恢复
        EXECUTE format(
            'BEGIN;
             DELETE FROM review_system.%I;
             INSERT INTO review_system.%I SELECT * FROM review_system.%I;
             COMMIT;',
            p_partition_name, p_partition_name, v_temp_table
        );
    END IF;
    
    -- 更新恢复状态
    UPDATE review_system.partition_recovery_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        rows_affected = v_row_count,
        status = 'COMPLETED',
        recovery_details = jsonb_build_object(
            'restored_size', pg_size_pretty(pg_table_size('review_system.' || v_temp_table)),
            'validate_only', p_validate_only,
            'restore_time', CURRENT_TIMESTAMP
        )
    WHERE recovery_id = v_recovery_id;
    
    -- 清理临时表
    EXECUTE format('DROP TABLE review_system.%I', v_temp_table);
    
EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    UPDATE review_system.partition_recovery_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        status = 'FAILED',
        error_message = SQLERRM
    WHERE recovery_id = v_recovery_id;
    
    -- 清理临时表
    EXECUTE format('DROP TABLE IF EXISTS review_system.%I', v_temp_table);
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- 2.2 测试分区恢复
DO $$
DECLARE
    v_partition_name TEXT;
    v_backup_file TEXT;
BEGIN
    -- 获取最新的备份文件
    SELECT backup_file 
    INTO v_backup_file
    FROM review_system.partition_recovery_log
    WHERE operation = 'BACKUP'
    AND status = 'COMPLETED'
    ORDER BY end_time DESC
    LIMIT 1;
    
    IF v_backup_file IS NULL THEN
        RAISE EXCEPTION 'No valid backup file found';
    END IF;
    
    -- 先验证备份
    PERFORM review_system.restore_partition(
        v_partition_name,
        v_backup_file,
        TRUE  -- 只验证不恢复
    );
    
    -- 执行实际恢复
    PERFORM review_system.restore_partition(
        v_partition_name,
        v_backup_file,
        FALSE  -- 执行实际恢复
    );
END;
$$;

-- 3. 恢复验证测试
--------------------------

-- 3.1 验证数据一致性
WITH original_stats AS (
    SELECT 
        COUNT(*) as row_count,
        AVG(rating) as avg_rating,
        COUNT(DISTINCT user_id) as unique_users
    FROM review_system.reviews_partitioned
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'
),
backup_stats AS (
    SELECT 
        COUNT(*) as row_count,
        AVG(rating) as avg_rating,
        COUNT(DISTINCT user_id) as unique_users
    FROM review_system.reviews_partitioned_restore_temp
)
SELECT 
    o.row_count = b.row_count as rows_match,
    abs(o.avg_rating - b.avg_rating) < 0.0001 as ratings_match,
    o.unique_users = b.unique_users as users_match
FROM original_stats o, backup_stats b;

-- 4. 恢复报告生成
--------------------------

-- 4.1 生成恢复操作报告
SELECT 
    operation,
    partition_name,
    backup_file,
    start_time,
    end_time,
    end_time - start_time as duration,
    rows_affected,
    status,
    error_message,
    recovery_details
FROM review_system.partition_recovery_log
ORDER BY start_time DESC
LIMIT 10;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理恢复日志
TRUNCATE review_system.partition_recovery_log;

-- 清理备份文件
-- 注意：需要系统权限
DO $$
BEGIN
    EXECUTE format(
        'rm -f %L',
        '/tmp/review_system_backups/*'
    );
END;
$$;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.backup_partition(TEXT, TEXT);
DROP FUNCTION IF EXISTS review_system.restore_partition(TEXT, TEXT, BOOLEAN);
*/ 