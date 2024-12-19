-- 性能测试
DO $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    execution_time interval;
    v_review_id bigint;
BEGIN
    -- 测试大量数据插入性能
    start_time := clock_timestamp();
    
    -- 使用循环代替 WITH RECURSIVE
    FOR i IN 1..10000 LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id,
            user_id,
            rating,
            content,
            playtime_hours,
            platform,
            language,
            is_recommended
        ) VALUES (
            (random() * 1000 + 1)::bigint,
            (random() * 1000 + 1)::bigint,
            (random() * 5)::numeric(3,2),
            'Performance test review ' || i,
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
        
        IF i % 1000 = 0 THEN
            COMMIT;
            RAISE NOTICE '已插入 % 条记录', i;
        END IF;
    END LOOP;
    
    COMMIT;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '批量插入性能测试完成，耗时: %', execution_time;

    -- 测试复杂查询性能
    start_time := clock_timestamp();
    
    -- 执行复杂统计查询
    SELECT COUNT(*) 
    FROM review_system.reviews_partitioned r
    WHERE r.created_at >= CURRENT_DATE - interval '30 days'
    GROUP BY r.game_id, r.platform
    HAVING COUNT(*) > 5;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '复杂查询性能测试完成，耗时: %', execution_time;

    -- 测试分区查询性能
    start_time := clock_timestamp();
    
    SELECT COUNT(*) 
    FROM review_system.reviews_partitioned
    WHERE created_at >= CURRENT_DATE - interval '90 days'
    GROUP BY DATE_TRUNC('day', created_at);
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '分区查询性能测试完成，耗时: %', execution_time;

END $$; 