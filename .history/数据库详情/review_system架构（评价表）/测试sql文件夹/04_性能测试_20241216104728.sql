-- 性能测试
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
BEGIN
    -- 批量插入测试
    start_time := clock_timestamp();
    
    -- 插入1000条测试数据
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    )
    SELECT 
        99999,  -- game_id
        1000 + generate_series,  -- user_id
        4.0 + random(),  -- rating
        '性能测试评论 #' || generate_series,  -- content
        floor(random() * 100),  -- playtime_hours
        CASE floor(random() * 3)::INTEGER 
            WHEN 0 THEN 'PC'
            WHEN 1 THEN 'PS5'
            ELSE 'XBOX'
        END,  -- platform
        CASE floor(random() * 3)::INTEGER
            WHEN 0 THEN 'zh-CN'
            WHEN 1 THEN 'en-US'
            ELSE 'ja-JP'
        END,  -- language
        random() > 0.5  -- is_recommended
    FROM generate_series(1, 1000);
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    -- 记录性能测试结果
    INSERT INTO review_system.test_results (
        test_name, 
        test_category, 
        result, 
        error_message
    )
    VALUES (
        '批量插入1000条评论性能测试',
        '性能测试',
        execution_time < interval '5 seconds',
        format('执行时间: %s', execution_time)
    );
    
    -- 测试查询性能
    start_time := clock_timestamp();
    
    PERFORM COUNT(*), AVG(rating), COUNT(DISTINCT platform)
    FROM review_system.reviews_partitioned
    WHERE game_id = 99999
    AND created_at >= CURRENT_DATE - interval '1 month';
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    INSERT INTO review_system.test_results (
        test_name, 
        test_category, 
        result, 
        error_message
    )
    VALUES (
        '评论统计查询性能测试',
        '性能测试',
        execution_time < interval '1 second',
        format('执行时间: %s', execution_time)
    );
END;
$$; 