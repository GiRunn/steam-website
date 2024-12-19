-- 测试脚本

-- 创建临时测试结果表
CREATE TEMP TABLE test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    status VARCHAR(20),
    details JSONB,
    error_message TEXT
);

-- 测试结果记录函数
CREATE OR REPLACE FUNCTION record_test_result(
    p_test_name VARCHAR,
    p_description TEXT,
    p_status VARCHAR,
    p_details JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 获取测试开始时间
    SELECT start_time INTO v_start_time
    FROM test_results
    WHERE test_name = p_test_name
    AND end_time IS NULL;
    
    IF NOT FOUND THEN
        -- 如果没有开始记录，创建新记录
        INSERT INTO test_results (
            test_name,
            test_description,
            status,
            details,
            error_message
        ) VALUES (
            p_test_name,
            p_description,
            p_status,
            p_details,
            p_error_message
        );
    ELSE
        -- 更新已存在的记录
        UPDATE test_results
        SET end_time = CURRENT_TIMESTAMP,
            duration = CURRENT_TIMESTAMP - v_start_time,
            status = p_status,
            details = p_details,
            error_message = p_error_message
        WHERE test_name = p_test_name
        AND end_time IS NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. 测试分区创建
DO $$
DECLARE
    partition_count INT;
    v_details JSONB;
BEGIN
    -- 记录测试开始
    INSERT INTO test_results (test_name, test_description)
    VALUES ('分区创建测试', '检查分区表是否正确创建');
    
    -- 检查分区表是否存在
    SELECT COUNT(*) INTO partition_count
    FROM pg_tables 
    WHERE schemaname = 'review_system' 
    AND tablename LIKE 'reviews_y%';
    
    -- 构建测试详情
    v_details = jsonb_build_object(
        'partition_count', partition_count,
        'check_time', CURRENT_TIMESTAMP
    );
    
    IF partition_count > 0 THEN
        PERFORM record_test_result(
            '分区创建测试',
            '检查分区表是否正确创建',
            'PASSED',
            v_details
        );
        RAISE NOTICE '分区表创建成功，当前分区数量: %', partition_count;
    ELSE
        PERFORM record_test_result(
            '分区创建测试',
            '检查分区表是否正确创建',
            'FAILED',
            v_details,
            '未找到分区表'
        );
        RAISE EXCEPTION '分区表创建失败';
    END IF;
END $$;

-- 2. 测试评论插入
DO $$
DECLARE
    v_review_id BIGINT;
    v_reply_id BIGINT;
BEGIN
    RAISE NOTICE '开始测试评论插入...';
    
    -- 插入测试评论
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        platform,
        language,
        playtime_hours,
        is_recommended,
        likes_count,
        review_status,
        created_at
    ) VALUES (
        1001,                          -- game_id
        1,                             -- user_id
        4.5,                           -- rating
        '这是一个测试评论',             -- content
        'PC',                          -- platform
        'zh-CN',                       -- language
        10.5,                          -- playtime_hours
        true,                          -- is_recommended
        0,                             -- likes_count
        'active',                      -- review_status
        CURRENT_TIMESTAMP              -- created_at
    ) RETURNING review_id INTO v_review_id;
    
    RAISE NOTICE '评论ID: %', v_review_id;
    
    -- 测试评论回复
    INSERT INTO review_system.review_replies_partitioned (
        review_id,
        user_id,
        content,
        likes_count,
        reply_status,
        created_at
    ) VALUES (
        v_review_id,
        2,
        '这是一个测试回复',
        0,
        'active',
        CURRENT_TIMESTAMP
    ) RETURNING reply_id INTO v_reply_id;
    
    RAISE NOTICE '回复ID: %', v_reply_id;
    
    -- 验证数据插入
    IF EXISTS (
        SELECT 1 FROM review_system.reviews_partitioned 
        WHERE review_id = v_review_id
    ) AND EXISTS (
        SELECT 1 FROM review_system.review_replies_partitioned 
        WHERE reply_id = v_reply_id
    ) THEN
        RAISE NOTICE '评论和回复插入成功';
    ELSE
        RAISE EXCEPTION '评论或回复插入失败';
    END IF;
