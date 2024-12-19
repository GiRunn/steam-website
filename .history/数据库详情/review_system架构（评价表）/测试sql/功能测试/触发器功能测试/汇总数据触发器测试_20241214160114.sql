/******************************************
 * 汇总数据触发器测试
 * 测试目标：验证评论汇总数据的自动更新功能
 ******************************************/

-- 测试准备
--------------------------
-- 创建触发器测试日志表
CREATE TABLE IF NOT EXISTS review_system.trigger_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    trigger_name VARCHAR(100),
    operation_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    affected_rows BIGINT,
    before_state JSONB,
    after_state JSONB,
    test_status VARCHAR(20),
    error_message TEXT
);

-- 1. 插入触发器测试
--------------------------

-- 1.1 测试单条评论插入
DO $$
DECLARE
    v_test_id BIGINT;
    v_game_id BIGINT := 9001;
    v_before_state JSONB;
    v_after_state JSONB;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.trigger_test_log 
    (test_name, trigger_name, operation_type)
    VALUES (
        'Single Review Insert Test',
        'trg_update_review_summary',
        'INSERT'
    ) RETURNING test_id INTO v_test_id;
    
    -- 获取初始状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'total_playtime_hours', total_playtime_hours,
        'pc_count', pc_count
    )
    INTO v_before_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 插入测试数据
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content,
        playtime_hours, is_recommended, platform, language
    ) VALUES (
        v_game_id, 901, 4.5, '触发器测试评论',
        10, true, 'PC', 'zh-CN'
    );
    
    -- 获取更新后状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'total_playtime_hours', total_playtime_hours,
        'pc_count', pc_count
    )
    INTO v_after_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 更新测试结果
    UPDATE review_system.trigger_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        affected_rows = 1,
        before_state = v_before_state,
        after_state = v_after_state,
        test_status = 'COMPLETED'
    WHERE test_id = v_test_id;
END;
$$;

-- 1.2 测试批量评论插入
DO $$
DECLARE
    v_test_id BIGINT;
    v_game_id BIGINT := 9001;
    v_before_state JSONB;
    v_after_state JSONB;
    v_affected_rows BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.trigger_test_log 
    (test_name, trigger_name, operation_type)
    VALUES (
        'Batch Review Insert Test',
        'trg_update_review_summary',
        'BATCH_INSERT'
    ) RETURNING test_id INTO v_test_id;
    
    -- 获取初始状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'total_playtime_hours', total_playtime_hours,
        'platform_stats', jsonb_build_object(
            'pc_count', pc_count,
            'ps5_count', ps5_count,
            'xbox_count', xbox_count
        )
    )
    INTO v_before_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 批量插入测试数据
    WITH inserted AS (
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content,
            playtime_hours, is_recommended, platform, language
        )
        SELECT 
            v_game_id,
            1000 + generate_series,
            4.0 + random(),
            '批量触发器测试评论 ' || generate_series,
            floor(random() * 100 + 1)::int,
            random() > 0.5,
            (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
            (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)]
        FROM generate_series(1, 100)
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_affected_rows FROM inserted;
    
    -- 获取更新后状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'total_playtime_hours', total_playtime_hours,
        'platform_stats', jsonb_build_object(
            'pc_count', pc_count,
            'ps5_count', ps5_count,
            'xbox_count', xbox_count
        )
    )
    INTO v_after_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 更新测试结果
    UPDATE review_system.trigger_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        affected_rows = v_affected_rows,
        before_state = v_before_state,
        after_state = v_after_state,
        test_status = 'COMPLETED'
    WHERE test_id = v_test_id;
END;
$$;

-- 2. 更新触发器测试
--------------------------

-- 2.1 测试评分更新
DO $$
DECLARE
    v_test_id BIGINT;
    v_game_id BIGINT := 9001;
    v_before_state JSONB;
    v_after_state JSONB;
    v_affected_rows BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.trigger_test_log 
    (test_name, trigger_name, operation_type)
    VALUES (
        'Rating Update Test',
        'trg_update_review_summary',
        'UPDATE'
    ) RETURNING test_id INTO v_test_id;
    
    -- 获取初始状态
    SELECT jsonb_build_object(
        'average_rating', average_rating,
        'positive_rate', positive_rate
    )
    INTO v_before_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 更新评分
    WITH updated AS (
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 1
        WHERE game_id = v_game_id
        AND rating < 4
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_affected_rows FROM updated;
    
    -- 获取更新后状态
    SELECT jsonb_build_object(
        'average_rating', average_rating,
        'positive_rate', positive_rate
    )
    INTO v_after_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 更新测试结果
    UPDATE review_system.trigger_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        affected_rows = v_affected_rows,
        before_state = v_before_state,
        after_state = v_after_state,
        test_status = 'COMPLETED'
    WHERE test_id = v_test_id;
END;
$$;

-- 3. 删除触发器测试
--------------------------

-- 3.1 测试软删除
DO $$
DECLARE
    v_test_id BIGINT;
    v_game_id BIGINT := 9001;
    v_before_state JSONB;
    v_after_state JSONB;
    v_affected_rows BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.trigger_test_log 
    (test_name, trigger_name, operation_type)
    VALUES (
        'Soft Delete Test',
        'trg_update_review_summary',
        'DELETE'
    ) RETURNING test_id INTO v_test_id;
    
    -- 获取初始状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'platform_stats', jsonb_build_object(
            'pc_count', pc_count,
            'ps5_count', ps5_count,
            'xbox_count', xbox_count
        )
    )
    INTO v_before_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 执行软删除
    WITH deleted AS (
        UPDATE review_system.reviews_partitioned
        SET 
            deleted_at = CURRENT_TIMESTAMP,
            review_status = 'deleted'
        WHERE game_id = v_game_id
        AND random() < 0.1
        RETURNING 1
    )
    SELECT COUNT(*) INTO v_affected_rows FROM deleted;
    
    -- 获取更新后状态
    SELECT jsonb_build_object(
        'total_reviews', total_reviews,
        'average_rating', average_rating,
        'platform_stats', jsonb_build_object(
            'pc_count', pc_count,
            'ps5_count', ps5_count,
            'xbox_count', xbox_count
        )
    )
    INTO v_after_state
    FROM review_system.review_summary_partitioned
    WHERE game_id = v_game_id;
    
    -- 更新测试结果
    UPDATE review_system.trigger_test_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time,
        affected_rows = v_affected_rows,
        before_state = v_before_state,
        after_state = v_after_state,
        test_status = 'COMPLETED'
    WHERE test_id = v_test_id;
END;
$$;

-- 4. 触发器测试报告生成
--------------------------

-- 4.1 生成测试报告
SELECT 
    test_name,
    trigger_name,
    operation_type,
    duration,
    affected_rows,
    test_status,
    jsonb_pretty(before_state) as before_state,
    jsonb_pretty(after_state) as after_state,
    error_message
FROM review_system.trigger_test_log
ORDER BY start_time DESC;

-- 4.2 生成汇总统计
SELECT 
    trigger_name,
    operation_type,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE test_status = 'COMPLETED') as successful_tests,
    COUNT(*) FILTER (WHERE test_status = 'FAILED') as failed_tests,
    AVG(EXTRACT(EPOCH FROM duration)) as avg_duration_seconds,
    SUM(affected_rows) as total_affected_rows
FROM review_system.trigger_test_log
GROUP BY trigger_name, operation_type
ORDER BY trigger_name, operation_type;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

-- 清理测试日志
TRUNCATE review_system.trigger_test_log;
*/ 