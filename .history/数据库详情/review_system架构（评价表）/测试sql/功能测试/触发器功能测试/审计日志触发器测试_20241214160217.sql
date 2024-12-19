/******************************************
 * 审计日志触发器测试
 * 测试目标：验证审计日志的记录功能和完整性
 ******************************************/

-- 测试准备
--------------------------
-- 创建审计测试日志表
CREATE TABLE IF NOT EXISTS review_system.audit_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    operation_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    expected_records BIGINT,
    actual_records BIGINT,
    test_status VARCHAR(20),
    error_message TEXT,
    test_details JSONB
);

-- 1. 插入操作审计测试
--------------------------

-- 1.1 测试单条记录审计
DO $$
DECLARE
    v_test_id BIGINT;
    v_review_id BIGINT;
    v_audit_count BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.audit_test_log 
    (test_name, test_type, operation_type)
    VALUES (
        'Single Insert Audit Test',
        'AUDIT',
        'INSERT'
    ) RETURNING test_id INTO v_test_id;
    
    -- 执行插入操作
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content,
        playtime_hours, is_recommended, platform, language
    ) VALUES (
        9001, 901, 4.5, '审计测试评论',
        10, true, 'PC', 'zh-CN'
    ) RETURNING review_id INTO v_review_id;
    
    -- 验证审计日志
    SELECT COUNT(*)
    INTO v_audit_count
    FROM review_system.review_audit_log
    WHERE operation = 'INSERT'
    AND record_id = v_review_id
    AND table_name = 'reviews_partitioned'
    AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute';
    
    -- 更新测试结果
    UPDATE review_system.audit_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        expected_records = 1,
        actual_records = v_audit_count,
        test_status = CASE 
            WHEN v_audit_count = 1 THEN 'PASSED'
            ELSE 'FAILED'
        END,
        test_details = jsonb_build_object(
            'review_id', v_review_id,
            'audit_count', v_audit_count,
            'audit_records', (
                SELECT jsonb_agg(row_to_json(a))
                FROM review_system.review_audit_log a
                WHERE record_id = v_review_id
                AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
            )
        )
    WHERE test_id = v_test_id;
END;
$$;

-- 1.2 测试批量插入审计
DO $$
DECLARE
    v_test_id BIGINT;
    v_expected_count INTEGER := 10;
    v_audit_count BIGINT;
    v_min_review_id BIGINT;
    v_max_review_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.audit_test_log 
    (test_name, test_type, operation_type)
    VALUES (
        'Batch Insert Audit Test',
        'AUDIT',
        'BATCH_INSERT'
    ) RETURNING test_id INTO v_test_id;
    
    -- 执行批量插入
    WITH inserted AS (
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content,
            playtime_hours, is_recommended, platform, language
        )
        SELECT 
            9001,
            1000 + generate_series,
            4.0 + random(),
            '批量审计测试评论 ' || generate_series,
            floor(random() * 100 + 1)::int,
            random() > 0.5,
            (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
            (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)]
        FROM generate_series(1, v_expected_count)
        RETURNING review_id
    )
    SELECT MIN(review_id), MAX(review_id)
    INTO v_min_review_id, v_max_review_id
    FROM inserted;
    
    -- 验证审计日志
    SELECT COUNT(*)
    INTO v_audit_count
    FROM review_system.review_audit_log
    WHERE operation = 'INSERT'
    AND record_id BETWEEN v_min_review_id AND v_max_review_id
    AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute';
    
    -- 更新测试结果
    UPDATE review_system.audit_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        expected_records = v_expected_count,
        actual_records = v_audit_count,
        test_status = CASE 
            WHEN v_audit_count = v_expected_count THEN 'PASSED'
            ELSE 'FAILED'
        END,
        test_details = jsonb_build_object(
            'min_review_id', v_min_review_id,
            'max_review_id', v_max_review_id,
            'audit_count', v_audit_count,
            'audit_summary', (
                SELECT jsonb_build_object(
                    'total_records', COUNT(*),
                    'unique_users', COUNT(DISTINCT new_data->>'user_id'),
                    'operation_types', array_agg(DISTINCT operation)
                )
                FROM review_system.review_audit_log
                WHERE record_id BETWEEN v_min_review_id AND v_max_review_id
                AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
            )
        )
    WHERE test_id = v_test_id;
END;
$$;

-- 2. 更新操作审计测试
--------------------------

-- 2.1 测试评分更新审计
DO $$
DECLARE
    v_test_id BIGINT;
    v_affected_count INTEGER;
    v_audit_count BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.audit_test_log 
    (test_name, test_type, operation_type)
    VALUES (
        'Rating Update Audit Test',
        'AUDIT',
        'UPDATE'
    ) RETURNING test_id INTO v_test_id;
    
    -- 执行更新操作
    WITH updated AS (
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.5
        WHERE game_id = 9001
        AND rating <= 4.5
        RETURNING review_id
    )
    SELECT COUNT(*) INTO v_affected_count FROM updated;
    
    -- 验证审计日志
    SELECT COUNT(*)
    INTO v_audit_count
    FROM review_system.review_audit_log
    WHERE operation = 'UPDATE'
    AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
    AND old_data->>'rating' IS DISTINCT FROM new_data->>'rating';
    
    -- 更新测试结果
    UPDATE review_system.audit_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        expected_records = v_affected_count,
        actual_records = v_audit_count,
        test_status = CASE 
            WHEN v_audit_count = v_affected_count THEN 'PASSED'
            ELSE 'FAILED'
        END,
        test_details = jsonb_build_object(
            'affected_count', v_affected_count,
            'audit_count', v_audit_count,
            'rating_changes', (
                SELECT jsonb_agg(jsonb_build_object(
                    'record_id', record_id,
                    'old_rating', old_data->>'rating',
                    'new_rating', new_data->>'rating'
                ))
                FROM review_system.review_audit_log
                WHERE operation = 'UPDATE'
                AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
                AND old_data->>'rating' IS DISTINCT FROM new_data->>'rating'
            )
        )
    WHERE test_id = v_test_id;
