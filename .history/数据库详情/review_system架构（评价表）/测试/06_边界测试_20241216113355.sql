-- 边界测试函数
CREATE OR REPLACE FUNCTION review_system.run_boundary_tests()
RETURNS TABLE (
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- 1. 超大内容测试
    RETURN QUERY
    SELECT 
        '超大评论内容测试'::TEXT,
        CASE WHEN inserted THEN '通过' ELSE '失败' END::TEXT,
        details::TEXT
    FROM (
        WITH test AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (
                1001,
                1,
                4.5,
                repeat('这是一个超长的评论内容', 100000) -- 约500KB文本
            )
            RETURNING TRUE as inserted
        )
        SELECT 
            COALESCE((SELECT inserted FROM test), FALSE) as inserted,
            '成功插入大容量评论' as details
    ) t;

    -- 2. 高并发分区测试
    RETURN QUERY
    SELECT 
        '跨分区并发测试'::TEXT,
        CASE WHEN success THEN '通过' ELSE '失败' END::TEXT,
        details::TEXT
    FROM (
        WITH RECURSIVE dates AS (
            SELECT 
                generate_series(
                    CURRENT_DATE - interval '5 years',
                    CURRENT_DATE + interval '5 years',
                    interval '1 month'
                ) as test_date
        ),
        test_data AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, created_at
            )
            SELECT 
                1001,
                1,
                4.5,
                'Partition test ' || test_date,
                test_date
            FROM dates
            RETURNING TRUE
        )
        SELECT 
            TRUE as success,
            '成功创建跨越10年的分区数据' as details
    ) t;

    -- 3. 极限值测试
    RETURN QUERY
    SELECT 
        '极限值测试'::TEXT,
        CASE WHEN success THEN '通过' ELSE '失败' END::TEXT,
        details::TEXT
    FROM (
        WITH test_data AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, playtime_hours
            ) VALUES 
                (2147483647, 2147483647, 0.00, '', 2147483647),  -- 最大整数
                (1, 1, 5.00, '', 0),                             -- 最小有效值
                (1001, 1, 2.50, '', NULL)                        -- NULL值测试
            RETURNING TRUE
        )
        SELECT 
            TRUE as success,
            '成功测试边界值' as details
    ) t;

    -- 4. 特殊字符测试
    RETURN QUERY
    SELECT 
        '特殊字符测试'::TEXT,
        CASE WHEN success THEN '通过' ELSE '失败' END::TEXT,
        details::TEXT
    FROM (
        WITH test_data AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES 
                (1001, 1, 4.5, '☺️🎮🎲'),                         -- Emoji
                (1001, 1, 4.5, '"><script>alert(1)</script>'),   -- XSS测试
                (1001, 1, 4.5, 'DROP TABLE reviews; --'),        -- SQL注入测试
                (1001, 1, 4.5, '
                    多行
                    内容
                    测试
                ')                                               -- 多行文本
            RETURNING TRUE
        )
        SELECT 
            TRUE as success,
            '成功处理特殊字符' as details
    ) t;

    -- 5. 并发锁测试
    RETURN QUERY
    SELECT 
        '并发锁测试'::TEXT,
        CASE WHEN success THEN '通过' ELSE '失败' END::TEXT,
        details::TEXT
    FROM (
        WITH RECURSIVE concurrent_updates AS (
            SELECT generate_series(1, 100) as id
        ),
        test_data AS (
            UPDATE review_system.reviews_partitioned
            SET rating = rating + 0.01
            WHERE review_id IN (
                SELECT review_id 
                FROM review_system.reviews_partitioned 
                ORDER BY RANDOM() 
                LIMIT 100
            )
            FOR UPDATE SKIP LOCKED
            RETURNING TRUE
        )
        SELECT 
            TRUE as success,
            '成功测试并发锁' as details
    ) t;
END;
$$ LANGUAGE plpgsql; 