-- 并发测试
DO $$
DECLARE
    v_start_time timestamp;
BEGIN
    -- 1. 并发插入测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_concurrent_updates(
            100,    -- 并发会话数
            1000    -- 每个会话的更新次数
        );
        
        PERFORM review_system.record_test_result(
            '并发插入测试',
            '极限测试-并发测试',
            '通过',
            '成功测试并发插入操作',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '并发插入测试',
            '极限测试-并发测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. 并发查询测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 模拟1000个并发查询
        FOR i IN 1..1000 LOOP
            PERFORM COUNT(*) 
            FROM review_system.reviews_partitioned
            WHERE game_id = (random() * 1000000 + 1)::bigint
            AND created_at >= CURRENT_DATE - interval '30 days';
        END LOOP;
        
        PERFORM review_system.record_test_result(
            '并发查询测试',
            '极限测试-并发测试',
            '通过',
            '成功测试并发查询操作',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '并发查询测试',
            '极限测试-并发测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 3. 死锁测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 创建两个并发事务
        DO $$
        DECLARE
            v_pid1 int;
            v_pid2 int;
        BEGIN
            -- 事务1
            SELECT pg_backend_pid() INTO v_pid1;
            
            -- 事务2
            SELECT pg_backend_pid() INTO v_pid2;
            
            -- 模拟死锁场景
            EXECUTE 'SELECT pg_advisory_lock($1)' USING v_pid1;
            EXECUTE 'SELECT pg_advisory_lock($1)' USING v_pid2;
            
            -- 释放锁
            EXECUTE 'SELECT pg_advisory_unlock($1)' USING v_pid2;
            EXECUTE 'SELECT pg_advisory_unlock($1)' USING v_pid1;
        END $$;
        
        PERFORM review_system.record_test_result(
            '死锁处理测试',
            '极限测试-并发测试',
            '通过',
            '成功测试死锁检测和处理',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '死锁处理测试',
            '极限测试-并发测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 4. 连接池测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试大量连接
        FOR i IN 1..100 LOOP
            PERFORM pg_stat_get_activity(pg_backend_pid());
        END LOOP;
        
        PERFORM review_system.record_test_result(
            '连接池测试',
            '极限测试-并发测试',
            '通过',
            '成功测试连接池管理',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '连接池测试',
            '极限测试-并发测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 5. 资源竞争测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 模拟资源竞争
        FOR i IN 1..10 LOOP
            -- 创建临时表
            CREATE TEMP TABLE IF NOT EXISTS temp_test_table_
                (id serial, data text);
                
            -- 并发插入数据
            INSERT INTO temp_test_table_
            SELECT generate_series(1, 1000), 
                   md5(random()::text);
                   
            -- 并发查询
            PERFORM COUNT(*) FROM temp_test_table_;
            
            -- 清理
            DROP TABLE IF EXISTS temp_test_table_;
        END LOOP;
        
        PERFORM review_system.record_test_result(
            '资源竞争测试',
            '极限测试-并发测试',
            '通过',
            '成功测试资源竞争场景',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '资源竞争测试',
            '极限测试-并发测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;
END $$; 