END;
$$;

-- 3. 删除操作审计测试
--------------------------

-- 3.1 测试软删除审计
DO $$
DECLARE
    v_test_id BIGINT;
    v_affected_count INTEGER;
    v_audit_count BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.audit_test_log 
    (test_name, test_type, operation_type)
    VALUES (
        'Soft Delete Audit Test',
        'AUDIT',
        'DELETE'
    ) RETURNING test_id INTO v_test_id;
    
    -- 执行软删除
    WITH deleted AS (
        UPDATE review_system.reviews_partitioned
        SET 
            deleted_at = CURRENT_TIMESTAMP,
            review_status = 'deleted'
        WHERE game_id = 9001
        AND deleted_at IS NULL
        AND random() < 0.5
        RETURNING review_id
    )
    SELECT COUNT(*) INTO v_affected_count FROM deleted;
    
    -- 验证审计日志
    SELECT COUNT(*)
    INTO v_audit_count
    FROM review_system.review_audit_log
    WHERE operation = 'UPDATE'
    AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
    AND new_data->>'deleted_at' IS NOT NULL
    AND old_data->>'deleted_at' IS NULL;
    
    -- 更新测试结果
    UPDATE review_system.audit_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        expected_records = v_affected_count,
        actual_records = v_audit_count,
        test_status = CASE 
            WHEN v_audit_count = v_affected_count THEN 'PASSED'
            ELSE 'FAILED'
        END,
        test_details = jsonb_build_object(
            'affected_count', v_affected_count,
            'audit_count', v_audit_count,
            'deleted_records', (
                SELECT jsonb_agg(jsonb_build_object(
                    'record_id', record_id,
                    'old_status', old_data->>'review_status',
                    'new_status', new_data->>'review_status',
                    'deleted_at', new_data->>'deleted_at'
                ))
                FROM review_system.review_audit_log
                WHERE operation = 'UPDATE'
                AND changed_at >= CURRENT_TIMESTAMP - interval '1 minute'
                AND new_data->>'deleted_at' IS NOT NULL
                AND old_data->>'deleted_at' IS NULL
            )
        )
    WHERE test_id = v_test_id;
END;
$$;

-- 4. 审计日志完整性测试
--------------------------

-- 4.1 测试审计字段完整性
SELECT 
    operation,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE old_data IS NOT NULL OR operation = 'INSERT') as valid_old_data,
    COUNT(*) FILTER (WHERE new_data IS NOT NULL OR operation = 'DELETE') as valid_new_data,
    COUNT(*) FILTER (WHERE changed_by IS NOT NULL) as valid_user,
    COUNT(*) FILTER (WHERE changed_at IS NOT NULL) as valid_timestamp
FROM review_system.review_audit_log
WHERE changed_at >= CURRENT_TIMESTAMP - interval '1 hour'
GROUP BY operation
ORDER BY operation;

-- 4.2 测试审计数据一致性
WITH audit_summary AS (
    SELECT 
        operation,
        COUNT(*) as operation_count,
        COUNT(DISTINCT record_id) as unique_records,
        COUNT(DISTINCT changed_by) as unique_users,
        MIN(changed_at) as first_change,
        MAX(changed_at) as last_change
    FROM review_system.review_audit_log
    WHERE changed_at >= CURRENT_TIMESTAMP - interval '1 hour'
    GROUP BY operation
)
SELECT 
    operation,
    operation_count,
    unique_records,
    unique_users,
    last_change - first_change as time_span,
    operation_count::float / EXTRACT(EPOCH FROM (last_change - first_change)) as operations_per_second
FROM audit_summary
ORDER BY operation_count DESC;

-- 5. 审计测试报告生成
--------------------------

-- 5.1 生成测试报告
SELECT 
    test_name,
    test_type,
    operation_type,
    duration,
    expected_records,
    actual_records,
    test_status,
    error_message,
    jsonb_pretty(test_details) as test_details
FROM review_system.audit_test_log
ORDER BY start_time DESC;

-- 5.2 生成汇总报告
SELECT 
    test_type,
    operation_type,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE test_status = 'PASSED') as passed_tests,
    COUNT(*) FILTER (WHERE test_status = 'FAILED') as failed_tests,
    ROUND(AVG(EXTRACT(EPOCH FROM duration))::numeric, 2) as avg_duration_seconds,
    SUM(expected_records) as total_expected_records,
    SUM(actual_records) as total_actual_records
FROM review_system.audit_test_log
GROUP BY test_type, operation_type
ORDER BY test_type, operation_type;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

-- 清理测试日志
TRUNCATE review_system.audit_test_log;

-- 清理审计日志（可选）
DELETE FROM review_system.review_audit_log
WHERE changed_at < CURRENT_TIMESTAMP - interval '1 day';
*/ 