/******************************************
 * 写性能基准测试
 * 测试目标：验证评论系统的写入性能
 ******************************************/

-- 测试准备
--------------------------
-- 创建性能测试日志表（如果不存在）
CREATE TABLE IF NOT EXISTS review_system.performance_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    rows_processed BIGINT,
    rows_per_second DECIMAL(10,2),
    test_parameters JSONB,
    execution_plan JSONB,
    notes TEXT
);

-- 1. 单条插入性能测试
--------------------------

-- 1.1 测试单条评论插入
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type)
    VALUES (
        'Single Insert Performance Test',
        'WRITE'
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行插入
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content,
        playtime_hours, is_recommended, platform, language
    ) VALUES (
        9001, 901, 4.5, '性能测试评论',
        10, true, 'PC', 'zh-CN'
    );
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = 1,
        rows_per_second = 1 / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 2. 批量插入性能测试
--------------------------

-- 2.1 测试批量评论插入
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
    v_batch_size INTEGER := 1000;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Batch Insert Performance Test',
        'WRITE',
        jsonb_build_object('batch_size', v_batch_size)
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行批量插入
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content,
        playtime_hours, is_recommended, platform, language
    )
    SELECT 
        9001,
        1000 + generate_series,
        4.0 + random(),
        '批量性能测试评论 ' || generate_series,
        floor(random() * 100 + 1)::int,
        random() > 0.5,
        (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
        (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)]
    FROM generate_series(1, v_batch_size);
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_batch_size,
        rows_per_second = v_batch_size / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 3. 更新性能测试
--------------------------

-- 3.1 测试单条更新
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type)
    VALUES (
        'Single Update Performance Test',
        'UPDATE'
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行更新
    UPDATE review_system.reviews_partitioned
    SET rating = rating + 0.5
    WHERE review_id = (
        SELECT review_id 
        FROM review_system.reviews_partitioned 
        WHERE game_id = 9001 
        LIMIT 1
    );
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = 1,
        rows_per_second = 1 / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 3.2 测试批量更新
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
    v_affected_rows BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type)
    VALUES (
        'Batch Update Performance Test',
        'UPDATE'
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行批量更新
    WITH updated AS (
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.1
        WHERE game_id = 9001
        AND rating <= 4.5
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_affected_rows FROM updated;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_affected_rows,
        rows_per_second = v_affected_rows / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 4. 删除性能测试
--------------------------

-- 4.1 测试软删除性能
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
    v_affected_rows BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type)
    VALUES (
        'Soft Delete Performance Test',
        'DELETE'
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行软删除
    WITH deleted AS (
        UPDATE review_system.reviews_partitioned
        SET 
            deleted_at = CURRENT_TIMESTAMP,
            review_status = 'deleted'
        WHERE game_id = 9001
        AND deleted_at IS NULL
        AND random() < 0.1
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_affected_rows FROM deleted;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_affected_rows,
        rows_per_second = v_affected_rows / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 5. 性能报告生成
--------------------------

-- 5.1 生成写入性能报告
SELECT 
    test_name,
    test_type,
    duration,
    rows_processed,
    rows_per_second,
    test_parameters,
    notes
FROM review_system.performance_test_log
WHERE test_type IN ('WRITE', 'UPDATE', 'DELETE')
ORDER BY start_time DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

TRUNCATE review_system.performance_test_log;
*/ 