/******************************************
 * 分区压力测试
 * 测试目标：验证分区表在高负载下的性能和稳定性
 ******************************************/

-- 测试准备
--------------------------
-- 创建压力测试日志表
CREATE TABLE IF NOT EXISTS review_system.partition_stress_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    total_operations BIGINT,
    successful_operations BIGINT,
    failed_operations BIGINT,
    avg_response_time NUMERIC,
    max_response_time NUMERIC,
    min_response_time NUMERIC,
    tps NUMERIC,
    error_details JSONB,
    test_parameters JSONB
);

-- 1. 并发写入压力测试
--------------------------

-- 1.1 创建并发写入测试函数 语法错误
CREATE OR REPLACE FUNCTION review_system.stress_test_concurrent_insert(
    p_concurrent_users INTEGER DEFAULT 10,
    p_operations_per_user INTEGER DEFAULT 1000,
    p_batch_size INTEGER DEFAULT 100
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_success_count BIGINT := 0;
    v_error_count BIGINT := 0;
    v_total_time NUMERIC;
    v_response_times NUMERIC[];
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_stress_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Concurrent Insert Test',
        'WRITE',
        jsonb_build_object(
            'concurrent_users', p_concurrent_users,
            'operations_per_user', p_operations_per_user,
            'batch_size', p_batch_size
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 创建临时表存储响应时间
    CREATE TEMP TABLE temp_response_times (
        operation_id SERIAL,
        response_time NUMERIC
    );
    
    -- 并发插入测试
    FOR i IN 1..p_concurrent_users LOOP
        PERFORM pg_background_launch($$ 
        DECLARE
            v_batch_start TIMESTAMP;
            v_batch_end TIMESTAMP;
            v_response_time NUMERIC;
        BEGIN
            FOR j IN 1..$$ || p_operations_per_user || $$ BY $$ || p_batch_size || $$ LOOP
                v_batch_start := clock_timestamp();
                
                BEGIN
                    INSERT INTO review_system.reviews_partitioned (
                        game_id, user_id, rating, content,
                        playtime_hours, is_recommended, platform, language,
                        created_at
                    )
                    SELECT 
                        9001,
                        1000000 + (j + s),
                        4.0 + random(),
                        'Stress test review ' || (j + s),
                        floor(random() * 100 + 1)::int,
                        random() > 0.5,
                        (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
                        (ARRAY['en-US', 'zh-CN', 'ja-JP'])[floor(random() * 3 + 1)],
                        CURRENT_TIMESTAMP - (random() * interval '30 days')
                    FROM generate_series(1, $$ || p_batch_size || $$) s;
                    
                    v_batch_end := clock_timestamp();
                    v_response_time := EXTRACT(EPOCH FROM (v_batch_end - v_batch_start));
                    
                    INSERT INTO temp_response_times (response_time) 
                    VALUES (v_response_time);
                    
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Error in batch starting at %: %', j, SQLERRM;
                END;
                
                COMMIT;
            END LOOP;
        END;
        $$);
    END LOOP;
    
    -- 等待所有后台工作完成
    PERFORM pg_sleep(10);
    
    v_end_time := clock_timestamp();
    
    -- 计算统计信息
    SELECT 
        COUNT(*),
        AVG(response_time),
        MAX(response_time),
        MIN(response_time)
    INTO 
        v_success_count,
        v_total_time,
        v_response_times[1],
        v_response_times[2]
    FROM temp_response_times;
    
    -- 更新测试结果
    UPDATE review_system.partition_stress_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        total_operations = p_concurrent_users * p_operations_per_user,
        successful_operations = v_success_count,
        failed_operations = (p_concurrent_users * p_operations_per_user) - v_success_count,
        avg_response_time = v_total_time,
        max_response_time = v_response_times[1],
        min_response_time = v_response_times[2],
        tps = v_success_count / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
    
    -- 清理临时表
    DROP TABLE IF EXISTS temp_response_times;
END;
$$ LANGUAGE plpgsql;

-- 2. 并发读取压力测试
--------------------------

-- 2.1 创建并发读取测试函数
CREATE OR REPLACE FUNCTION review_system.stress_test_concurrent_select(
    p_concurrent_users INTEGER DEFAULT 10,
    p_queries_per_user INTEGER DEFAULT 1000
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_success_count BIGINT := 0;
    v_error_count BIGINT := 0;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_stress_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Concurrent Select Test',
        'READ',
        jsonb_build_object(
            'concurrent_users', p_concurrent_users,
            'queries_per_user', p_queries_per_user
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 创建临时表存储响应时间
    CREATE TEMP TABLE temp_response_times (
        operation_id SERIAL,
        response_time NUMERIC
    );
    
    -- 并发查询测试
    FOR i IN 1..p_concurrent_users LOOP
        PERFORM pg_background_launch($$ 
        DECLARE
            v_query_start TIMESTAMP;
            v_query_end TIMESTAMP;
            v_response_time NUMERIC;
            v_random_date TIMESTAMP;
        BEGIN
            FOR j IN 1..$$ || p_queries_per_user || $$ LOOP
                v_query_start := clock_timestamp();
                v_random_date := CURRENT_DATE - (random() * interval '30 days');
                
                BEGIN
                    PERFORM COUNT(*)
                    FROM review_system.reviews_partitioned
                    WHERE created_at >= v_random_date
                    AND created_at < v_random_date + interval '1 day'
                    AND game_id = 9001;
                    
                    v_query_end := clock_timestamp();
                    v_response_time := EXTRACT(EPOCH FROM (v_query_end - v_query_start));
                    
                    INSERT INTO temp_response_times (response_time)
                    VALUES (v_response_time);
                    
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE 'Error in query %: %', j, SQLERRM;
                END;
            END LOOP;
        END;
        $$);
    END LOOP;
    
    -- 等待所有后台工作完成
    PERFORM pg_sleep(10);
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_stress_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        total_operations = p_concurrent_users * p_queries_per_user,
        successful_operations = (
            SELECT COUNT(*) FROM temp_response_times
        ),
        failed_operations = (p_concurrent_users * p_queries_per_user) - (
            SELECT COUNT(*) FROM temp_response_times
        ),
        avg_response_time = (
            SELECT AVG(response_time) FROM temp_response_times
        ),
        max_response_time = (
            SELECT MAX(response_time) FROM temp_response_times
        ),
        min_response_time = (
            SELECT MIN(response_time) FROM temp_response_times
        ),
        tps = (
            SELECT COUNT(*) FROM temp_response_times
        ) / EXTRACT(EPOCH FROM (v_end_time - v_start_time))
    WHERE test_id = v_test_id;
    
    -- 清理临时表
    DROP TABLE IF EXISTS temp_response_times;
END;
$$ LANGUAGE plpgsql;

-- 3. 混合负载压力测试
--------------------------

-- 3.1 创建混合负载测试函数
CREATE OR REPLACE FUNCTION review_system.stress_test_mixed_load(
    p_read_users INTEGER DEFAULT 8,
    p_write_users INTEGER DEFAULT 2,
    p_duration_seconds INTEGER DEFAULT 300
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.partition_stress_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Mixed Load Test',
        'MIXED',
        jsonb_build_object(
            'read_users', p_read_users,
            'write_users', p_write_users,
            'duration_seconds', p_duration_seconds
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 启动读取工作负载
    PERFORM review_system.stress_test_concurrent_select(
        p_read_users,
        p_duration_seconds * 10  -- 假设每秒10个查询
    );
    
    -- 启动写入工作负载
    PERFORM review_system.stress_test_concurrent_insert(
        p_write_users,
        p_duration_seconds * 2   -- 假设每秒2个插入
    );
    
    -- 等待测试完成
    PERFORM pg_sleep(p_duration_seconds);
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.partition_stress_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

-- 4. 执行压力测试
--------------------------

-- 4.1 执行写入压力测试
SELECT review_system.stress_test_concurrent_insert(
    5,    -- 5个并发用户
    1000, -- 每个用户1000次操作
    100   -- 批量大小为100
);

-- 4.2 执行读取压力测试
SELECT review_system.stress_test_concurrent_select(
    10,   -- 10个并发用户
    1000  -- 每个用户1000次查询
);

-- 4.3 执行混合负载测试
SELECT review_system.stress_test_mixed_load(
    8,    -- 8个读取用户
    2,    -- 2个写入用户
    300   -- 运行5分钟
);

-- 5. 压力测试报告生成
--------------------------

-- 5.1 生成综合性能报告
SELECT 
    test_name,
    test_type,
    duration,
    total_operations,
    successful_operations,
    failed_operations,
    ROUND(avg_response_time::numeric, 4) as avg_response_time_sec,
    ROUND(max_response_time::numeric, 4) as max_response_time_sec,
    ROUND(min_response_time::numeric, 4) as min_response_time_sec,
    ROUND(tps::numeric, 2) as transactions_per_second,
    test_parameters
FROM review_system.partition_stress_test_log
ORDER BY start_time DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理压力测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

-- 清理测试日志
TRUNCATE review_system.partition_stress_test_log;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.stress_test_concurrent_insert(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS review_system.stress_test_concurrent_select(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS review_system.stress_test_mixed_load(INTEGER, INTEGER, INTEGER);
*/ 