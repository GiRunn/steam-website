-- 性能测试
DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_execution_time interval;
    v_batch_size integer := 1000;
    v_total_records integer := 10000;
    v_current_batch integer := 0;
BEGIN
    -- 测试大量数据插入性能
    v_start_time := clock_timestamp();
    
    BEGIN
        -- 使用循环分批插入数据
        WHILE v_current_batch < v_total_records LOOP
            FOR i IN 1..v_batch_size LOOP
                EXIT WHEN v_current_batch >= v_total_records;
                
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content, playtime_hours,
                    platform, language, is_recommended
                ) VALUES (
                    (random() * 1000 + 1)::bigint,
                    (random() * 1000 + 1)::bigint,
                    (random() * 5)::numeric(3,2),
                    'Performance test review ' || v_current_batch,
                    (random() * 100)::integer,
                    CASE (random() * 2)::integer 
                        WHEN 0 THEN 'PC'
                        WHEN 1 THEN 'PS5'
                        ELSE 'XBOX'
                    END,
                    CASE (random() * 4)::integer
                        WHEN 0 THEN 'zh-CN'
                        WHEN 1 THEN 'en-US'
                        WHEN 2 THEN 'ja-JP'
                        ELSE 'es-ES'
                    END,
                    random() > 0.5
                );
                
                v_current_batch := v_current_batch + 1;
            END LOOP;
        END LOOP;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '批量数据插入性能测试',
            '性能测试',
            '通过',
            format('插入 %s 条记录, 耗时: %s', v_total_records, v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '批量数据插入性能测试',
            '性能测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 测试复杂查询性能
    BEGIN
        v_start_time := clock_timestamp();
        
        PERFORM COUNT(*) 
        FROM review_system.reviews_partitioned r
        WHERE r.created_at >= CURRENT_DATE - interval '30 days'
        GROUP BY r.game_id, r.platform
        HAVING COUNT(*) > 5;
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '复杂查询性能测试',
            '性能测试',
            '通过',
            format('复杂查询耗时: %s', v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '复杂查询性能测试',
            '性能测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 测试分区查询性能
    BEGIN
        v_start_time := clock_timestamp();
        
        PERFORM COUNT(*) 
        FROM review_system.reviews_partitioned
        WHERE created_at >= CURRENT_DATE - interval '90 days'
        GROUP BY DATE_TRUNC('day', created_at);
        
        v_execution_time := clock_timestamp() - v_start_time;
        
        PERFORM review_system.record_test_result(
            '分区查询性能测试',
            '性能测试',
            '通过',
            format('分区查询耗时: %s', v_execution_time),
            v_execution_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '分区查询性能测试',
            '性能测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 