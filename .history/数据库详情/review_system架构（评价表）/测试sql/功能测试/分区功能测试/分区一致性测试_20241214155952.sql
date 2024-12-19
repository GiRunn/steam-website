/******************************************
 * 分区一致性测试
 * 测试目标：验证分区表的数据一致性和完整性
 ******************************************/

-- 测试准备
--------------------------
-- 创建一致性测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_consistency_log (
    check_id BIGSERIAL PRIMARY KEY,
    check_name VARCHAR(100),
    check_type VARCHAR(50),
    partition_name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    total_records BIGINT,
    inconsistent_records BIGINT,
    status VARCHAR(20),
    error_details JSONB,
    check_details JSONB
);

-- 1. 分区数据完整性测试
--------------------------

-- 1.1 创建数据完整性检查函数
CREATE OR REPLACE FUNCTION review_system.check_data_integrity(
    p_partition_name TEXT
) RETURNS void AS $$
DECLARE
    v_check_id BIGINT;
    v_total_count BIGINT;
    v_invalid_count BIGINT;
    v_check_details JSONB;
BEGIN
    -- 记录检查开始
    INSERT INTO review_system.partition_consistency_log 
    (check_name, check_type, partition_name)
    VALUES (
        'Data Integrity Check',
        'INTEGRITY',
        p_partition_name
    ) RETURNING check_id INTO v_check_id;
    
    -- 检查必填字段
    WITH integrity_check AS (
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE 
                WHEN game_id IS NULL OR 
                     user_id IS NULL OR 
                     rating IS NULL OR 
                     content IS NULL OR 
                     created_at IS NULL 
                THEN 1 ELSE 0 
            END) as null_count,
            SUM(CASE 
                WHEN rating < 0 OR rating > 5 
                THEN 1 ELSE 0 
            END) as invalid_rating_count,
            SUM(CASE 
                WHEN created_at > CURRENT_TIMESTAMP 
                THEN 1 ELSE 0 
            END) as future_date_count
        FROM review_system.reviews_partitioned
        WHERE tablename = p_partition_name
    )
    SELECT 
        total_count,
        null_count + invalid_rating_count + future_date_count,
        jsonb_build_object(
            'null_fields_count', null_count,
            'invalid_rating_count', invalid_rating_count,
            'future_date_count', future_date_count
        )
    INTO 
        v_total_count,
        v_invalid_count,
        v_check_details
    FROM integrity_check;
    
    -- 更新检查结果
    UPDATE review_system.partition_consistency_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        total_records = v_total_count,
        inconsistent_records = v_invalid_count,
        status = CASE 
            WHEN v_invalid_count = 0 THEN 'PASSED'
            ELSE 'FAILED'
        END,
        check_details = v_check_details
    WHERE check_id = v_check_id;
END;
$$ LANGUAGE plpgsql;

-- 2. 分区边界一致性测试
--------------------------

-- 2.1 创建边界一致性检查函数
CREATE OR REPLACE FUNCTION review_system.check_boundary_consistency(
    p_partition_name TEXT
) RETURNS void AS $$
DECLARE
    v_check_id BIGINT;
    v_total_count BIGINT;
    v_invalid_count BIGINT;
    v_partition_start TIMESTAMP WITH TIME ZONE;
    v_partition_end TIMESTAMP WITH TIME ZONE;
    v_check_details JSONB;
BEGIN
    -- 获取分区边界
    SELECT 
        to_timestamp(substring(p_partition_name from 'y(\d{4})m(\d{2})$'), 'YYYYMM'),
        to_timestamp(substring(p_partition_name from 'y(\d{4})m(\d{2})$'), 'YYYYMM') + interval '1 month'
    INTO v_partition_start, v_partition_end;
    
    -- 记录检查开始
    INSERT INTO review_system.partition_consistency_log 
    (check_name, check_type, partition_name)
    VALUES (
        'Boundary Consistency Check',
        'BOUNDARY',
        p_partition_name
    ) RETURNING check_id INTO v_check_id;
    
    -- 检查边界一致性
    WITH boundary_check AS (
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE 
                WHEN created_at < v_partition_start OR 
                     created_at >= v_partition_end 
                THEN 1 ELSE 0 
            END) as out_of_range_count,
            MIN(created_at) as min_date,
            MAX(created_at) as max_date
        FROM review_system.reviews_partitioned
        WHERE tablename = p_partition_name
    )
    SELECT 
        total_count,
        out_of_range_count,
        jsonb_build_object(
            'partition_start', v_partition_start,
            'partition_end', v_partition_end,
            'min_date', min_date,
            'max_date', max_date,
            'out_of_range_count', out_of_range_count
        )
    INTO 
        v_total_count,
        v_invalid_count,
        v_check_details
    FROM boundary_check;
    
    -- 更新检查结果
    UPDATE review_system.partition_consistency_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        total_records = v_total_count,
        inconsistent_records = v_invalid_count,
        status = CASE 
            WHEN v_invalid_count = 0 THEN 'PASSED'
            ELSE 'FAILED'
        END,
        check_details = v_check_details
    WHERE check_id = v_check_id;
