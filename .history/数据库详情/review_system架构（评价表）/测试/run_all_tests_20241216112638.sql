-- 开始测试事务
BEGIN;

-- 检查必要的表是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'review_system' 
        AND table_name = 'reviews_partitioned'
    ) THEN
        RAISE EXCEPTION '必要的表 review_system.reviews_partitioned 不存在';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'review_system' 
        AND table_name = 'review_replies_partitioned'
    ) THEN
        RAISE EXCEPTION '必要的表 review_system.review_replies_partitioned 不存在';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'review_system' 
        AND table_name = 'review_summary_partitioned'
    ) THEN
        RAISE EXCEPTION '必要的表 review_system.review_summary_partitioned 不存在';
    END IF;
END $$;

-- 清理之前的测试结果和数据
SELECT review_system.cleanup_test_data();

-- 执行所有测试
DO $$
BEGIN
    -- 基础数据测试
    BEGIN
        RAISE NOTICE '开始执行基础数据测试...';
        
        -- 测试评论插入
        PERFORM review_system.run_test(
            '评论插入测试'::TEXT,
            '基础数据测试'::TEXT,
            $sql$
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, playtime_hours, 
                platform, language, is_recommended
            ) VALUES (
                1001, 1, 4.5, '这是一个测试评论', 10, 
                'PC', 'zh-CN', true
            ) RETURNING review_id;
            $sql$::TEXT
        );

        -- 测试评论回复插入
        PERFORM review_system.run_test(
            '评论回复插入测试'::TEXT,
            '基础数据测试'::TEXT,
            $sql$
            INSERT INTO review_system.review_replies_partitioned (
                review_id, user_id, content, language
            ) VALUES (
                1, 2, '这是一个测试回复', 'zh-CN'
            ) RETURNING reply_id;
            $sql$::TEXT
        );

        -- 测试数据完整性约束
        PERFORM review_system.run_test(
            '评分范围约束测试'::TEXT,
            '基础数据测试'::TEXT,
            $sql$
            DO $constraint_test$
            BEGIN
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content
                ) VALUES (
                    1001, 1, 5.5, '这个评分应该失败'
                );
                RAISE EXCEPTION '约束测试失败：允许了超出范围的评分';
            EXCEPTION WHEN check_violation THEN
                RETURN;
            END $constraint_test$;
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '基础数据测试失败: %', SQLERRM;
    END;

    -- 分区测试
    BEGIN
        RAISE NOTICE '开始执行分区测试...';
        
        -- 测试当前月份分区是否存在
        PERFORM review_system.run_test(
            '当前月份分区存在性测试'::TEXT,
            '分区测试'::TEXT,
            format(
                $sql$
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relname = %L
                    AND n.nspname = 'review_system'
                );
                $sql$,
                'reviews_y' || to_char(CURRENT_TIMESTAMP, 'YYYY') || 'm' || to_char(CURRENT_TIMESTAMP, 'MM')
            )::TEXT
        );

        -- 测试未来分区创建
        PERFORM review_system.run_test(
            '未来分区创建测试'::TEXT,
            '分区测试'::TEXT,
            $sql$
            SELECT review_system.create_future_partitions(2);
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '分区测试失败: %', SQLERRM;
    END;

    -- 触发器测试
    BEGIN
        RAISE NOTICE '开始执行触发器测试...';
        
        -- 测试评论统计触发器
        PERFORM review_system.run_test(
            '评论统计触发器测试'::TEXT,
            '触发器测试'::TEXT,
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
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '触发器测试失败: %', SQLERRM;
    END;

    -- 性能测试
    BEGIN
        RAISE NOTICE '开始执行性能测试...';
        
        -- 测试大量数据插入性能
        PERFORM review_system.run_test(
            '批量数据插入性能测试'::TEXT,
            '性能测试'::TEXT,
            $sql$
            WITH RECURSIVE generate_reviews AS (
                SELECT 
                    s.id,
                    (random() * 1000 + 1)::bigint as game_id,
                    (random() * 1000 + 1)::bigint as user_id,
                    (random() * 5)::numeric(3,2) as rating,
                    'Performance test review ' || s.id as content,
                    (random() * 100)::integer as playtime_hours,
                    CASE (random() * 2)::integer 
                        WHEN 0 THEN 'PC'
                        WHEN 1 THEN 'PS5'
                        ELSE 'XBOX'
                    END as platform,
                    random() > 0.5 as is_recommended
                FROM generate_series(1, 1000) s(id)
            )
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content, playtime_hours, 
                platform, is_recommended
            )
            SELECT 
                game_id, user_id, rating, content, playtime_hours,
                platform, is_recommended
            FROM generate_reviews;
            $sql$::TEXT
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '性能测试失败: %', SQLERRM;
    END;
END $$;

-- 生成并显示测试报告
DO $$
DECLARE
    v_total_tests INTEGER;
    v_passed_tests INTEGER;
    v_failed_tests INTEGER;
    v_total_time INTERVAL;
BEGIN
    -- 获取测试统计数据
    SELECT 
        COUNT(*),
        SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = '失败' THEN 1 ELSE 0 END),
        SUM(execution_time)
    INTO 
        v_total_tests,
        v_passed_tests,
        v_failed_tests,
        v_total_time
    FROM review_system.test_results;

    -- 显示测试总结
    RAISE NOTICE '====================================';
    RAISE NOTICE '          测试执行总结              ';
    RAISE NOTICE '====================================';
    RAISE NOTICE '总测试数: %', v_total_tests;
    RAISE NOTICE '通过测试: %', v_passed_tests;
    RAISE NOTICE '失败测试: %', v_failed_tests;
    RAISE NOTICE '总执行时间: %', v_total_time;
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
END $$;

-- 显示详细测试报告
RAISE NOTICE '测试类别统计';
RAISE NOTICE '====================================';
SELECT 
    类别 as "测试类别",
    总测试数 as "测试数量",
    通过数 as "通过",
    失败数 as "失败",
    通过率 as "通过率",
    平均执行时间 as "平均耗时"
FROM review_system.generate_test_report();

-- 显示失败的测试详情
DO $$
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM review_system.test_results WHERE status = '失败') THEN
        RAISE NOTICE '';
        RAISE NOTICE '失败测试详情';
        RAISE NOTICE '====================================';
        
        FOR r IN (
            SELECT 
                test_name,
                test_category,
                error_message,
                execution_time,
                executed_at
            FROM review_system.test_results 
            WHERE status = '失败'
            ORDER BY executed_at
        ) LOOP
            RAISE NOTICE '测试名称: %', r.test_name;
            RAISE NOTICE '测试类别: %', r.test_category;
            RAISE NOTICE '错误信息: %', r.error_message;
            RAISE NOTICE '执行时间: %', r.execution_time;
            RAISE NOTICE '执行时间: %', r.executed_at;
            RAISE NOTICE '------------------------------------';
        END LOOP;
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '没有失败的测试！';
        RAISE NOTICE '====================================';
    END IF;
