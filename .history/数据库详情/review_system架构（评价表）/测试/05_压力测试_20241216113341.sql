-- 压力测试函数
CREATE OR REPLACE FUNCTION review_system.run_stress_test(
    p_concurrent_users INTEGER DEFAULT 100,
    p_operations_per_user INTEGER DEFAULT 1000,
    p_test_duration INTERVAL DEFAULT '5 minutes'::INTERVAL
) RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    unit TEXT
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_session_id INTEGER;
    v_error_count INTEGER := 0;
    v_success_count INTEGER := 0;
BEGIN
    v_start_time := clock_timestamp();

    -- 创建多个会话模拟并发用户
    FOR v_session_id IN 1..p_concurrent_users LOOP
        -- 每个会话执行指定次数的操作
        FOR i IN 1..p_operations_per_user LOOP
            BEGIN
                -- 随机执行不同类型的操作
                CASE (random() * 4)::INTEGER
                    WHEN 0 THEN -- 插入评论
                        INSERT INTO review_system.reviews_partitioned (
                            game_id,
                            user_id,
                            rating,
                            content,
                            platform,
                            language,
                            is_recommended,
                            created_at
                        ) VALUES (
                            (random() * 1000000)::INTEGER,
                            (random() * 1000000)::INTEGER,
                            (random() * 5)::NUMERIC(3,2),
                            'Stress test review ' || v_session_id || '_' || i,
                            CASE (random() * 2)::INTEGER
                                WHEN 0 THEN 'PC'
                                WHEN 1 THEN 'PS5'
                                ELSE 'XBOX'
                            END,
                            CASE (random() * 4)::INTEGER
                                WHEN 0 THEN 'zh-CN'
                                WHEN 1 THEN 'en-US'
                                WHEN 2 THEN 'ja-JP'
                                ELSE 'es-ES'
                            END,
                            random() > 0.5,
                            clock_timestamp() - (random() * interval '365 days')
                        );

                    WHEN 1 THEN -- 插入回复
                        INSERT INTO review_system.review_replies_partitioned (
                            review_id,
                            user_id,
                            content,
                            language,
                            created_at
                        ) VALUES (
                            (random() * 1000000)::INTEGER,
                            (random() * 1000000)::INTEGER,
                            'Stress test reply ' || v_session_id || '_' || i,
                            'zh-CN',
                            clock_timestamp() - (random() * interval '365 days')
                        );

                    WHEN 2 THEN -- 复杂查询
                        WITH ReviewStats AS (
                            SELECT 
                                game_id,
                                COUNT(*) as review_count,
                                AVG(rating) as avg_rating,
                                COUNT(DISTINCT user_id) as unique_reviewers
                            FROM review_system.reviews_partitioned
                            WHERE created_at >= CURRENT_DATE - interval '30 days'
                            GROUP BY game_id
                        )
                        SELECT 
                            game_id,
                            review_count,
                            avg_rating,
                            unique_reviewers
                        FROM ReviewStats
                        WHERE review_count > 10
                        ORDER BY avg_rating DESC
                        LIMIT 10;

                    WHEN 3 THEN -- 更新操作
                        UPDATE review_system.reviews_partitioned
                        SET 
                            rating = (random() * 5)::NUMERIC(3,2),
                            content = 'Updated stress test review ' || v_session_id || '_' || i,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE review_id = (random() * 1000000)::INTEGER
                        AND created_at >= CURRENT_DATE - interval '30 days';

                    ELSE -- 删除操作
                        UPDATE review_system.reviews_partitioned
                        SET 
                            deleted_at = CURRENT_TIMESTAMP,
                            review_status = 'deleted'
                        WHERE review_id = (random() * 1000000)::INTEGER
                        AND created_at >= CURRENT_DATE - interval '30 days';
                END CASE;

                v_success_count := v_success_count + 1;

            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
            END;

            -- 检查是否超过测试时间
            IF clock_timestamp() - v_start_time > p_test_duration THEN
                EXIT;
            END IF;
        END LOOP;

        -- 检查是否超过测试时间
        IF clock_timestamp() - v_start_time > p_test_duration THEN
            EXIT;
        END IF;
    END LOOP;

    v_end_time := clock_timestamp();

    -- 返回测试指标
    RETURN QUERY
    SELECT 'Total Duration'::TEXT, 
           EXTRACT(EPOCH FROM (v_end_time - v_start_time))::NUMERIC,
           'seconds'::TEXT;

    RETURN QUERY
    SELECT 'Operations Per Second'::TEXT,
           (v_success_count::NUMERIC / EXTRACT(EPOCH FROM (v_end_time - v_start_time)))::NUMERIC,
           'ops/sec'::TEXT;

    RETURN QUERY
    SELECT 'Success Rate'::TEXT,
           ((v_success_count::NUMERIC / (v_success_count + v_error_count)::NUMERIC) * 100)::NUMERIC,
           'percent'::TEXT;

    RETURN QUERY
    SELECT 'Error Rate'::TEXT,
           ((v_error_count::NUMERIC / (v_success_count + v_error_count)::NUMERIC) * 100)::NUMERIC,
           'percent'::TEXT;

    -- 收集数据库统计
    RETURN QUERY
    SELECT 'Buffer Hit Ratio'::TEXT,
           (blks_hit::NUMERIC / (blks_hit + blks_read)::NUMERIC * 100)::NUMERIC,
           'percent'::TEXT
    FROM pg_stat_database
    WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql; 