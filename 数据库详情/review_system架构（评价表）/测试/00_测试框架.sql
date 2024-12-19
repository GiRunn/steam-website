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
    DROP FUNCTION IF EXISTS review_system.run_test(TEXT, TEXT);
    DROP FUNCTION IF EXISTS review_system.generate_test_report();
    DROP FUNCTION IF EXISTS review_system.cleanup_test_data();
    
    -- 删除表
    DROP TABLE IF EXISTS review_system.test_results CASCADE;
    DROP TABLE IF EXISTS review_system.extreme_test_monitor CASCADE;
    
    RAISE NOTICE '已清理现有测试框架';
END $$;

-- 创建极限测试监控表
CREATE TABLE IF NOT EXISTS review_system.extreme_test_monitor (
    monitor_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_phase VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    operations_count INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    cpu_usage FLOAT,
    memory_usage FLOAT,
    active_connections INTEGER,
    error_messages TEXT[],
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- 创建记录测试结果的函数
CREATE OR REPLACE FUNCTION review_system.record_test_result(
    p_test_name TEXT,
    p_test_category TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_execution_time INTERVAL DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.test_results (
        test_name,
        test_category,
        status,
        error_message,
        execution_time
    ) VALUES (
        p_test_name,
        p_test_category,
        p_status,
        p_error_message,
        p_execution_time
    );
END;
$$ LANGUAGE plpgsql;

-- 创建测试辅助函数
CREATE OR REPLACE FUNCTION review_system.assert_equals(
    description TEXT,
    expected ANYELEMENT,
    actual ANYELEMENT
) RETURNS VOID AS $$
BEGIN
    IF expected = actual THEN
        PERFORM review_system.record_test_result(
            description,
            '断言测试',
            '通过'
        );
    ELSE
        PERFORM review_system.record_test_result(
            description,
            '断言测试',
            '失败',
            format('期望值: %s, 实际值: %s', expected::TEXT, actual::TEXT)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建测试运行函数
CREATE OR REPLACE FUNCTION review_system.run_test(
    p_test_name TEXT,
    p_test_category TEXT
) RETURNS VOID AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    v_start_time := clock_timestamp();
    
    BEGIN
        RAISE NOTICE '执行测试: % (%)', p_test_name, p_test_category;
        
        v_end_time := clock_timestamp();
        
        PERFORM review_system.record_test_result(
            p_test_name,
            p_test_category,
            '通过',
            NULL,
            v_end_time - v_start_time
        );
        
    EXCEPTION WHEN OTHERS THEN
        v_end_time := clock_timestamp();
        
        PERFORM review_system.record_test_result(
            p_test_name,
            p_test_category,
            '失败',
            SQLERRM,
            v_end_time - v_start_time
        );
        
        RAISE NOTICE '测试失败: % - %', p_test_name, SQLERRM;
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
    
    -- 清理监控数据
    TRUNCATE TABLE review_system.extreme_test_monitor;
    
    RAISE NOTICE '测试数据清理完成';
END;
$$ LANGUAGE plpgsql;

-- 添加测试用例管理表
CREATE TABLE IF NOT EXISTS review_system.test_cases (
    case_id SERIAL PRIMARY KEY,
    module_name VARCHAR(50) NOT NULL,
    case_name VARCHAR(100) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3, -- 1:高 2:中 3:低
    dependencies TEXT[],        -- 依赖的其他测试用例
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加测试数据生成函数
CREATE OR REPLACE FUNCTION review_system.generate_test_data(
    p_game_count INTEGER DEFAULT 10,
    p_user_count INTEGER DEFAULT 100,
    p_review_count INTEGER DEFAULT 1000
) RETURNS VOID AS $$
DECLARE
    v_game_ids INTEGER[];
    v_user_ids INTEGER[];
    v_languages TEXT[] := ARRAY['zh-CN', 'en-US', 'ja-JP', 'es-ES', 'en-GB'];
    v_platforms TEXT[] := ARRAY['PC', 'PS5', 'XBOX'];
BEGIN
    -- 生成测试游戏数据
    WITH game_data AS (
        SELECT 
            generate_series(1, p_game_count) as id,
            'Test Game ' || generate_series || ' ' || md5(random()::text) as title,
            (random() * 100)::decimal(10,2) as price
    )
    INSERT INTO games (title, base_price, current_price)
    SELECT title, price, price
    FROM game_data
    RETURNING game_id INTO v_game_ids;

    -- 生成测试用户数据
    WITH user_data AS (
        SELECT 
            generate_series(1, p_user_count) as id,
            'test_user_' || generate_series || '_' || md5(random()::text) as username,
            'test_' || md5(random()::text) || '@test.com' as email
    )
    INSERT INTO user_system.users (username, email, password_hash)
    SELECT username, email, md5(random()::text)
    FROM user_data
    RETURNING user_id INTO v_user_ids;

    -- 生成评论数据
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        playtime_hours,
        platform,
        language,
        is_recommended,
        created_at
    )
    SELECT 
        v_game_ids[1 + (random() * (array_length(v_game_ids, 1) - 1))::integer],
        v_user_ids[1 + (random() * (array_length(v_user_ids, 1) - 1))::integer],
        (random() * 5)::decimal(3,2),
        'Test review content ' || generate_series || ': ' || md5(random()::text),
        (random() * 100)::integer,
        v_platforms[1 + (random() * 2)::integer],
        v_languages[1 + (random() * 4)::integer],
        random() > 0.5,
        CURRENT_TIMESTAMP - (random() * interval '90 days')
    FROM generate_series(1, p_review_count);
END;
$$ LANGUAGE plpgsql;

-- 添加测试数据验证函数
CREATE OR REPLACE FUNCTION review_system.verify_test_data()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- 检查数据完整性
    RETURN QUERY
    SELECT 
        '评论数据完整性检查'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN '通过'::TEXT 
            ELSE '失败'::TEXT 
        END,
        format('找到 %s 条评论记录', COUNT(*)::TEXT)
    FROM review_system.reviews_partitioned
    WHERE content LIKE 'Test review content%';

    -- 检查汇总数据一致性
    RETURN QUERY
    WITH ReviewStats AS (
        SELECT 
            game_id,
            COUNT(*) as actual_count,
            AVG(rating) as actual_avg_rating
        FROM review_system.reviews_partitioned
        WHERE deleted_at IS NULL
        GROUP BY game_id
    )
    SELECT 
        '汇总数据一致性检查'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '通过'::TEXT
            ELSE '失败'::TEXT
        END,
        format('发现 %s 条不一致记录', COUNT(*)::TEXT)
    FROM ReviewStats r
    JOIN review_system.review_summary_partitioned s ON r.game_id = s.game_id
    WHERE ABS(r.actual_count - s.total_reviews) > 0
    OR ABS(r.actual_avg_rating - s.average_rating) > 0.01;

    -- 检查分区完整性
    RETURN QUERY
    SELECT 
        '分区完整性检查'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN '通过'::TEXT
            ELSE '失败'::TEXT
        END,
        format('找到 %s 个活动分区', COUNT(*)::TEXT)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'review_system'
    AND c.relname ~ '^reviews_y\d{4}m\d{2}$';
END;
$$ LANGUAGE plpgsql; 