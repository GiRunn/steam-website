-- 性能测试用例
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time DECIMAL;
    test_details JSONB;
    i INTEGER;
BEGIN
    -- 1. 批量插入性能测试
    start_time := clock_timestamp();
    
    FOR i IN 1..10000 LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES (
            1001 + (i % 10), -- 测试10个不同的游戏
            i, 
            3.5 + random() * 1.5,
            '这是第' || i || '条性能测试评论，游戏体验不错！',
            floor(random() * 100)::integer,
            CASE floor(random() * 3)::integer 
                WHEN 0 THEN 'PC' 
                WHEN 1 THEN 'PS5' 
                ELSE 'XBOX' 
            END,
            CASE floor(random() * 3)::integer 
                WHEN 0 THEN 'zh-CN' 
                WHEN 1 THEN 'en-US' 
                ELSE 'ja-JP' 
            END,
            random() > 0.5
        );
    END LOOP;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        '性能测试',
        '批量插入测试',
        CASE 
            WHEN execution_time <= 5000 THEN 'SUCCESS'  -- 5秒内完成
            WHEN execution_time <= 10000 THEN 'WARNING' -- 10秒内完成
            ELSE 'FAILURE'
        END,
        execution_time,
        '期望在5秒内完成10000条记录插入',
        '实际耗时: ' || ROUND(execution_time/1000, 2) || '秒',
        NULL,
        jsonb_build_object(
            '每秒插入记录数', ROUND(10000/(execution_time/1000), 2),
            '总插入记录数', 10000
        )
    );

    -- 2. 复杂查询性能测试
    start_time := clock_timestamp();
    
    WITH query_stats AS (
        SELECT 
            r.game_id,
            COUNT(*) as review_count,
            AVG(r.rating) as avg_rating,
            COUNT(DISTINCT r.platform) as platform_count,
            COUNT(DISTINCT r.language) as language_count,
            SUM(CASE WHEN r.is_recommended THEN 1 ELSE 0 END) as recommended_count,
            AVG(r.playtime_hours) as avg_playtime
        FROM review_system.reviews_partitioned r
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND r.deleted_at IS NULL
            AND r.review_status = 'active'
        GROUP BY r.game_id
        HAVING COUNT(*) >= 10  -- 只统计有10条以上评论的游戏
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT 100
    )
    SELECT jsonb_build_object(
        '统计游戏数', COUNT(*),
        '平均评分范围', jsonb_build_object(
            '最高', MAX(avg_rating),
            '最低', MIN(avg_rating)
        ),
        '评论数范围', jsonb_build_object(
            '最多', MAX(review_count),
            '最少', MIN(review_count)
        ),
        '平均游戏时长', AVG(avg_playtime)
    ) INTO test_details
    FROM query_stats;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        '性能测试',
        '复杂统计查询测试',
        CASE 
            WHEN execution_time <= 100 THEN 'SUCCESS'  -- 100ms内完成
            WHEN execution_time <= 500 THEN 'WARNING'  -- 500ms内完成
            ELSE 'FAILURE'
        END,
        execution_time,
        '期望在100ms内完成复杂统计查询',
        '实际耗时: ' || ROUND(execution_time, 2) || 'ms',
        NULL,
        test_details
    );

    -- 3. 并发查询性能测试
    start_time := clock_timestamp();
    
    FOR i IN 1..100 LOOP  -- 模拟100个并发查询
        PERFORM review_id, rating, content 
        FROM review_system.reviews_partitioned 
        WHERE game_id = (1001 + (i % 10))
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        LIMIT 10;
    END LOOP;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        '性能测试',
        '并发查询测试',
        CASE 
            WHEN execution_time <= 1000 THEN 'SUCCESS'  -- 1秒内完成
            WHEN execution_time <= 3000 THEN 'WARNING'  -- 3秒内完成
            ELSE 'FAILURE'
        END,
        execution_time,
        '期望在1秒内完成100个并发查询',
        '实际耗时: ' || ROUND(execution_time/1000, 2) || '秒',
        NULL,
        jsonb_build_object(
            '平均每次查询耗时', ROUND(execution_time/100, 2),
            '并发查询数', 100
        )
    );

EXCEPTION WHEN OTHERS THEN
    PERFORM review_system.record_test_result(
        '性能测试',
        '意外错误',
        'FAILURE',
        NULL,
        '测试应正常完成',
        '测试执行出错',
        SQLERRM,
        jsonb_build_object('error_detail', SQLSTATE)
    );
END;
$$;