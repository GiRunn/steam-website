-- 极限测试
DO $$
DECLARE
    v_start_time timestamp;
    v_execution_time interval;
    v_success_count integer := 0;
    v_error_count integer := 0;
    v_test_content text;
BEGIN
    -- 1. 大规模数据测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 生成100万条测试数据
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours,
            platform, language, is_recommended
        )
        SELECT 
            (random() * 1000000 + 1)::bigint,
            (random() * 1000000 + 1)::bigint,
            (random() * 5)::numeric(3,2),
            'Extreme test review ' || generate_series,
            (random() * 10000)::integer,
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
        FROM generate_series(1, 1000000);
        
        PERFORM review_system.record_test_result(
            '大规模数据测试',
            '极限测试',
            '通过',
            '成功插入100万条测试数据',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '大规模数据测试',
            '极限测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 2. 高并发查询测试
    BEGIN
        v_start_time := clock_timestamp();
        v_success_count := 0;
        v_error_count := 0;
        
        -- 模拟1000个并发查询
        FOR i IN 1..1000 LOOP
            BEGIN
                PERFORM COUNT(*) 
                FROM review_system.reviews_partitioned
                WHERE game_id = (random() * 1000000 + 1)::bigint
                AND created_at >= CURRENT_DATE - interval '30 days';
                
                v_success_count := v_success_count + 1;
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;
        END LOOP;
        
        PERFORM review_system.record_test_result(
            '高并发查询测试',
            '极限测试',
            CASE WHEN v_error_count = 0 THEN '通过' ELSE '部分失败' END,
            format('成功: %s, 失败: %s', v_success_count, v_error_count),
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '高并发查询测试',
            '极限测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 3. 复杂统计查询测试
    BEGIN
        v_start_time := clock_timestamp();
        
        WITH RECURSIVE ReviewHierarchy AS (
            -- 基础评论
            SELECT 
                r.review_id,
                r.game_id,
                r.user_id,
                r.rating,
                0 as depth,
                ARRAY[r.review_id] as path
            FROM review_system.reviews_partitioned r
            WHERE r.created_at >= CURRENT_DATE - interval '30 days'
            
            UNION ALL
            
            -- 递归获取回复
            SELECT 
                rr.reply_id,
                rh.game_id,
                rr.user_id,
                NULL::numeric as rating,
                rh.depth + 1,
                rh.path || rr.reply_id
            FROM ReviewHierarchy rh
            JOIN review_system.review_replies_partitioned rr ON rr.review_id = rh.review_id
            WHERE NOT rr.reply_id = ANY(rh.path)  -- 防止循环
            AND rh.depth < 10  -- 限制深度
        ),
        GameStats AS (
            SELECT 
                game_id,
                COUNT(DISTINCT review_id) as review_count,
                COUNT(DISTINCT user_id) as unique_users,
                AVG(rating) FILTER (WHERE depth = 0) as avg_rating,
                MAX(array_length(path, 1)) as max_reply_depth,
                COUNT(*) FILTER (WHERE depth > 0) as total_replies
            FROM ReviewHierarchy
            GROUP BY game_id
        )
        SELECT *
        FROM GameStats
        WHERE review_count >= 10
        ORDER BY avg_rating DESC, review_count DESC;
        
        PERFORM review_system.record_test_result(
            '复杂统计查询测试',
            '极限测试',
            '通过',
            '成功执行复杂递归统计查询',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '复杂统计查询测试',
            '极限测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 4. 系统资源极限测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 生成大量临时数据并进行复杂计算
        WITH RECURSIVE LargeDataSet AS (
            SELECT generate_series as id, random() as value
            FROM generate_series(1, 1000000)
        ),
        Calculations AS (
            SELECT 
                id,
                value,
                1 as iteration
            FROM LargeDataSet
            
            UNION ALL
            
            SELECT 
                c.id,
                c.value * random() + sin(c.iteration::float),
                c.iteration + 1
            FROM Calculations c
            WHERE c.iteration < 10
        )
        SELECT COUNT(*), AVG(value), STDDEV(value)
        FROM Calculations
        GROUP BY iteration;
        
        PERFORM review_system.record_test_result(
            '系统资源极限测试',
            '极限测试',
            '通过',
            '成功执行大规模递归计算',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '系统资源极限测试',
            '极限测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$;