END;
$$ LANGUAGE plpgsql;

-- 3. 分区索引一致性测试
--------------------------

-- 3.1 创建索引一致性检查函数
CREATE OR REPLACE FUNCTION review_system.check_index_consistency(
    p_partition_name TEXT
) RETURNS void AS $$
DECLARE
    v_check_id BIGINT;
    v_total_indexes BIGINT;
    v_invalid_indexes BIGINT;
    v_check_details JSONB;
BEGIN
    -- 记录检查开始
    INSERT INTO review_system.partition_consistency_log 
    (check_name, check_type, partition_name)
    VALUES (
        'Index Consistency Check',
        'INDEX',
        p_partition_name
    ) RETURNING check_id INTO v_check_id;
    
    -- 检查索引一致性
    WITH index_check AS (
        SELECT 
            COUNT(*) as total_indexes,
            SUM(CASE 
                WHEN NOT indisvalid OR NOT indisready 
                THEN 1 ELSE 0 
            END) as invalid_indexes,
            jsonb_agg(jsonb_build_object(
                'index_name', i.indexname,
                'is_valid', i.indisvalid,
                'is_ready', i.indisready,
                'index_def', pg_get_indexdef(i.indexrelid)
            )) as index_details
        FROM pg_indexes idx
        JOIN pg_index i ON idx.indexname = i.indexrelname
        WHERE idx.schemaname = 'review_system'
        AND idx.tablename = p_partition_name
    )
    SELECT 
        total_indexes,
        invalid_indexes,
        jsonb_build_object(
            'indexes', index_details,
            'invalid_count', invalid_indexes
        )
    INTO 
        v_total_indexes,
        v_invalid_indexes,
        v_check_details
    FROM index_check;
    
    -- 更新检查结果
    UPDATE review_system.partition_consistency_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        total_records = v_total_indexes,
        inconsistent_records = v_invalid_indexes,
        status = CASE 
            WHEN v_invalid_indexes = 0 THEN 'PASSED'
            ELSE 'FAILED'
        END,
        check_details = v_check_details
    WHERE check_id = v_check_id;
END;
$$ LANGUAGE plpgsql;

-- 4. 执行一致性测试
--------------------------

-- 4.1 对当前月份分区执行所有一致性检查
DO $$
DECLARE
    v_partition_name TEXT;
BEGIN
    -- 获取当前月份分区名
    v_partition_name := 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 
                       'm' || to_char(CURRENT_DATE, 'MM');
    
    -- 执行数据完整性检查
    PERFORM review_system.check_data_integrity(v_partition_name);
    
    -- 执行边界一致性检查
    PERFORM review_system.check_boundary_consistency(v_partition_name);
    
    -- 执行索引一致性检查
    PERFORM review_system.check_index_consistency(v_partition_name);
END;
$$;

-- 5. 一致性测试报告生成
--------------------------

-- 5.1 生成综合一致性报告
SELECT 
    check_name,
    check_type,
    partition_name,
    status,
    duration,
    total_records,
    inconsistent_records,
    check_details
FROM review_system.partition_consistency_log
WHERE start_time >= CURRENT_DATE
ORDER BY start_time DESC;

-- 5.2 生成问题汇总报告
SELECT 
    partition_name,
    COUNT(*) FILTER (WHERE status = 'FAILED') as failed_checks,
    SUM(inconsistent_records) as total_inconsistencies,
    jsonb_object_agg(
        check_type, 
        CASE WHEN status = 'FAILED' 
        THEN check_details 
        ELSE NULL END
    ) as failure_details
FROM review_system.partition_consistency_log
WHERE status = 'FAILED'
GROUP BY partition_name
ORDER BY failed_checks DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理测试日志
TRUNCATE review_system.partition_consistency_log;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.check_data_integrity(TEXT);
DROP FUNCTION IF EXISTS review_system.check_boundary_consistency(TEXT);
DROP FUNCTION IF EXISTS review_system.check_index_consistency(TEXT);
*/ 