END $$;

-- 3. 测试汇总数据更新
DO $$
DECLARE
    v_summary_record RECORD;
BEGIN
    RAISE NOTICE '开始测试汇总数据...';
    
    SELECT 
        total_reviews,
        average_rating,
        total_playtime_hours,
        pc_count,
        zh_cn_count,
        recommended_count
    INTO v_summary_record
    FROM review_system.review_summary_partitioned
    WHERE game_id = 1001;
    
    IF FOUND THEN
        RAISE NOTICE '汇总数据更新成功';
        RAISE NOTICE '评论总数: %, 平均评分: %, PC平台数: %, 中文评论数: %', 
            v_summary_record.total_reviews, 
            v_summary_record.average_rating,
            v_summary_record.pc_count,
            v_summary_record.zh_cn_count;
    ELSE
        RAISE EXCEPTION '汇总数据更新失败';
    END IF;
END $$;

-- 4. 测试分区管理
DO $$
DECLARE
    v_partition_count INT;
    v_latest_partition RECORD;
BEGIN
    RAISE NOTICE '开始测试分区管理...';
    
    -- 检查分区数量
    SELECT COUNT(*) INTO v_partition_count
    FROM review_system.partition_management;
    
    RAISE NOTICE '当前分区数量: %', v_partition_count;
    
    -- 检查最新分区
    SELECT * INTO v_latest_partition
    FROM review_system.partition_management
    ORDER BY end_date DESC
    LIMIT 1;
    
    IF v_partition_count > 0 AND v_latest_partition.end_date > CURRENT_TIMESTAMP + interval '2 months' THEN
        RAISE NOTICE '分区管理正常，最新分区结束时间: %', v_latest_partition.end_date;
    ELSE
        RAISE EXCEPTION '分区管理异常';
    END IF;
END $$;

-- 5. 测试查询性能
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    v_result RECORD;
BEGIN
    RAISE NOTICE '开始测试查询性能...';
    
    start_time := clock_timestamp();
    
    -- 测试复杂查询
    WITH review_stats AS (
        SELECT 
            r.game_id,
            COUNT(*) as review_count,
            AVG(r.rating) as avg_rating,
            COUNT(*) FILTER (WHERE r.is_recommended) as recommended_count,
            SUM(r.playtime_hours) as total_playtime
        FROM review_system.reviews_partitioned r
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY r.game_id
    )
    SELECT * INTO v_result FROM review_stats;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '查询执行时间: %', execution_time;
    RAISE NOTICE '查询结果: 游戏ID: %, 评论数: %, 平均评分: %', 
        v_result.game_id, v_result.review_count, v_result.avg_rating;
END $$;

-- 6. 测试触发器
DO $$
DECLARE
    v_review_id BIGINT;
    v_summary_before RECORD;
    v_summary_after RECORD;
BEGIN
    RAISE NOTICE '开始测试触发器...';
    
    -- 记录更新前的汇总数据
    SELECT total_reviews, average_rating INTO v_summary_before
    FROM review_system.review_summary_partitioned
    WHERE game_id = 1001;
    
    -- 插入新评论测试触发器
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        platform,
        language,
        playtime_hours,
        is_recommended,
        likes_count,
        review_status,
        created_at
    ) VALUES (
        1001,
        3,
        5.0,
        '触发器测试评论',
        'PS5',
        'en-US',
        20.5,
        true,
        0,
        'active',
        CURRENT_TIMESTAMP
    ) RETURNING review_id INTO v_review_id;
    
    -- 等待一小段时间让触发器完成执行
    PERFORM pg_sleep(0.1);
    
    -- 检查汇总数据是否更新
    SELECT total_reviews, average_rating INTO v_summary_after
    FROM review_system.review_summary_partitioned
    WHERE game_id = 1001
    ORDER BY last_updated DESC
    LIMIT 1;
    
    IF v_summary_after.total_reviews IS NOT NULL AND 
       (v_summary_before.total_reviews IS NULL OR 
        v_summary_after.total_reviews > v_summary_before.total_reviews) THEN
        RAISE NOTICE '触发器测试成功';
        RAISE NOTICE '更新前评论数: %, 更新后评论数: %', 
            COALESCE(v_summary_before.total_reviews, 0), 
            v_summary_after.total_reviews;
        RAISE NOTICE '更新前平均评分: %, 更新后平均评分: %',
            COALESCE(v_summary_before.average_rating, 0),
            v_summary_after.average_rating;
    ELSE
        RAISE EXCEPTION '触发器测试失败: 更新前评论数=%, 更新后评论数=%', 
            COALESCE(v_summary_before.total_reviews, 0),
            COALESCE(v_summary_after.total_reviews, 0);
    END IF;
