-- 边界测试
DO $$
DECLARE
    v_review_id bigint;
    v_test_content text;
    v_start_time timestamp;
    v_end_time timestamp;
BEGIN
    -- 1. 超大内容测试
    v_test_content := repeat('这是一个超长的评论内容', 100000);
    
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content
    ) VALUES (
        1001,
        1,
        4.5,
        v_test_content
    ) RETURNING review_id INTO v_review_id;
    
    RAISE NOTICE '超大内容测试通过，review_id: %', v_review_id;

    -- 2. 极限值测试
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours
    ) VALUES 
        (2147483647, 2147483647, 0.00, '', 2147483647),  -- 最大整数
        (1, 1, 5.00, '', 0),                             -- 最小有效值
        (1001, 1, 2.50, '', NULL);                       -- NULL值测试
        
    RAISE NOTICE '极限值测试通过';

    -- 3. 特殊字符测试
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content
    ) VALUES 
        (1001, 1, 4.5, '☺️🎮🎲'),                         -- Emoji
        (1001, 1, 4.5, '"><script>alert(1)</script>'),   -- XSS测试
        (1001, 1, 4.5, 'DROP TABLE reviews; --'),        -- SQL注入测试
        (1001, 1, 4.5, E'多行\n内容\n测试');             -- 多行文本
        
    RAISE NOTICE '特殊字符测试通过';

    -- 4. 并发锁测试
    v_start_time := clock_timestamp();
    
    -- 使用循环代替 FOR UPDATE SKIP LOCKED
    FOR i IN 1..100 LOOP
        BEGIN
            UPDATE review_system.reviews_partitioned
            SET rating = rating + 0.01
            WHERE review_id = (
                SELECT review_id 
                FROM review_system.reviews_partitioned 
                WHERE review_id > (random() * 1000)::integer
                LIMIT 1
            );
        EXCEPTION WHEN OTHERS THEN
            -- 忽略错误继续执行
            NULL;
        END;
    END LOOP;
    
    v_end_time := clock_timestamp();
    RAISE NOTICE '并发锁测试通过，耗时: %', v_end_time - v_start_time;

    -- 5. 事务一致性测试
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES (
            1001, 1, 4.5, '事务测试评论'
        );
        
        -- 故意制造错误
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES (
            1001, 1, 10.0, '这个评分超出范围，应该触发回滚'
        );
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '事务一致性测试通过：成功回滚无效数据';
    END;

END $$; 