-- 1. DDOS攻击模拟测试
CREATE OR REPLACE FUNCTION review_system.simulate_ddos_attack(
    p_requests_per_second INTEGER,
    p_duration INTERVAL
) RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    details TEXT
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_success_count INTEGER := 0;
    v_failed_count INTEGER := 0;
    v_connection_count INTEGER := 0;
BEGIN
    v_start_time := clock_timestamp();
    v_end_time := v_start_time + p_duration;

    -- 创建多个连接并发送请求
    WHILE clock_timestamp() < v_end_time LOOP
        BEGIN
            -- 模拟大量并发连接
            FOR i IN 1..p_requests_per_second LOOP
                -- 随机选择攻击类型
                CASE (random() * 4)::INTEGER
                    WHEN 0 THEN -- 连接泛洪
                        PERFORM pg_stat_get_activity(pg_backend_pid());
                        v_connection_count := v_connection_count + 1;
                    
                    WHEN 1 THEN -- 资源消耗
                        PERFORM COUNT(*) 
                        FROM review_system.reviews_partitioned 
                        WHERE created_at >= CURRENT_TIMESTAMP - interval '1 year';
                        
                    WHEN 2 THEN -- CPU密集操作
                        PERFORM md5(repeat('x', 10000));
                        
                    WHEN 3 THEN -- IO密集操作
                        PERFORM pg_relation_size('review_system.reviews_partitioned');
                        
                    ELSE -- 内存消耗
                        PERFORM array_agg(i) 
                        FROM generate_series(1, 10000) i;
                END CASE;
                
                v_success_count := v_success_count + 1;
            END LOOP;

            -- 模拟请求间隔
            PERFORM pg_sleep(0.001); -- 1ms间隔
            
        EXCEPTION WHEN OTHERS THEN
            v_failed_count := v_failed_count + 1;
        END;
    END LOOP;

    -- 返回测试指标
    RETURN QUERY
    SELECT 'Total Connections'::TEXT, v_connection_count::NUMERIC, 'connections'::TEXT;
    
    RETURN QUERY
    SELECT 'Successful Requests'::TEXT, v_success_count::NUMERIC, 'requests'::TEXT;
    
    RETURN QUERY
    SELECT 'Failed Requests'::TEXT, v_failed_count::NUMERIC, 'requests'::TEXT;
    
    RETURN QUERY
    SELECT 'Average RPS'::TEXT, 
           (v_success_count::NUMERIC / EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time))), 
           'requests/second'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 2. SQL注入测试
CREATE OR REPLACE FUNCTION review_system.test_sql_injection(
    p_attack_patterns TEXT[]
) RETURNS TABLE (
    pattern TEXT,
    is_blocked BOOLEAN,
    details TEXT
) AS $$
DECLARE
    v_pattern TEXT;
    v_sql TEXT;
    v_result BOOLEAN;
BEGIN
    -- 创建测试表
    CREATE TEMP TABLE IF NOT EXISTS injection_test (
        id SERIAL PRIMARY KEY,
        data TEXT
    );

    -- 测试每个注入模式
    FOREACH v_pattern IN ARRAY p_attack_patterns
    LOOP
        BEGIN
            -- 尝试构造并执行可能的注入SQL
            v_sql := format(
                'SELECT * FROM injection_test WHERE data = %L',
                v_pattern
            );
            
            -- 记录测试结果
            v_result := FALSE;
            BEGIN
                EXECUTE v_sql;
                v_result := TRUE;
            EXCEPTION WHEN OTHERS THEN
                -- 注入被阻止
                NULL;
            END;

            RETURN QUERY
            SELECT 
                v_pattern,
                NOT v_result,  -- 如果执行失败则表示注入被阻止
                CASE WHEN v_result 
                    THEN '警告：SQL注入未被阻止'
                    ELSE '注入已被阻止'
                END;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY
            SELECT 
                v_pattern,
                TRUE,
                '发生错误: ' || SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. XSS防护测试
CREATE OR REPLACE FUNCTION review_system.test_xss_protection(
    p_attack_patterns TEXT[]
) RETURNS TABLE (
    pattern TEXT,
    is_sanitized BOOLEAN,
    sanitized_output TEXT
) AS $$
DECLARE
    v_pattern TEXT;
    v_sanitized TEXT;
BEGIN
    FOREACH v_pattern IN ARRAY p_attack_patterns
    LOOP
        -- 模拟内容净化过程
        v_sanitized := regexp_replace(
            v_pattern,
            '<[^>]*>|javascript:|data:|vbscript:',
            '',
            'gi'
        );
        
        -- 检查是否包含潜在的XSS代码
        RETURN QUERY
        SELECT 
            v_pattern,
            v_sanitized !~ '<[^>]*>|javascript:|data:|vbscript:',
            v_sanitized;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 权限提升测试
