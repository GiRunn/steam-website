-- 性能测试
DO $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    execution_time interval;
    v_review_id bigint;
    v_batch_size integer := 1000;
    v_total_records integer := 10000;
    v_current_batch integer := 0;
BEGIN
    -- 测试大量数据插入性能
    start_time := clock_timestamp();
    
    -- 使用循环分批插入数据
    WHILE v_current_batch < v_total_records LOOP
        -- 开始一个子事务块
        BEGIN
            FOR i IN 1..v_batch_size LOOP
                EXIT WHEN v_current_batch >= v_total_records;
                
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
            
            RAISE NOTICE '已插入 % 条记录', v_current_batch;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '批次插入失败: %', SQLERRM;
        END;
    END LOOP;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '批量插入性能测试完成，耗时: %', execution_time;

    -- 测试复杂查询性能
    start_time := clock_timestamp();
    
    -- 执行复杂统计查询
    PERFORM COUNT(*) 
    FROM review_system.reviews_partitioned r
    WHERE r.created_at >= CURRENT_DATE - interval '30 days'
    GROUP BY r.game_id, r.platform
    HAVING COUNT(*) > 5;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '复杂查询性能测试完成，耗时: %', execution_time;

    -- 测试分区查询性能
    start_time := clock_timestamp();
    
    PERFORM COUNT(*) 
    FROM review_system.reviews_partitioned
    WHERE created_at >= CURRENT_DATE - interval '90 days'
    GROUP BY DATE_TRUNC('day', created_at);
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    RAISE NOTICE '分区查询性能测试完成，耗时: %', execution_time;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '性能测试执行出错: %', SQLERRM;
END $$; 