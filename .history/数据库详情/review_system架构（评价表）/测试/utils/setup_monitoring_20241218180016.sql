-- 创建监控架构
CREATE SCHEMA IF NOT EXISTS review_system_monitor;

-- 创建监控指标表
CREATE TABLE IF NOT EXISTS review_system_monitor.metrics (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建性能监控表
CREATE TABLE IF NOT EXISTS review_system_monitor.performance_log (
    id SERIAL PRIMARY KEY,
    operation_type TEXT,
    records_processed INTEGER,
    execution_time INTERVAL,
    avg_response_time NUMERIC,
    error_count INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建异常监控表
CREATE TABLE IF NOT EXISTS review_system_monitor.anomaly_log (
    id SERIAL PRIMARY KEY,
    anomaly_type TEXT,
    description TEXT,
    severity TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建监控函数：评论系统指标
CREATE OR REPLACE FUNCTION review_system_monitor.collect_review_metrics()
RETURNS VOID AS $$
DECLARE
    v_total_reviews INTEGER;
    v_avg_rating NUMERIC;
    v_platform_distribution JSONB;
    v_language_distribution JSONB;
BEGIN
    -- 总评论数
    SELECT COUNT(*) INTO v_total_reviews 
    FROM review_system.reviews_partitioned;
    
    INSERT INTO review_system_monitor.metrics 
    (metric_name, metric_value, metric_type)
    VALUES ('total_reviews', v_total_reviews, 'count');

    -- 平均评分
    SELECT AVG(rating) INTO v_avg_rating 
    FROM review_system.reviews_partitioned;
    
    INSERT INTO review_system_monitor.metrics 
    (metric_name, metric_value, metric_type)
    VALUES ('avg_rating', v_avg_rating, 'rating');

    -- 平台分布
    SELECT jsonb_object_agg(platform, count) INTO v_platform_distribution
    FROM (
        SELECT platform, COUNT(*) as count
        FROM review_system.reviews_partitioned
        GROUP BY platform
    ) platform_counts;
    
    INSERT INTO review_system_monitor.metrics 
    (metric_name, metric_value, metric_type)
    VALUES ('platform_distribution', 0, 'distribution');

    -- 语言分布
    SELECT jsonb_object_agg(language, count) INTO v_language_distribution
    FROM (
        SELECT language, COUNT(*) as count
        FROM review_system.reviews_partitioned
        GROUP BY language
    ) language_counts;
    
    INSERT INTO review_system_monitor.metrics 
    (metric_name, metric_value, metric_type)
    VALUES ('language_distribution', 0, 'distribution');
END;
$$ LANGUAGE plpgsql;

-- 创建性能监控函数
CREATE OR REPLACE FUNCTION review_system_monitor.monitor_performance(
    p_operation_type TEXT
)
RETURNS VOID AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_records_processed INTEGER;
    v_avg_response_time NUMERIC;
    v_error_count INTEGER;
BEGIN
    v_start_time := clock_timestamp();

    -- 根据操作类型执行不同的性能监控
    CASE p_operation_type
        WHEN 'insert_review' THEN
            WITH inserted_reviews AS (
                INSERT INTO review_system.reviews_partitioned (
                    game_id, user_id, rating, content, platform, language
                )
                SELECT 
                    (random() * 1000 + 1)::bigint,
                    (random() * 1000 + 1)::bigint,
                    (random() * 5)::numeric(3,2),
                    'Performance test review',
                    CASE (random() * 3)::integer 
                        WHEN 0 THEN 'PC'
                        WHEN 1 THEN 'PS5'
                        ELSE 'XBOX'
                    END,
                    CASE (random() * 4)::integer
                        WHEN 0 THEN 'zh-CN'
                        WHEN 1 THEN 'en-US'
                        WHEN 2 THEN 'ja-JP'
                        ELSE 'es-ES'
                    END
                FROM generate_series(1, 100)
                RETURNING *
            )
            SELECT COUNT(*) INTO v_records_processed FROM inserted_reviews;

        WHEN 'query_reviews' THEN
            WITH queried_reviews AS (
                SELECT * FROM review_system.reviews_partitioned
                WHERE created_at >= NOW() - INTERVAL '1 month'
                LIMIT 1000
            )
            SELECT COUNT(*) INTO v_records_processed FROM queried_reviews;

        ELSE
            RAISE EXCEPTION 'Unknown operation type: %', p_operation_type;
    END CASE;

    v_end_time := clock_timestamp();

    -- 计算性能指标
    v_avg_response_time := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) / v_records_processed;
    v_error_count := 0;  -- 在实际场景中需要更复杂的错误计数逻辑

    -- 记录性能日志
    INSERT INTO review_system_monitor.performance_log (
        operation_type, 
        records_processed, 
        execution_time, 
        avg_response_time, 
        error_count
    ) VALUES (
        p_operation_type,
        v_records_processed,
        v_end_time - v_start_time,
        v_avg_response_time,
        v_error_count
    );
END;
$$ LANGUAGE plpgsql;

-- 创建异常检测函数
CREATE OR REPLACE FUNCTION review_system_monitor.detect_anomalies()
RETURNS VOID AS $$
BEGIN
    -- 检测异常评分
    WITH anomalous_reviews AS (
        SELECT 
            game_id, 
            rating,
            COUNT(*) as review_count
        FROM review_system.reviews_partitioned
        GROUP BY game_id, rating
        HAVING COUNT(*) > (
            SELECT percentile_cont(0.99) WITHIN GROUP (ORDER BY review_count)
            FROM (
                SELECT game_id, rating, COUNT(*) as review_count
                FROM review_system.reviews_partitioned
                GROUP BY game_id, rating
            ) subquery
        )
    )
    INSERT INTO review_system_monitor.anomaly_log (
        anomaly_type, 
        description, 
        severity, 
        details
    )
    SELECT 
        'unusual_rating_pattern',
        'Unusual rating distribution detected',
        'medium',
        jsonb_build_object(
            'game_id', game_id,
            'rating', rating,
            'review_count', review_count
        )
    FROM anomalous_reviews;

    -- 检测短时间内大量评论
    WITH rapid_reviews AS (
        SELECT 
            game_id,
            COUNT(*) as review_count,
            MAX(created_at) - MIN(created_at) as review_span
        FROM review_system.reviews_partitioned
        GROUP BY game_id
        HAVING 
            COUNT(*) > 100 AND 
            MAX(created_at) - MIN(created_at) < INTERVAL '1 hour'
    )
    INSERT INTO review_system_monitor.anomaly_log (
        anomaly_type, 
        description, 
        severity, 
        details
    )
    SELECT 
        'rapid_review_burst',
        'Rapid review burst detected',
        'high',
        jsonb_build_object(
            'game_id', game_id,
            'review_count', review_count,
            'review_span', review_span
        )
    FROM rapid_reviews;
END;
$$ LANGUAGE plpgsql;

-- 创建定期监控任务
CREATE OR REPLACE PROCEDURE review_system_monitor.run_periodic_monitoring()
AS $$
BEGIN
    PERFORM review_system_monitor.collect_review_metrics();
    PERFORM review_system_monitor.monitor_performance('insert_review');
    PERFORM review_system_monitor.monitor_performance('query_reviews');
    PERFORM review_system_monitor.detect_anomalies();
END;
$$ LANGUAGE plpgsql;

-- 创建定时触发器
CREATE OR REPLACE FUNCTION review_system_monitor.trigger_periodic_monitoring()
RETURNS TRIGGER AS $$
BEGIN
    CALL review_system_monitor.run_periodic_monitoring();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 设置定时任务（每小时执行一次）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'periodic_monitoring_trigger'
    ) THEN
        CREATE TRIGGER periodic_monitoring_trigger
        AFTER INSERT ON review_system_monitor.metrics
        FOR EACH STATEMENT
        EXECUTE FUNCTION review_system_monitor.trigger_periodic_monitoring();
    END IF;
END $$; 