-- 基础操作测试用例
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time DECIMAL;
    test_details JSONB;
BEGIN
    -- 1. 测试评论插入
    start_time := clock_timestamp();
    
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (1001, 1, 4.5, '很好玩的游戏!', 10, 'PC', 'zh-CN', true),
    (1001, 2, 3.5, 'Good game but needs improvement', 5, 'PS5', 'en-US', true),
    (1001, 3, 5.0, '素晴らしいゲーム!', 20, 'PC', 'ja-JP', true)
    RETURNING jsonb_build_object(
        'inserted_ids', array_agg(review_id),
        'affected_rows', COUNT(*)
    ) INTO test_details;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        'Basic Operations',
        'Insert Reviews Test',
        'SUCCESS',
        execution_time,
        '预期插入3条评论记录',
        '实际插入' || (test_details->>'affected_rows') || '条记录',
        NULL,
        test_details
    );

    -- 2. 测试回复插入
    start_time := clock_timestamp();
    
    INSERT INTO review_system.review_replies_partitioned (
        review_id, user_id, content, language
    ) VALUES 
    (1, 4, '同意你的观点!', 'zh-CN'),
    (1, 5, 'Thanks for sharing', 'en-US')
    RETURNING jsonb_build_object(
        'inserted_ids', array_agg(reply_id),
        'affected_rows', COUNT(*)
    ) INTO test_details;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        'Basic Operations',
        'Insert Replies Test',
        'SUCCESS',
        execution_time,
        '预期插入2条回复记录',
        '实际插入' || (test_details->>'affected_rows') || '条记录',
        NULL,
        test_details
    );

    -- 3. 测试评论查询性能
    start_time := clock_timestamp();
    
    WITH query_result AS (
        SELECT COUNT(*) as count
        FROM review_system.reviews_partitioned 
        WHERE game_id = 1001
    )
    SELECT jsonb_build_object(
        'total_reviews', count,
        'query_sql', 'SELECT * FROM review_system.reviews_partitioned WHERE game_id = 1001'
    ) INTO test_details
    FROM query_result;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        'Basic Operations',
        'Query Reviews Performance Test',
        CASE 
            WHEN execution_time <= 1 THEN 'SUCCESS'
            WHEN execution_time <= 5 THEN 'WARNING'
            ELSE 'FAILURE'
        END,
        execution_time,
        '查询响应时间应在1ms内',
        '实际响应时间: ' || execution_time || 'ms',
        NULL,
        test_details
    );

    -- 4. 测试数据一致性
    start_time := clock_timestamp();
    
    WITH summary_check AS (
        SELECT 
            s.total_reviews,
            s.average_rating,
            COUNT(r.*) as actual_reviews,
            AVG(r.rating) as actual_avg_rating
        FROM review_system.review_summary_partitioned s
        LEFT JOIN review_system.reviews_partitioned r ON r.game_id = s.game_id
        WHERE s.game_id = 1001
        GROUP BY s.total_reviews, s.average_rating
    )
    SELECT jsonb_build_object(
        'expected_reviews', total_reviews,
        'actual_reviews', actual_reviews,
        'expected_rating', average_rating,
        'actual_rating', actual_avg_rating
    ) INTO test_details
    FROM summary_check;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    PERFORM review_system.record_test_result(
        'Basic Operations',
        'Data Consistency Test',
        CASE 
            WHEN (test_details->>'expected_reviews')::int = (test_details->>'actual_reviews')::int 
                AND ABS((test_details->>'expected_rating')::numeric - (test_details->>'actual_rating')::numeric) < 0.01
            THEN 'SUCCESS'
            ELSE 'FAILURE'
        END,
        execution_time,
        '汇总数据应与实际数据一致',
        '检查结果: ' || test_details::text,
        NULL,
        test_details
    );

EXCEPTION WHEN OTHERS THEN
    PERFORM review_system.record_test_result(
        'Basic Operations',
        'Unexpected Error',
        'FAILURE',
        NULL,
        '测试应正常完成',
        '测试执行出错',
        SQLERRM,
        jsonb_build_object('error_detail', SQLSTATE)
    );
END;
$$;