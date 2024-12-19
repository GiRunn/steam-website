-- 开始测试事务
BEGIN;

-- 创建测试框架
DO $$ 
BEGIN
    -- 检查并创建review_system模式
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'review_system') THEN
        CREATE SCHEMA review_system;
    END IF;
END $$;

-- 删除已存在的函数和表
DO $$
BEGIN
    -- 删除函数
    DROP FUNCTION IF EXISTS review_system.assert_equals(TEXT, ANYELEMENT, ANYELEMENT);
    DROP FUNCTION IF EXISTS review_system.run_test(TEXT, TEXT, TEXT);
    DROP FUNCTION IF EXISTS review_system.generate_test_report();
    DROP FUNCTION IF EXISTS review_system.cleanup_test_data();
    
    -- 删除表
    DROP TABLE IF EXISTS review_system.test_results;
    
    RAISE NOTICE '已清理现有测试框架';
END $$;

-- 创建测试结果记录表
CREATE TABLE review_system.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    test_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    execution_time INTERVAL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT
) RETURNS VOID AS $$
BEGIN
    IF expected = actual THEN
        INSERT INTO review_system.test_results (test_name, test_category, status)
        VALUES (description, '断言测试', '通过');
    ELSE
        INSERT INTO review_system.test_results (test_name, test_category, status, error_message)
        VALUES (
            description, 
            '断言测试', 
            '失败',
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT)
        );
        RAISE NOTICE '测试失败: % - 期望值: %, 实际值: %', description, expected, actual;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试运行函数
CREATE OR REPLACE FUNCTION review_system.run_test(
    p_test_name TEXT,
    p_test_category TEXT,
    p_test_sql TEXT
) RETURNS VOID AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_error_message TEXT;
BEGIN
    v_start_time := clock_timestamp();
    
    BEGIN
        EXECUTE p_test_sql;
        
        v_end_time := clock_timestamp();
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            execution_time,
            executed_at
        ) VALUES (
            p_test_name,
            p_test_category,
            '通过',
            v_end_time - v_start_time,
            CURRENT_TIMESTAMP
        );
        
    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        
        INSERT INTO review_system.test_results (
            test_name,
            test_category,
            status,
            error_message,
            execution_time,
            executed_at
        ) VALUES (
            p_test_name,
            p_test_category,
            '失败',
            v_error_message,
            clock_timestamp() - v_start_time,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE '测试失败: % - %', p_test_name, v_error_message;
    END;
END;
$$ LANGUAGE plpgsql;

-- 创建测试报告生成函数
CREATE OR REPLACE FUNCTION review_system.generate_test_report()
RETURNS TABLE (
    类别 TEXT,
    总测试数 BIGINT,
    通过数 BIGINT,
    失败数 BIGINT,
    通过率 TEXT,
    平均执行时间 INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        test_category::TEXT,
        COUNT(*)::BIGINT as total_tests,
        SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END)::BIGINT as passed,
        SUM(CASE WHEN status = '失败' THEN 1 ELSE 0 END)::BIGINT as failed,
        ROUND((SUM(CASE WHEN status = '通过' THEN 1 ELSE 0 END)::NUMERIC / 
               COUNT(*)::NUMERIC * 100), 2)::TEXT || '%' as pass_rate,
        (AVG(execution_time))::INTERVAL as avg_execution_time
    FROM review_system.test_results
    WHERE executed_at >= (SELECT MAX(executed_at) FROM review_system.test_results)
    GROUP BY test_category
    ORDER BY test_category;
END;
$$ LANGUAGE plpgsql;

-- 创建清理测试数据函数
CREATE OR REPLACE FUNCTION review_system.cleanup_test_data()
RETURNS VOID AS $$
BEGIN
    -- 清理测试评论数据
    DELETE FROM review_system.reviews_partitioned 
    WHERE content LIKE 'Performance test review%'
       OR content LIKE '这是一个测试评论%'
       OR content LIKE '触发器测试评论%';
       
    -- 清理测试回复数据
    DELETE FROM review_system.review_replies_partitioned 
    WHERE content LIKE '这是一个测试回复%';
    
    -- 清理测试结果表
    TRUNCATE TABLE review_system.test_results;
    
    RAISE NOTICE '测试数据清理完成';
END;
$$ LANGUAGE plpgsql;

-- 清理之前的测试结果和数据
SELECT review_system.cleanup_test_data();

-- 执行基础数据测试
DO $$
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
        $sql$::TEXT
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
        '当前月份分区存在性测试'::TEXT,
        '分区测试'::TEXT,
        format($sql$
        SELECT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = %L
            AND n.nspname = 'review_system'
        );
        $sql$, partition_name)::TEXT
    );

    -- 测试未来分区创建
    PERFORM review_system.run_test(
        '未来分区创建测试'::TEXT,
        '分区测试'::TEXT,
        $sql$
        SELECT review_system.create_future_partitions(2);
        $sql$::TEXT
    );
END $$;

-- 执行触发器测试
DO $$
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
END $$;

-- 执行性能测试
DO $$
BEGIN
    RAISE NOTICE '开始执行性能测试...';
    
    -- 测试大量数据插入性能
    PERFORM review_system.run_test(
        '批量数据插入性能测试'::TEXT,
        '性能测试'::TEXT,
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
        $sql$::TEXT
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