-- 清理之前的测试结果
TRUNCATE TABLE review_system.test_results;

-- 执行测试框架
BEGIN;
-- 00_测试框架.sql的内容
-- 创建测试结果表
CREATE TABLE IF NOT EXISTS review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(200),
    test_category VARCHAR(50),
    result BOOLEAN,
    error_message TEXT,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT
) RETURNS VOID AS $$
BEGIN
    IF expected = actual THEN
        INSERT INTO review_system.test_results (test_name, test_category, result)
        VALUES (description, '相等性测试', TRUE);
    ELSE
        INSERT INTO review_system.test_results (test_name, test_category, result, error_message)
        VALUES (
            description, 
            '相等性测试', 
            FALSE, 
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试报告函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TABLE (
    测试类别 VARCHAR(50),
    总测试数 BIGINT,
    通过数量 BIGINT,
    失败数量 BIGINT,
    通过率 NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        test_category,
        COUNT(*) as total_tests,
        SUM(CASE WHEN result THEN 1 ELSE 0 END) as passed_tests,
        SUM(CASE WHEN NOT result THEN 1 ELSE 0 END) as failed_tests,
        ROUND(
            (SUM(CASE WHEN result THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100),
            2
        ) as pass_rate
    FROM review_system.test_results
    GROUP BY test_category;
END;
$$ LANGUAGE plpgsql;

-- 01_基础数据测试.sql的内容
DO $$
BEGIN
    -- 清理测试数据
    DELETE FROM review_system.reviews_partitioned WHERE game_id = 99999;
    DELETE FROM review_system.review_replies_partitioned WHERE review_id IN 
        (SELECT review_id FROM review_system.reviews_partitioned WHERE game_id = 99999);
    
    -- 插入测试评论
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1001, 4.5, '这是一个测试评论', 10, 'PC', 'zh-CN', true);
    
    -- 测试评论插入
    PERFORM review_system.assert_equals(
        '测试评论插入',
        1,
        (SELECT COUNT(*) FROM review_system.reviews_partitioned WHERE game_id = 99999)
    );
    
    -- 测试汇总数据更新
    PERFORM review_system.assert_equals(
        '测试汇总数据生成',
        1,
        (SELECT COUNT(*) FROM review_system.review_summary_partitioned WHERE game_id = 99999)
    );
    
    -- 测试评分计算
    PERFORM review_system.assert_equals(
        '测试平均评分计算',
        4.5::DECIMAL(3,2),
        (SELECT average_rating FROM review_system.review_summary_partitioned 
         WHERE game_id = 99999 ORDER BY last_updated DESC LIMIT 1)
    );
END;
$$;

-- 02_分区测试.sql的内容
DO $$
DECLARE
    current_partition_name TEXT;
    future_partition_name TEXT;
    current_date TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    future_date TIMESTAMP WITH TIME ZONE := current_date + INTERVAL '1 month';
BEGIN
    -- 构造分区名称
    current_partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    future_partition_name := 'reviews_y' || to_char(future_date, 'YYYY') || 'm' || to_char(future_date, 'MM');
    
    -- 测试当前月份分区是否存在
    PERFORM review_system.assert_equals(
        '测试当前月份分区存在',
        TRUE,
        EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = current_partition_name
            AND n.nspname = 'review_system'
        )
    );
    
    -- 测试未来分区是否创建
    PERFORM review_system.assert_equals(
        '测试未来月份分区存在',
        TRUE,
        EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = future_partition_name
            AND n.nspname = 'review_system'
        )
    );
    
    -- 测试分区管理表记录
    PERFORM review_system.assert_equals(
        '测试分区管理记录',
        TRUE,
        EXISTS (
            SELECT 1 FROM review_system.partition_management
            WHERE partition_name = current_partition_name
        )
    );
END;
$$;

-- 03_触发器测试.sql的内容
DO $$
DECLARE
    test_review_id BIGINT;
    initial_likes INTEGER;
    updated_likes INTEGER;
BEGIN
    -- 插入测试评论
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1002, 4.0, '这是触发器测试评论', 5, 'PS5', 'zh-CN', true)
    RETURNING review_id INTO test_review_id;
    
    -- 获取初始点赞数
    SELECT likes_count INTO initial_likes 
    FROM review_system.reviews_partitioned 
    WHERE review_id = test_review_id;
    
    -- 更新点赞数
    UPDATE review_system.reviews_partitioned 
    SET likes_count = likes_count + 1
    WHERE review_id = test_review_id;
    
    -- 获取更新后的点赞数
    SELECT likes_count INTO updated_likes 
    FROM review_system.reviews_partitioned 
    WHERE review_id = test_review_id;
    
    -- 测试点赞数更新
    PERFORM review_system.assert_equals(
        '测试点赞数更新',
        initial_likes + 1,
        updated_likes
    );
    
    -- 测试汇总数据更新触发器
    PERFORM review_system.assert_equals(
        '测试汇总数据更新',
        TRUE,
        EXISTS (
            SELECT 1 
            FROM review_system.review_summary_partitioned 
            WHERE game_id = 99999 
            AND total_likes = (
                SELECT SUM(likes_count) 
                FROM review_system.reviews_partitioned 
                WHERE game_id = 99999
            )
        )
    );
END;
$$;

-- 04_性能测试.sql的内容
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

COMMIT;

-- 生成测试报告
SELECT * FROM review_system.generate_test_report();

-- 查看失败的测试详情
SELECT 
    test_name as 测试名称,
    test_category as 测试类别,
    error_message as 错误信息,
    execution_time as 执行时间
FROM review_system.test_results 
WHERE NOT result
ORDER BY execution_time DESC;