CREATE OR REPLACE FUNCTION review_system.test_privilege_escalation()
RETURNS TABLE (
    test_name TEXT,
    is_vulnerable BOOLEAN,
    details TEXT
) AS $$
DECLARE
    v_test_user TEXT := 'test_user_' || md5(random()::text);
    v_result BOOLEAN;
BEGIN
    -- 创建测试用户
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', v_test_user, 'test_pass');
    
    -- 测试1：尝试直接访问系统表
    RETURN QUERY
    SELECT 
        '系统表访问测试'::TEXT,
        EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE tableowner = v_test_user
        ),
        '检查是否能访问系统表';

    -- 测试2：尝试修改其他用户数据
    RETURN QUERY
    SELECT 
        '数据越权测试'::TEXT,
        EXISTS (
            SELECT 1
            FROM review_system.reviews_partitioned
            WHERE user_id != CURRENT_USER::INTEGER
            FOR UPDATE
        ),
        '检查是否能修改其他用户数据';

    -- 测试3：尝试执行系统命令
    RETURN QUERY
    SELECT 
        '系统命令执行测试'::TEXT,
        EXISTS (
            SELECT 1
            FROM pg_proc
            WHERE proname = 'pg_read_file'
            AND has_function_privilege(v_test_user, oid, 'EXECUTE')
        ),
        '检查是否能执行系统命令';

    -- 清理测试用户
    EXECUTE format('DROP ROLE IF EXISTS %I', v_test_user);
END;
$$ LANGUAGE plpgsql;

-- 5. 超大数据量测试
CREATE OR REPLACE FUNCTION review_system.test_massive_data_load(
    p_total_records INTEGER,
    p_batch_size INTEGER
) RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    unit TEXT
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_batch_count INTEGER := 0;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
BEGIN
    v_start_time := clock_timestamp();

    -- 分批插入大量数据
    WHILE v_success_count < p_total_records LOOP
        BEGIN
            -- 批量插入数据
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
                (random() * 1000000)::INTEGER,
                (random() * 1000000)::INTEGER,
                (random() * 5)::NUMERIC(3,2),
                'Massive data test review ' || generate_series,
                (random() * 1000)::INTEGER,
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
                CURRENT_TIMESTAMP - (random() * interval '365 days')
            FROM generate_series(
                v_success_count + 1,
                LEAST(v_success_count + p_batch_size, p_total_records)
            );

            v_success_count := v_success_count + p_batch_size;
            v_batch_count := v_batch_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            IF v_error_count >= 5 THEN
                RAISE EXCEPTION '批量插入失败次数过多';
            END IF;
        END;
    END LOOP;

    v_end_time := clock_timestamp();

    -- 返回测试指标
    RETURN QUERY
    SELECT 'Total Records'::TEXT, v_success_count::NUMERIC, 'records'::TEXT;
    
    RETURN QUERY
    SELECT 'Total Batches'::TEXT, v_batch_count::NUMERIC, 'batches'::TEXT;
    
    RETURN QUERY
    SELECT 'Average Batch Size'::TEXT, 
           (v_success_count::NUMERIC / v_batch_count), 
           'records/batch'::TEXT;
    
    RETURN QUERY
    SELECT 'Insert Rate'::TEXT,
           (v_success_count::NUMERIC / EXTRACT(EPOCH FROM (v_end_time - v_start_time))),
           'records/second'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. 超长内容测试
CREATE OR REPLACE FUNCTION review_system.test_long_content(
    p_content_size_bytes INTEGER
) RETURNS TABLE (
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    v_long_content TEXT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_review_id BIGINT;
BEGIN
    -- 生成超长内容
    v_long_content := (
        SELECT string_agg(
            md5(random()::text) || ' ' || 
            repeat('测试内容', 100) || ' ' ||
            repeat('Test Content', 100) || ' ' ||
            repeat('🎮🎲🎯', 10),
            E'\n'
        )
        FROM generate_series(1, p_content_size_bytes / 1000)
    );

    v_start_time := clock_timestamp();

    -- 测试1：直接插入超长内容
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content
        ) VALUES (
            1001, 1, 4.5, v_long_content
        ) RETURNING review_id INTO v_review_id;

        RETURN QUERY
        SELECT 
            '超长内容插入测试'::TEXT,
            '通过'::TEXT,
            format('成功插入 %s 字节的内容', length(v_long_content));
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            '超长内容插入测试'::TEXT,
            '失败'::TEXT,
            SQLERRM;
    END;

    -- 测试2：读取超长内容
    BEGIN
        PERFORM content 
        FROM review_system.reviews_partitioned 
        WHERE review_id = v_review_id;

        RETURN QUERY
        SELECT 
            '超长内容读取测试'::TEXT,
            '通过'::TEXT,
            format('读取耗时: %s', clock_timestamp() - v_start_time);
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            '超长内容读取测试'::TEXT,
            '失败'::TEXT,
            SQLERRM;
    END;

    -- 测试3：更新超长内容
    BEGIN
        UPDATE review_system.reviews_partitioned
        SET content = v_long_content || ' Updated'
        WHERE review_id = v_review_id;

        RETURN QUERY
        SELECT 
            '超长内容更新测试'::TEXT,
            '通过'::TEXT,
            format('更新耗时: %s', clock_timestamp() - v_start_time);
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            '超长内容更新测试'::TEXT,
            '失败'::TEXT,
            SQLERRM;
    END;

    -- 测试4：全文搜索超长内容
    BEGIN
        PERFORM content 
        FROM review_system.reviews_partitioned 
        WHERE content LIKE '%Test Content%'
        AND review_id = v_review_id;

        RETURN QUERY
        SELECT 
            '超长内容搜索测试'::TEXT,
            '通过'::TEXT,
            format('搜索耗时: %s', clock_timestamp() - v_start_time);
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            '超长内容搜索测试'::TEXT,
            '失败'::TEXT,
            SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- 7. 特殊字符测试
