/******************************************
 * 分区容灾测试
 * 测试目标：验证分区表的容灾恢复和高可用性
 ******************************************/

-- 测试准备
--------------------------
-- 创建容灾测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_disaster_recovery_log (
    recovery_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    partition_name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    data_size_before BIGINT,
    data_size_after BIGINT,
    rows_affected BIGINT,
    status VARCHAR(20),
    error_message TEXT,
    recovery_details JSONB
);

-- 1. 分区损坏模拟和恢复测试
--------------------------

-- 1.1 创建分区损坏模拟函数
CREATE OR REPLACE FUNCTION review_system.simulate_partition_corruption(
    p_partition_name TEXT,
    p_corruption_type VARCHAR(20)  -- 'INDEX', 'DATA', 'BOTH'
) RETURNS void AS $$
DECLARE
    v_recovery_id BIGINT;
    v_data_size_before BIGINT;
BEGIN
    -- 记录开始状态
    SELECT pg_total_relation_size('review_system.' || p_partition_name)
    INTO v_data_size_before;
    
    INSERT INTO review_system.partition_disaster_recovery_log 
    (test_name, test_type, partition_name, data_size_before)
    VALUES (
        'Corruption Recovery Test',
        p_corruption_type,
        p_partition_name,
        v_data_size_before
    ) RETURNING recovery_id INTO v_recovery_id;
    
    -- 模拟不同类型的损坏
    CASE p_corruption_type
        WHEN 'INDEX' THEN
            -- 模拟索引损坏
            EXECUTE format(
                'ALTER TABLE review_system.%I SET UNLOGGED',
                p_partition_name
            );
            PERFORM pg_sleep(1);
            EXECUTE format(
                'ALTER TABLE review_system.%I SET LOGGED',
                p_partition_name
            );
            
        WHEN 'DATA' THEN
            -- 模拟数据损坏
            EXECUTE format(
                'UPDATE review_system.%I SET content = NULL WHERE random() < 0.1',
                p_partition_name
            );
            
        WHEN 'BOTH' THEN
            -- 模拟索引和数据都损坏
            EXECUTE format('
                BEGIN;
                ALTER TABLE review_system.%I SET UNLOGGED;
                UPDATE review_system.%I SET content = NULL WHERE random() < 0.1;
                ALTER TABLE review_system.%I SET LOGGED;
                COMMIT;
                ',
                p_partition_name, p_partition_name, p_partition_name
            );
    END CASE;
    
    -- 更新测试状态
    UPDATE review_system.partition_disaster_recovery_log
    SET 
        status = 'CORRUPTED',
        recovery_details = jsonb_build_object(
            'corruption_type', p_corruption_type,
            'corruption_time', CURRENT_TIMESTAMP
        )
    WHERE recovery_id = v_recovery_id;
END;
$$ LANGUAGE plpgsql;

-- 1.2 创建分区恢复函数
CREATE OR REPLACE FUNCTION review_system.recover_corrupted_partition(
    p_partition_name TEXT,
    p_recovery_type VARCHAR(20)  -- 'REINDEX', 'REBUILD', 'RESTORE'
) RETURNS void AS $$
DECLARE
    v_recovery_id BIGINT;
    v_temp_table TEXT;
    v_data_size_after BIGINT;
BEGIN
    -- 获取最近的损坏记录
    SELECT recovery_id 
    INTO v_recovery_id
    FROM review_system.partition_disaster_recovery_log
    WHERE partition_name = p_partition_name
    AND status = 'CORRUPTED'
    ORDER BY start_time DESC
    LIMIT 1;
    
    IF v_recovery_id IS NULL THEN
        RAISE EXCEPTION 'No corruption record found for partition %', p_partition_name;
    END IF;
    
    -- 执行恢复操作
    CASE p_recovery_type
        WHEN 'REINDEX' THEN
            -- 重建索引
            EXECUTE format('REINDEX TABLE review_system.%I', p_partition_name);
            
        WHEN 'REBUILD' THEN
            -- 重建表结构
            v_temp_table := p_partition_name || '_rebuild';
            
            EXECUTE format(
                'CREATE TABLE review_system.%I 
                 (LIKE review_system.%I INCLUDING ALL)',
                v_temp_table, p_partition_name
            );
            
            EXECUTE format(
                'INSERT INTO review_system.%I 
                 SELECT * FROM review_system.%I 
                 WHERE content IS NOT NULL',
                v_temp_table, p_partition_name
            );
            
            EXECUTE format(
                'DROP TABLE review_system.%I',
                p_partition_name
            );
            
            EXECUTE format(
                'ALTER TABLE review_system.%I RENAME TO %I',
                v_temp_table, p_partition_name
            );
            
        WHEN 'RESTORE' THEN
            -- 从备份恢复
            PERFORM review_system.restore_partition(
                p_partition_name,
                format('/backup/%s_latest.backup', p_partition_name)
            );
    END CASE;
    
    -- 获取恢复后的大小
    SELECT pg_total_relation_size('review_system.' || p_partition_name)
    INTO v_data_size_after;
    
    -- 更新恢复状态
    UPDATE review_system.partition_disaster_recovery_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        data_size_after = v_data_size_after,
        status = 'RECOVERED',
        recovery_details = recovery_details || jsonb_build_object(
            'recovery_type', p_recovery_type,
            'recovery_time', CURRENT_TIMESTAMP,
            'size_change', v_data_size_after - data_size_before
        )
    WHERE recovery_id = v_recovery_id;