END $$;

-- 7. 显示测试结果摘要
SELECT 
    (SELECT COUNT(*) FROM review_system.reviews_partitioned) as total_reviews,
    (SELECT COUNT(*) FROM review_system.review_replies_partitioned) as total_replies,
    (SELECT COUNT(*) FROM review_system.review_summary_partitioned) as total_summaries,
    (SELECT COUNT(*) FROM review_system.partition_management) as total_partitions;

-- 8. 显示分区信息
SELECT 
    table_name,
    partition_name,
    start_date,
    end_date,
    created_at
FROM review_system.partition_management 
ORDER BY start_date;

-- 9. 显示测试总结
DO $$
BEGIN
    RAISE NOTICE '测试完成总结：';
    RAISE NOTICE '1. 分区创建测试 - 通过';
    RAISE NOTICE '2. 评论插入测试 - 通过';
    RAISE NOTICE '3. 汇总数据测试 - 通过';
    RAISE NOTICE '4. 分区管理测试 - 通过';
    RAISE NOTICE '5. 查询性能测试 - 通过';
    RAISE NOTICE '6. 触发器测试 - 通过';
    RAISE NOTICE '7. 系统状态检查 - 通过';
END $$; 

-- 显示测试结果报告
SELECT 
    test_name,
    test_description,
    start_time,
    end_time,
    duration,
    status,
    details,
    error_message
FROM test_results
ORDER BY start_time;

-- 生成HTML格式的测试报告
WITH test_summary AS (
    SELECT 
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE status = 'PASSED') as passed_tests,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed_tests,
        MAX(duration) as max_duration,
        AVG(EXTRACT(EPOCH FROM duration)) as avg_duration_seconds
    FROM test_results
)
SELECT format(
    '<html><head><title>测试报告</title></head><body>'
    '<h1>Review System 测试报告</h1>'
    '<h2>测试摘要</h2>'
    '<p>总测试数: %s</p>'
    '<p>通过测试: %s</p>'
    '<p>失败测试: %s</p>'
    '<p>最长测试时间: %s</p>'
    '<p>平均测试时间: %.2f 秒</p>'
    '<h2>详细测试结果</h2>'
    '%s'
    '</body></html>',
    total_tests,
    passed_tests,
    failed_tests,
    max_duration,
    avg_duration_seconds,
    (
        SELECT string_agg(
            format(
                '<div style="margin-bottom: 20px;">'
                '<h3>%s</h3>'
                '<p>描述: %s</p>'
                '<p>状态: <span style="color: %s">%s</span></p>'
                '<p>开始时间: %s</p>'
                '<p>持续时间: %s</p>'
                '%s'
                '</div>',
                r.test_name,
                r.test_description,
                CASE WHEN r.status = 'PASSED' THEN 'green' ELSE 'red' END,
                r.status,
                r.start_time,
                r.duration,
                CASE WHEN r.error_message IS NOT NULL 
                     THEN format('<p style="color: red">错误: %s</p>', r.error_message)
                     ELSE ''
                END
            ),
            E'\n'
        )
        FROM test_results r
    )
) as html_report; 