CREATE OR REPLACE FUNCTION review_system.test_special_characters(
    p_patterns TEXT[]
) RETURNS TABLE (
    pattern TEXT,
    is_handled BOOLEAN,
    stored_value TEXT,
    details TEXT
) AS $$
DECLARE
    v_pattern TEXT;
    v_review_id BIGINT;
    v_stored_content TEXT;
BEGIN
    FOREACH v_pattern IN ARRAY p_patterns
    LOOP
        BEGIN
            -- 尝试插入特殊字符
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (
                1001, 1, 4.5, 
                format('Special char test: %s', v_pattern)
            ) RETURNING review_id INTO v_review_id;

            -- 读取存储的内容
            SELECT content INTO v_stored_content
            FROM review_system.reviews_partitioned
            WHERE review_id = v_review_id;

            -- 返回测试结果
            RETURN QUERY
            SELECT 
                v_pattern,
                v_stored_content IS NOT NULL,
                v_stored_content,
                CASE 
                    WHEN v_stored_content = format('Special char test: %s', v_pattern)
                    THEN '特殊字符处理正确'
                    ELSE '特殊字符处理可能有问题'
                END;

        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY
            SELECT 
                v_pattern,
                FALSE,
                NULL::TEXT,
                '错误: ' || SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. 复杂查询性能测试
CREATE OR REPLACE FUNCTION review_system.test_complex_query_performance(
    p_iterations INTEGER,
    p_analyze BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    query_name TEXT,
    avg_duration INTERVAL,
    min_duration INTERVAL,
    max_duration INTERVAL,
    execution_plan TEXT
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_durations INTERVAL[];
    v_plan TEXT;
BEGIN
    -- 测试1：多表关联统计查询
    FOR i IN 1..p_iterations LOOP
        v_start_time := clock_timestamp();
        
        WITH ReviewStats AS (
            SELECT 
                r.game_id,
                COUNT(*) as review_count,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT user_id) as unique_reviewers,
                SUM(CASE WHEN is_recommended THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as recommend_rate,
                STRING_AGG(DISTINCT platform, ', ') as platforms,
                STRING_AGG(DISTINCT language, ', ') as languages
            FROM review_system.reviews_partitioned r
            WHERE created_at >= CURRENT_DATE - interval '90 days'
            GROUP BY game_id
        ),
        ReplyStats AS (
            SELECT 
                r.review_id,
                COUNT(*) as reply_count,
                MAX(rr.created_at) as last_reply_time
            FROM review_system.reviews_partitioned r
            JOIN review_system.review_replies_partitioned rr ON r.review_id = rr.review_id
            GROUP BY r.review_id
        ),
        UserEngagement AS (
            SELECT 
                user_id,
                COUNT(*) as total_reviews,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT game_id) as reviewed_games,
                SUM(playtime_hours) as total_playtime
            FROM review_system.reviews_partitioned
            GROUP BY user_id
        )
        SELECT 
            rs.*,
            COALESCE(rps.reply_count, 0) as total_replies,
            ue.total_reviews as reviewer_total_reviews,
            ue.avg_rating as reviewer_avg_rating
        FROM ReviewStats rs
        LEFT JOIN review_system.reviews_partitioned r ON rs.game_id = r.game_id
        LEFT JOIN ReplyStats rps ON r.review_id = rps.review_id
        LEFT JOIN UserEngagement ue ON r.user_id = ue.user_id
        WHERE rs.review_count >= 10
        ORDER BY rs.avg_rating DESC, rs.review_count DESC
        LIMIT 100;
        
        v_durations := array_append(v_durations, clock_timestamp() - v_start_time);
    END LOOP;

    -- 获取查询计划
    IF p_analyze THEN
        EXPLAIN ANALYZE INTO v_plan
        WITH ReviewStats AS (
            SELECT 
                r.game_id,
                COUNT(*) as review_count,
                AVG(rating) as avg_rating
            FROM review_system.reviews_partitioned r
            GROUP BY game_id
        )
        SELECT * FROM ReviewStats LIMIT 1;
    END IF;

    RETURN QUERY
    SELECT 
        '复杂统计查询'::TEXT,
        avg(duration)::INTERVAL,
        min(duration)::INTERVAL,
        max(duration)::INTERVAL,
        v_plan
    FROM unnest(v_durations) as duration;

    -- 清理数组
    v_durations := ARRAY[]::INTERVAL[];

    -- 测试2：分区范围查询
    FOR i IN 1..p_iterations LOOP
        v_start_time := clock_timestamp();
        
        PERFORM * FROM (
            SELECT 
                DATE_TRUNC('day', created_at) as review_date,
                COUNT(*) as daily_reviews,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT game_id) as unique_games,
                SUM(CASE WHEN is_recommended THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as recommend_rate
            FROM review_system.reviews_partitioned
            WHERE created_at BETWEEN CURRENT_DATE - interval '365 days' AND CURRENT_DATE
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY review_date DESC
        ) daily_stats;
        
        v_durations := array_append(v_durations, clock_timestamp() - v_start_time);
    END LOOP;

    RETURN QUERY
    SELECT 
        '分区范围查询'::TEXT,
        avg(duration)::INTERVAL,
        min(duration)::INTERVAL,
        max(duration)::INTERVAL,
        NULL::TEXT
    FROM unnest(v_durations) as duration;
