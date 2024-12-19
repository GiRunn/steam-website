-- 边界测试
DO $$
DECLARE
    v_review_id bigint;
    v_test_content text;
    v_start_time timestamp;
    v_end_time timestamp;
    v_execution_time interval;
BEGIN
    -- 1. 超大内容测试
    BEGIN
        v_start_time := clock_timestamp();
        v_test_content := repeat('这是一个超长的评论内容', 100000);
        
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES (
            1001, 1, 4.5, v_test_content
        ) RETURNING review_id INTO v_review_id;
        
        PERFORM review_system.record_test_result(
            '超大内容测试',
            '边界测试',
            '通过',
            format('成功插入大小为 %s 字节的内容', length(v_test_content)),
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '超大内容测试',
            '边界测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 2. 极限值测试
    BEGIN
        v_start_time := clock_timestamp();
        
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours
        ) VALUES 
            (99999999, 99999999, 0.00, '', 99999999),  -- 较大整数
            (1, 1, 5.00, '', 0),                       -- 最小有效值
            (1001, 1, 2.50, '', NULL);                 -- NULL值测试
            
        PERFORM review_system.record_test_result(
            '极限值测试',
            '边界测试',
            '通过',
            '成功测试最大值、最小值和NULL值',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '极限值测试',
            '边界测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 3. 特殊字符测试
    BEGIN
        v_start_time := clock_timestamp();
        
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES 
            (1001, 1, 4.5, '☺️🎮🎲'),                         -- Emoji
            (1001, 1, 4.5, '"><script>alert(1)</script>'),   -- XSS测试
            (1001, 1, 4.5, 'DROP TABLE reviews; --'),        -- SQL注入测试
            (1001, 1, 4.5, E'多行\n内容\n测试');             -- 多行文本
            
        PERFORM review_system.record_test_result(
            '特殊字符测试',
            '边界测试',
            '通过',
            '成功处理Emoji、XSS、SQL注入和多行文本',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '特殊字符测试',
            '边界测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 4. 数值精度测试
    BEGIN
        v_start_time := clock_timestamp();
        
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours
        ) VALUES 
            (1001, 1, 4.99, '精度测试 - 最大有效评分', 0),
            (1001, 1, 0.01, '精度测试 - 最小有效评分', 0),
            (1001, 1, 2.50, '精度测试 - 中间值', 0);
        
        PERFORM review_system.record_test_result(
            '数值精度测试',
            '边界测试',
            '通过',
            '成功测试不同精度的数值',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '数值精度测试',
            '边界测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 5. 事务一致性测试
    BEGIN
        v_start_time := clock_timestamp();
        
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
            PERFORM review_system.record_test_result(
                '事务一致性测试',
                '边界测试',
                '通过',
                '成功验证事务回滚机制',
                clock_timestamp() - v_start_time
            );
            -- 不抛出异常，因为这是预期的行为
            RETURN;
        END;
        
        -- 如果执行到这里，说明没有触发预期的回滚
        PERFORM review_system.record_test_result(
            '事务一致性测试',
            '边界测试',
            '失败',
            '未能正确触发事务回滚',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '事务一致性测试',
            '边界测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 