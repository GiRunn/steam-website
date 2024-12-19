-- 开始测试事务
BEGIN;

-- 清理之前的测试结果
TRUNCATE TABLE review_system.test_results;

-- 执行基础数据测试
DO $$
BEGIN
    RAISE NOTICE '开始执行基础数据测试...';
    
    -- 测试评论插入
    PERFORM review_system.run_test(
        '评论插入测试',
        '基础数据测试',
        $sql$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES (
            1001, 1, 4.5, '这是一个测试评论', 10, 
            'PC', 'zh-CN', true
        ) RETURNING review_id;
        $sql$
    );

    -- 测试评论回复插入
    PERFORM review_system.run_test(
        '评论回复插入测试',
        '基础数据测试',
        $sql$
        INSERT INTO review_system.review_replies_partitioned (
            review_id, user_id, content, language
        ) VALUES (
            1, 2, '这是一个测试回复', 'zh-CN'
        ) RETURNING reply_id;
        $sql$
    );

    -- 测试数据完整性约束
    PERFORM review_system.run_test(
        '评分范围约束测试',
        '基础数据测试',
        $sql$
        BEGIN
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (
                1001, 1, 5.5, '这个评分应该失败'
            );
            RAISE EXCEPTION '约束测试失败：允许了超出范围的评分';
        EXCEPTION WHEN check_violation THEN
            RETURN;
        END;
        $sql$
    );
END $$;

-- 执行分区测试
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    partition_name text;
BEGIN
    RAISE NOTICE '开始执行分区测试...';
    
    -- 测试当前月份分区是否存在
    partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    
    PERFORM review_system.run_test(
        '当前月份分区存在性测试',
        '分区测试',
        format($sql$
        SELECT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = %L
            AND n.nspname = 'review_system'
        );
        $sql$, partition_name)
    );

    -- 测试未来分区创建
    PERFORM review_system.run_test(
        '未来分区创建测试',
        '分区测试',
        $sql$
        SELECT review_system.create_future_partitions(2);
        $sql$
    );
END $$;

-- 执行触发器测试
DO $$
BEGIN
    RAISE NOTICE '开始执行触发器测试...';
    
    -- 测试评论统计触发器
    PERFORM review_system.run_test(
        '评论统计触发器测试',
        '触发器测试',
        $sql$
        WITH inserted_review AS (
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, platform, language, is_recommended
            ) VALUES (
                1001, 1, 4.5, '触发器测试评论', 'PC', 'zh-CN', true
            ) RETURNING review_id, game_id
        )
        SELECT EXISTS (
            SELECT 1
            FROM review_system.review_summary_partitioned s
            JOIN inserted_review r ON s.game_id = r.game_id
            WHERE s.total_reviews > 0
        );
        $sql$
    );
END $$;

-- 执行性能测试
DO $$
BEGIN
    RAISE NOTICE '开始执行性能测试...';
    
    -- 测试大量数据插入性能
    PERFORM review_system.run_test(
        '批量数据插入性能测试',
        '性能测试',
        $sql$
        WITH RECURSIVE generate_reviews AS (
            SELECT 
                generate_series(1, 1000) as id,
                (random() * 1000 + 1)::bigint as game_id,
                (random() * 1000 + 1)::bigint as user_id,
                (random() * 5)::numeric(3,2) as rating,
                'Performance test review ' || generate_series as content,
                (random() * 100)::integer as playtime_hours,
                CASE (random() * 2)::integer 
                    WHEN 0 THEN 'PC'
                    WHEN 1 THEN 'PS5'
                    ELSE 'XBOX'
                END as platform,
                random() > 0.5 as is_recommended
        )
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, is_recommended
        )
        SELECT 
            game_id, user_id, rating, content, playtime_hours,
            platform, is_recommended
        FROM generate_reviews;
        $sql$
    );
END $$;

-- 生成并显示测试报告
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '测试执行完成，生成报告：';
    RAISE NOTICE '------------------------';
END $$;

-- 显示测试统计报告
SELECT 
    类别,
    总测试数,
    通过数,
    失败数,
    通过率,
    平均执行时间
FROM review_system.generate_test_report();

-- 显示失败的测试详情
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '失败测试详情：';
    RAISE NOTICE '------------------------';
END $$;

SELECT 
    test_name as "测试名称",
    test_category as "测试类别",
    status as "状态",
    error_message as "错误信息",
    execution_time as "执行时间",
    executed_at as "执行时间"
FROM review_system.test_results 
WHERE status = '失败'
ORDER BY executed_at;

-- 显示性能测试结果
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '性能测试结果：';
    RAISE NOTICE '------------------------';
END $$;

SELECT 
    test_name as "测试名称",
    execution_time as "执行时间"
FROM review_system.test_results 
WHERE test_category = '性能测试'
ORDER BY execution_time DESC;

COMMIT;

-- 提示测试完成
DO $$
BEGIN
    RAISE NOTICE '------------------------';
    RAISE NOTICE '所有测试执行完成！';
    RAISE NOTICE '------------------------';
END $$;