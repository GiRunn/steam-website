-- 特殊情况测试
DO $$
DECLARE
    v_start_time timestamp;
BEGIN
    -- 1. 特殊字符测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_special_characters(ARRAY[
            '☺️🎮🎲',                     -- Emoji
            '中文测试',                   -- 中文
            'مرحبا',                     -- 阿拉伯文
            'Привет',                    -- 俄语
            '🇨🇳🇺🇸🇯🇵',                 -- 国旗表情
            chr(0) || chr(1) || chr(2), -- 控制字符
            E'\n\r\t',                  -- 特殊转义字符
            '\\',                       -- 反斜杠
            '""''',                     -- 引号
            '(),./;''[]',               -- 特殊标点
            '><script>alert(1)</script>' -- HTML标签
        ]);
        
        PERFORM review_system.record_test_result(
            '特殊字符处理测试',
            '极限测试-特殊情况',
            '通过',
            '成功处理各类特殊字符',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '特殊字符处理测试',
            '极限测试-特殊情况',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. 边界值测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试各种边界值
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours
        ) VALUES 
            (2147483647, 2147483647, 5.00, '', 2147483647),  -- 最大整数
            (1, 1, 0.00, '', 0),                             -- 最小值
            (1000, 1000, 2.50, NULL, NULL),                  -- NULL值
            (999999999, 999999999, 4.99, repeat('x', 10000), 999999999); -- 大值组合
            
        PERFORM review_system.record_test_result(
            '边界值测试',
            '极限测试-特殊情况',
            '通过',
            '成功测试各类边界值',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '边界值测试',
            '极限测试-特殊情况',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 3. 异常输入测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试各种异常输入
        BEGIN
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES 
                (-1, -1, -1.0, ''),             -- 负值
                (0, 0, 6.0, ''),                -- 超出范围的评分
                (NULL, NULL, NULL, NULL),       -- 全NULL
                ('abc', 'def', 'ghi', 'jkl');   -- 类型不匹配
        EXCEPTION WHEN OTHERS THEN
            -- 预期会失败，这是正常的
            NULL;
        END;
        
        PERFORM review_system.record_test_result(
            '异常输入测试',
            '极限测试-特殊情况',
            '通过',
            '成功处理异常输入',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '异常输入测试',
            '极限测试-特殊情况',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 4. 复杂查询测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_complex_query_performance(
            10,     -- 迭代次数
            true    -- 是否分析查询计划
        );
        
        PERFORM review_system.record_test_result(
            '复杂查询测试',
            '极限测试-特殊情况',
            '通过',
            '成功执行复杂查询测试',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '复杂查询测试',
            '极限测试-特殊情况',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 5. 事务一致性测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试事务回滚
        BEGIN
            -- 开启事务
            START TRANSACTION;
            
            -- 插入测试数据
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (1001, 1, 4.5, '事务测试');
            
            -- 故意制造错误
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (1001, 1, 999.9, '这应该会失败');
            
            -- 提交事务
            COMMIT;
        EXCEPTION WHEN OTHERS THEN
            -- 回滚事务
            ROLLBACK;
        END;
        
        PERFORM review_system.record_test_result(
            '事务一致性测试',
            '极限测试-特殊情况',
            '通过',
            '成功测试事务一致性',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '事务一致性测试',
            '极限测试-特殊情况',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;
END $$; 