END $$;

-- 显示性能测试结果
DO $$
DECLARE
    r RECORD;
    v_avg_time INTERVAL;
    v_max_time INTERVAL;
    v_min_time INTERVAL;
BEGIN
    SELECT 
        AVG(execution_time),
        MAX(execution_time),
        MIN(execution_time)
    INTO v_avg_time, v_max_time, v_min_time
    FROM review_system.test_results 
    WHERE test_category = '性能测试';

    RAISE NOTICE '';
    RAISE NOTICE '性能测试统计';
    RAISE NOTICE '====================================';
    RAISE NOTICE '平均执行时间: %', v_avg_time;
    RAISE NOTICE '最长执行时间: %', v_max_time;
    RAISE NOTICE '最短执行时间: %', v_min_time;
    RAISE NOTICE '';
    RAISE NOTICE '详细性能测试结果:';
    RAISE NOTICE '------------------------------------';
    
    FOR r IN (
        SELECT 
            test_name,
            execution_time
        FROM review_system.test_results 
        WHERE test_category = '性能测试'
        ORDER BY execution_time DESC
    ) LOOP
        RAISE NOTICE '测试: % - 耗时: %', r.test_name, r.execution_time;
    END LOOP;
END $$;

COMMIT;

-- 提示测试完成
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '          测试执行完成              ';
    RAISE NOTICE '====================================';
    RAISE NOTICE '执行时间: %', clock_timestamp();
    RAISE NOTICE '====================================';
END $$;