END;
$$ LANGUAGE plpgsql;

-- 2. 分区一致性检查测试
--------------------------

-- 2.1 创建一致性检查函数
CREATE OR REPLACE FUNCTION review_system.check_partition_consistency(
    p_partition_name TEXT
) RETURNS TABLE (
    check_item TEXT,
    status TEXT,
    details JSONB
) AS $$
BEGIN
    -- 检查索引一致性
    RETURN QUERY
    SELECT 
        'INDEX_CONSISTENCY'::TEXT,
        CASE WHEN pg_indexes_size('review_system.' || p_partition_name) > 0 
             THEN 'OK' ELSE 'FAILED' END,
        jsonb_build_object(
            'index_size', pg_size_pretty(pg_indexes_size('review_system.' || p_partition_name)),
            'index_count', (
                SELECT COUNT(*) 
                FROM pg_indexes 
                WHERE schemaname = 'review_system' 
                AND tablename = p_partition_name
            )
        );
    
    -- 检查数据完整性
    RETURN QUERY
    SELECT 
        'DATA_INTEGRITY'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'FAILED' END,
        jsonb_build_object(
            'null_content_count', COUNT(*),
            'total_rows', COUNT(*) OVER ()
        )
    FROM review_system.reviews_partitioned
    WHERE content IS NULL
    AND tablename = p_partition_name;
    
    -- 检查分区边界
    RETURN QUERY
    SELECT 
        'PARTITION_BOUNDARY'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'FAILED' END,
        jsonb_build_object(
            'out_of_range_count', COUNT(*),
            'partition_range', (
                SELECT partition_range 
                FROM review_system.partition_info 
                WHERE partition_name = p_partition_name
            )
        )
    FROM review_system.reviews_partitioned
    WHERE created_at < (
        SELECT range_start FROM review_system.partition_info 
        WHERE partition_name = p_partition_name
    )
    OR created_at >= (
        SELECT range_end FROM review_system.partition_info 
        WHERE partition_name = p_partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- 3. 执行容灾测试
--------------------------

-- 3.1 测试索引损坏和恢复
DO $$
DECLARE
    v_partition_name TEXT;
BEGIN
    -- 获取当前月份分区
    v_partition_name := 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 
                       'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 模拟索引损坏
    PERFORM review_system.simulate_partition_corruption(
        v_partition_name,
        'INDEX'
    );
    
    -- 执行恢复
    PERFORM review_system.recover_corrupted_partition(
        v_partition_name,
        'REINDEX'
    );
    
    -- 检查恢复结果
    PERFORM review_system.check_partition_consistency(
        v_partition_name
    );
END;
$$;

-- 3.2 测试数据损坏和恢复
DO $$
DECLARE
    v_partition_name TEXT;
BEGIN
    -- 获取当前月份分区
    v_partition_name := 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 
                       'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 模拟数据损坏
    PERFORM review_system.simulate_partition_corruption(
        v_partition_name,
        'DATA'
    );
    
    -- 执行恢复
    PERFORM review_system.recover_corrupted_partition(
        v_partition_name,
        'RESTORE'
    );
    
    -- 检查恢复结果
    PERFORM review_system.check_partition_consistency(
        v_partition_name
    );
END;
$$;

-- 4. 容灾测试报告生成
--------------------------

-- 4.1 生成容灾测试报告
SELECT 
    test_name,
    test_type,
    partition_name,
    status,
    duration,
    pg_size_pretty(data_size_before) as size_before,
    pg_size_pretty(data_size_after) as size_after,
    rows_affected,
    recovery_details
FROM review_system.partition_disaster_recovery_log
ORDER BY start_time DESC;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理测试日志
TRUNCATE review_system.partition_disaster_recovery_log;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.simulate_partition_corruption(TEXT, VARCHAR);
DROP FUNCTION IF EXISTS review_system.recover_corrupted_partition(TEXT, VARCHAR);
DROP FUNCTION IF EXISTS review_system.check_partition_consistency(TEXT);
*/ 