END;
$$ LANGUAGE plpgsql;

-- 9. 并发更新测试
CREATE OR REPLACE FUNCTION review_system.test_concurrent_updates(
    p_concurrent_sessions INTEGER,
    p_updates_per_session INTEGER
) RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    details TEXT
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_success_count INTEGER := 0;
    v_deadlock_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_session_id INTEGER;
BEGIN
    v_start_time := clock_timestamp();

    -- 创建测试数据
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content
    )
    SELECT 
        (random() * 1000)::INTEGER,
        (random() * 1000)::INTEGER,
        (random() * 5)::NUMERIC(3,2),
        'Concurrent update test review ' || generate_series
    FROM generate_series(1, p_concurrent_sessions * 10);

    -- 模拟并发更新
    FOR v_session_id IN 1..p_concurrent_sessions LOOP
        BEGIN
            -- 获取会话级别的advisory锁
            PERFORM pg_advisory_xact_lock(v_session_id);
            
            -- 执行批量更新
            FOR i IN 1..p_updates_per_session LOOP
                BEGIN
                    UPDATE review_system.reviews_partitioned
                    SET 
                        rating = (random() * 5)::NUMERIC(3,2),
                        content = content || ' - Updated by session ' || v_session_id,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE review_id IN (
                        SELECT review_id 
                        FROM review_system.reviews_partitioned 
                        ORDER BY RANDOM() 
                        LIMIT 1
                    )
                    AND created_at >= CURRENT_DATE - interval '30 days';

                    v_success_count := v_success_count + 1;

                EXCEPTION 
                    WHEN deadlock_detected THEN
                        v_deadlock_count := v_deadlock_count + 1;
                        RAISE NOTICE '检测到死锁，session %: %', v_session_id, SQLERRM;
                    WHEN OTHERS THEN
                        v_error_count := v_error_count + 1;
                        RAISE NOTICE '更新错误，session %: %', v_session_id, SQLERRM;
                END;
                
                -- 随机延迟
                PERFORM pg_sleep(random() * 0.01); -- 0-10ms延迟
            END LOOP;
            
        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE '会话错误 %: %', v_session_id, SQLERRM;
        END;
    END LOOP;

    v_end_time := clock_timestamp();

    -- 返回测试指标
    RETURN QUERY
    SELECT 'Total Updates'::TEXT, v_success_count::NUMERIC, 'updates'::TEXT;
    
    RETURN QUERY
    SELECT 'Deadlocks'::TEXT, v_deadlock_count::NUMERIC, 'occurrences'::TEXT;
    
    RETURN QUERY
    SELECT 'Other Errors'::TEXT, v_error_count::NUMERIC, 'occurrences'::TEXT;
    
    RETURN QUERY
    SELECT 'Updates Per Second'::TEXT, 
           (v_success_count::NUMERIC / EXTRACT(EPOCH FROM (v_end_time - v_start_time))),
           'updates/second'::TEXT;
END;
$$ LANGUAGE plpgsql;

[继续展示其他函数吗？]