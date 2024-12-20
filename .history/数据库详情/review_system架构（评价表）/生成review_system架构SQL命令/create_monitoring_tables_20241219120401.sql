-- 创建监控历史数据表
CREATE TABLE IF NOT EXISTS review_system.monitoring_history (
    id BIGSERIAL PRIMARY KEY,
    metrics_type VARCHAR(50) NOT NULL,
    metrics_data JSONB NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统指标历史表
CREATE TABLE IF NOT EXISTS review_system.system_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    cpu_usage NUMERIC(5,2),
    memory_usage NUMERIC(5,2),
    database_size_bytes BIGINT,
    active_connections INTEGER,
    total_connections INTEGER,
    max_connections INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建评论系统指标历史表
CREATE TABLE IF NOT EXISTS review_system.review_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    total_reviews INTEGER,
    avg_rating NUMERIC(3,2),
    reviews_last_hour INTEGER,
    unique_games_reviewed INTEGER,
    total_replies INTEGER,
    avg_review_length NUMERIC(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建分区状态历史表
CREATE TABLE IF NOT EXISTS review_system.partition_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    partition_name VARCHAR(100),
    table_name VARCHAR(100),
    size_bytes BIGINT,
    row_count INTEGER,
    dead_tuples INTEGER,
    last_vacuum TIMESTAMP WITH TIME ZONE,
    last_analyze TIMESTAMP WITH TIME ZONE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建定期保存监控数据的函数
CREATE OR REPLACE FUNCTION review_system.save_monitoring_metrics()
RETURNS void AS $$
BEGIN
    -- 保存系统指标
    INSERT INTO review_system.system_metrics_history (
        cpu_usage,
        memory_usage,
        database_size_bytes,
        active_connections,
        total_connections,
        max_connections
    )
    SELECT 
        (SELECT ROUND(CAST(count(*) AS numeric) * 100 / 
            GREATEST((SELECT setting::numeric FROM pg_settings WHERE name = 'max_connections'), 1), 2)
        FROM pg_stat_activity 
        WHERE state = 'active' 
        AND pid != pg_backend_pid()) as cpu_usage,
        
        (SELECT ROUND(pg_total_relation_size(schemaname || '.' || relname) * 100.0 / 
            (SELECT setting::bigint * 1024 
             FROM pg_settings 
             WHERE name = 'shared_buffers'), 2)
        FROM pg_stat_user_tables 
        ORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC 
        LIMIT 1) as memory_usage,
        
        pg_database_size(current_database()) as database_size_bytes,
        
        (SELECT count(*) FROM pg_stat_activity 
         WHERE state = 'active' AND pid != pg_backend_pid()) as active_connections,
         
        (SELECT count(*) FROM pg_stat_activity 
         WHERE pid != pg_backend_pid()) as total_connections,
         
        (SELECT setting::int FROM pg_settings 
         WHERE name = 'max_connections') as max_connections;

    -- 保存评论系统指标
    INSERT INTO review_system.review_metrics_history (
        total_reviews,
        avg_rating,
        reviews_last_hour,
        unique_games_reviewed,
        total_replies,
        avg_review_length
    )
    SELECT 
        count(*) as total_reviews,
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as avg_rating,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as reviews_last_hour,
        COUNT(DISTINCT game_id) as unique_games_reviewed,
        (SELECT count(*) FROM review_system.review_replies_partitioned) as total_replies,
        COALESCE(ROUND(AVG(LENGTH(content))::numeric, 2), 0) as avg_review_length
    FROM review_system.reviews_partitioned
    WHERE deleted_at IS NULL;

    -- 保存分区状态
    INSERT INTO review_system.partition_metrics_history (
        partition_name,
        table_name,
        size_bytes,
        row_count,
        dead_tuples,
        last_vacuum,
        last_analyze
    )
    SELECT 
        relname as partition_name,
        schemaname || '.' || relname as table_name,
        pg_total_relation_size(schemaname || '.' || relname) as size_bytes,
        n_live_tup as row_count,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'review_system'
    AND relname LIKE 'reviews_%';
END;
$$ LANGUAGE plpgsql;

-- 创建清理历史数据的函数(默认保留30天)
CREATE OR REPLACE FUNCTION review_system.cleanup_monitoring_history(
    days_to_keep INTEGER DEFAULT 30
)
RETURNS void AS $$
BEGIN
    -- 清理系统指标历史
    DELETE FROM review_system.system_metrics_history
    WHERE recorded_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- 清理评论系统指标历史
    DELETE FROM review_system.review_metrics_history
    WHERE recorded_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- 清理分区状态历史
    DELETE FROM review_system.partition_metrics_history
    WHERE recorded_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- 清理通用监控历史
    DELETE FROM review_system.monitoring_history
    WHERE recorded_at < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 创建监控数据采集的调度任务
DO $$
BEGIN
    -- 如果已安装pg_cron扩展，则创建定时任务
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- 每5分钟保存一次监控数据
        PERFORM cron.schedule('save_metrics', '*/5 * * * *', 
            'SELECT review_system.save_monitoring_metrics()');
            
        -- 每天凌晨2点清理过期数据
        PERFORM cron.schedule('cleanup_metrics', '0 2 * * *', 
            'SELECT review_system.cleanup_monitoring_history()');
    END IF;
END $$;

-- 创建监控数据查询视图
CREATE OR REPLACE VIEW review_system.monitoring_metrics_view AS
SELECT 
    s.recorded_at,
    s.cpu_usage,
    s.memory_usage,
    s.database_size_bytes,
    s.active_connections,
    s.total_connections,
    r.total_reviews,
    r.avg_rating,
    r.reviews_last_hour
FROM review_system.system_metrics_history s
LEFT JOIN review_system.review_metrics_history r 
    ON date_trunc('minute', s.recorded_at) = date_trunc('minute', r.recorded_at)
ORDER BY s.recorded_at DESC; 