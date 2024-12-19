/******************************************
 * 混合负载基准测试
 * 测试目标：验证评论系统在混合读写负载下的性能
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

-- 1. 混合负载测试函数
--------------------------

-- 1.1 创建混合负载测试函数
CREATE OR REPLACE FUNCTION review_system.run_mixed_workload_test(
    p_duration_seconds INTEGER DEFAULT 60,
    p_read_ratio NUMERIC DEFAULT 0.7
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_operation_count INTEGER := 0;
    v_read_count INTEGER := 0;
    v_write_count INTEGER := 0;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.performance_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Mixed Workload Test',
        'MIXED',
        jsonb_build_object(
            'duration_seconds', p_duration_seconds,
            'read_ratio', p_read_ratio
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行混合负载测试
    WHILE clock_timestamp() < v_start_time + (p_duration_seconds || ' seconds')::interval LOOP
        -- 根据读写比例决定操作类型
        IF random() < p_read_ratio THEN
            -- 执行读操作
            PERFORM COUNT(*)
            FROM review_system.reviews_partitioned
            WHERE game_id = 9001
            AND created_at >= CURRENT_DATE - interval '30 days';
            
            v_read_count := v_read_count + 1;
        ELSE
            -- 执行写操作
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content,
                playtime_hours, is_recommended, platform, language
            ) VALUES (
                9001,
                1000000 + v_operation_count,
                4.0 + random(),
                '混合负载测试评论 ' || v_operation_count,
                floor(random() * 100 + 1)::int,
                random() > 0.5,
                (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
                (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)]
            );
            
            v_write_count := v_write_count + 1;
        END IF;
        
        v_operation_count := v_operation_count + 1;
        
        -- 每100次操作提交一次事务
        IF v_operation_count % 100 = 0 THEN
            COMMIT;
        END IF;
    END LOOP;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.performance_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_operation_count,
        rows_per_second = v_operation_count / EXTRACT(EPOCH FROM (v_end_time - v_start_time)),
        test_parameters = test_parameters || jsonb_build_object(
            'total_operations', v_operation_count,
            'read_operations', v_read_count,
            'write_operations', v_write_count,
            'actual_read_ratio', v_read_count::numeric / v_operation_count
        )
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

-- 2. 执行混合负载测试
--------------------------

-- 2.1 测试不同读写比例
SELECT review_system.run_mixed_workload_test(30, 0.7);  -- 70% 读, 30% 写
SELECT review_system.run_mixed_workload_test(30, 0.5);  -- 50% 读, 50% 写
SELECT review_system.run_mixed_workload_test(30, 0.3);  -- 30% 读, 70% 写

-- 3. 性能分析
--------------------------

-- 3.1 分析测试结果
WITH test_results AS (
    SELECT 
        test_parameters->>'read_ratio' as read_ratio,
        rows_per_second,
        test_parameters->>'read_operations' as read_ops,
        test_parameters->>'write_operations' as write_ops,
        duration
    FROM review_system.performance_test_log
    WHERE test_name = 'Mixed Workload Test'
    AND start_time >= CURRENT_DATE
)
SELECT 
    read_ratio,
    ROUND(AVG(rows_per_second), 2) as avg_ops_per_second,
    ROUND(AVG(read_ops::numeric), 0) as avg_read_ops,
    ROUND(AVG(write_ops::numeric), 0) as avg_write_ops,
    ROUND(AVG(EXTRACT(EPOCH FROM duration)), 2) as avg_duration_seconds
FROM test_results
GROUP BY read_ratio
ORDER BY read_ratio::numeric DESC;

-- 4. 资源使用分析
--------------------------

-- 4.1 查看测试期间的表大小变化
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'review_system'
AND tablename LIKE 'reviews_%'
ORDER BY tablename;

-- 4.2 查看测试期间的缓存命中率
SELECT 
    schemaname,
    relname,
    heap_blks_read,
    heap_blks_hit,
    CASE 
        WHEN heap_blks_read + heap_blks_hit = 0 THEN 0
        ELSE ROUND(100 * heap_blks_hit::numeric / (heap_blks_read + heap_blks_hit), 2)
    END as cache_hit_ratio
FROM pg_statio_user_tables
WHERE schemaname = 'review_system'
ORDER BY relname;

-- 5. 性能报告生成
--------------------------

-- 5.1 生成详细性能报告
SELECT 
    test_name,
    start_time,
    duration,
    rows_processed,
    rows_per_second,
    jsonb_pretty(test_parameters) as test_parameters,
    notes
FROM review_system.performance_test_log
WHERE test_name = 'Mixed Workload Test'
AND start_time >= CURRENT_DATE
ORDER BY start_time DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

TRUNCATE review_system.performance_test_log;

DROP FUNCTION IF EXISTS review_system.run_mixed_workload_test(INTEGER, NUMERIC);
*/ 