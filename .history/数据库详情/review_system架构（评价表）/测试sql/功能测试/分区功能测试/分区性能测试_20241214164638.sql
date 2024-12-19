/******************************************
 * 分区性能测试
 * 测试目标：验证分区表在各种场景下的性能表现
 ******************************************/

-- 测试准备
--------------------------
-- 创建性能测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_performance_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    rows_processed BIGINT,
    rows_per_second DECIMAL(10,2),
    partition_count INT,
    avg_partition_size BIGINT,
    test_parameters JSONB,
    execution_plan JSONB,
    notes TEXT
);

-- 1. 写入性能测试
--------------------------

-- 1.1 单分区批量写入测试 
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_rows_processed BIGINT := 100000;
    v_batch_size INT := 1000;
    v_current_month DATE := date_trunc('month', CURRENT_DATE);
    v_test_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_performance_log 
    (test_name, test_type, start_time, test_parameters)
    VALUES (
        'Single Partition Bulk Insert',
        'WRITE',
        CURRENT_TIMESTAMP,
        jsonb_build_object(
            'total_rows', v_rows_processed,
            'batch_size', v_batch_size,
            'target_month', v_current_month
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 批量插入数据
    FOR i IN 1..(v_rows_processed/v_batch_size) LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, 
            playtime_hours, is_recommended, platform, language,
            created_at
        )
        SELECT 
            9001,                          -- game_id
            1000000 + (i*v_batch_size + s), -- user_id
            4.0 + random(),                -- rating
            'Performance test review ' || (i*v_batch_size + s), -- content
            floor(random() * 100 + 1)::int, -- playtime_hours
            random() > 0.5,                -- is_recommended
            (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)], -- platform
            (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)], -- language
            v_current_month + (random() * interval '1 month') -- created_at
        FROM generate_series(1, v_batch_size) s;
        
        IF i % 10 = 0 THEN
            COMMIT;
        END IF;
    END LOOP;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_performance_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_rows_processed,
        rows_per_second = v_rows_processed::decimal / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 1.2 跨分区写入测试
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_rows_processed BIGINT := 100000;
    v_batch_size INT := 1000;
    v_test_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_performance_log 
    (test_name, test_type, start_time, test_parameters)
    VALUES (
        'Cross Partition Insert',
        'WRITE',
        CURRENT_TIMESTAMP,
        jsonb_build_object(
            'total_rows', v_rows_processed,
            'batch_size', v_batch_size,
            'months_span', 3
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 批量插入跨越多个月份的数据
    FOR i IN 1..(v_rows_processed/v_batch_size) LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content,
            playtime_hours, is_recommended, platform, language,
            created_at
        )
        SELECT 
            9001,
            2000000 + (i*v_batch_size + s),
            4.0 + random(),
            'Cross partition test review ' || (i*v_batch_size + s),
            floor(random() * 100 + 1)::int,
            random() > 0.5,
            (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
            (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)],
            CURRENT_DATE + (random() * interval '3 months')
        FROM generate_series(1, v_batch_size) s;
        
        IF i % 10 = 0 THEN
            COMMIT;
        END IF;
    END LOOP;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_performance_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        rows_processed = v_rows_processed,
        rows_per_second = v_rows_processed::decimal / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
END;
$$;

-- 2. 读取性能测试
--------------------------

-- 2.1 单分区查询测试
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
    v_execution_plan JSONB;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_performance_log 
    (test_name, test_type, start_time)
    VALUES (
        'Single Partition Query',
        'READ',
        CURRENT_TIMESTAMP
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行查询并捕获执行计划
    EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
    SELECT 
        rating,
        COUNT(*) as review_count,
        AVG(playtime_hours) as avg_playtime
    FROM review_system.reviews_partitioned
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'
    GROUP BY rating
    INTO v_execution_plan;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_performance_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        execution_plan = v_execution_plan
    WHERE test_id = v_test_id;
END;
$$;

-- 2.2 跨分区查询测试
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
    v_execution_plan JSONB;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_performance_log 
    (test_name, test_type, start_time)
    VALUES (
        'Cross Partition Query',
        'READ',
        CURRENT_TIMESTAMP
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 执行跨分区查询并捕获执行计划
    EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
    SELECT 
        date_trunc('month', created_at) as month,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
    FROM review_system.reviews_partitioned
    WHERE created_at >= CURRENT_DATE - interval '3 months'
    GROUP BY date_trunc('month', created_at)
    ORDER BY month
    INTO v_execution_plan;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_performance_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        execution_plan = v_execution_plan
    WHERE test_id = v_test_id;
END;
$$;

-- 3. 并发性能测试
--------------------------

-- 3.1 模拟并发读写
DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_test_id BIGINT;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_performance_log 
    (test_name, test_type, start_time, test_parameters)
    VALUES (
        'Concurrent Read Write',
        'MIXED',
        CURRENT_TIMESTAMP,
        jsonb_build_object(
            'concurrent_sessions', 5,
            'duration_seconds', 60
        )
    ) RETURNING test_id INTO v_test_id;
    
    -- 创建临时函数用于并发测试
    CREATE OR REPLACE FUNCTION review_system.concurrent_test_worker()
    RETURNS void AS $$
    DECLARE
        v_end_time TIMESTAMP;
    BEGIN
        v_end_time := CURRENT_TIMESTAMP + interval '1 minute';
        WHILE CURRENT_TIMESTAMP < v_end_time LOOP
            -- 随机执行读或写操作
            IF random() > 0.5 THEN
                -- 写操作
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content,
                    playtime_hours, is_recommended, platform, language
                ) VALUES (
                    9001,
                    floor(random() * 1000000)::int,
                    4.0 + random(),
                    'Concurrent test review',
                    floor(random() * 100 + 1)::int,
                    random() > 0.5,
                    (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
                    (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)]
                );
            ELSE
                -- 读操作
                PERFORM COUNT(*)
                FROM review_system.reviews_partitioned
                WHERE created_at >= CURRENT_DATE - interval '1 month'
                AND game_id = 9001;
            END IF;
            
            COMMIT;
            PERFORM pg_sleep(0.1); -- 避免过度负载
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    
    -- 启动并发会话
    PERFORM pg_background_launch('SELECT review_system.concurrent_test_worker()')
    FROM generate_series(1, 5);
    
    -- 等待测试完成
    PERFORM pg_sleep(70); -- 稍微多等一会儿
    
    -- 清理
    DROP FUNCTION IF EXISTS review_system.concurrent_test_worker();
    
    -- 更新测试结果
    UPDATE review_system.partition_performance_log
    SET 
        end_time = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - start_time
    WHERE test_id = v_test_id;
END;
$$;

-- 4. 性能报告生成
--------------------------

-- 4.1 生成性能测试报告
SELECT 
    test_name,
    test_type,
    duration,
    rows_processed,
    rows_per_second,
    test_parameters,
    CASE 
        WHEN execution_plan IS NOT NULL 
        THEN jsonb_pretty(execution_plan)
        ELSE NULL
    END as formatted_plan
FROM review_system.partition_performance_log
ORDER BY start_time DESC;

-- 5. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

TRUNCATE review_system.partition_performance_log;

ANALYZE review_system.reviews_partitioned;
*/ 