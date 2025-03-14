-- 创建缓存预热函数
CREATE OR REPLACE FUNCTION review_system.cache_warmup()
RETURNS void AS $$
BEGIN
    -- 预热热门游戏数据
    EXECUTE 'SELECT * FROM review_system.reviews_partitioned 
             WHERE game_id IN (
                 SELECT game_id 
                 FROM review_system.review_summary_partitioned 
                 ORDER BY total_reviews DESC 
                 LIMIT 100
             )';
             
    -- 预热最近数据
    EXECUTE 'SELECT * FROM review_system.reviews_partitioned 
             WHERE created_at >= CURRENT_TIMESTAMP - interval ''24 hours''
             AND review_status = ''active''';
             
    -- 预热统计数据
    EXECUTE 'SELECT * FROM review_system.review_stats_hourly 
             WHERE stat_hour >= CURRENT_TIMESTAMP - interval ''7 days''';
END;
$$ LANGUAGE plpgsql;

-- 创建定期缓存清理函数
CREATE OR REPLACE FUNCTION review_system.cache_maintenance()
RETURNS void AS $$
BEGIN
    -- 清理过期的缓存数据
    VACUUM ANALYZE review_system.reviews_partitioned;
    VACUUM ANALYZE review_system.review_replies_partitioned;
    VACUUM ANALYZE review_system.review_summary_partitioned;
    
    -- 更新统计信息
    ANALYZE review_system.reviews_partitioned;
    ANALYZE review_system.review_replies_partitioned;
    ANALYZE review_system.review_summary_partitioned;
END;
$$ LANGUAGE plpgsql;

-- 添加资源限制控制
CREATE TABLE review_system.resource_limits (
    limit_id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50),
    max_value BIGINT,
    current_value BIGINT,
    warning_threshold INTEGER,
    critical_threshold INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建资源使用监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_resource_usage()
RETURNS void AS $$
BEGIN
    -- 更新临时表空间使用情况
    INSERT INTO review_system.resource_limits (
        resource_type,
        max_value,
        current_value,
        warning_threshold,
        critical_threshold
    )
    SELECT 
        'temp_space',
        setting::bigint * 1024 * 1024, -- 最大临时空间(bytes)
        pg_database_size(current_database()), -- 当前使用量
        75, -- 警告阈值(75%)
        90  -- 严重阈值(90%)
    FROM pg_settings
    WHERE name = 'temp_buffers'
    ON CONFLICT (resource_type) DO UPDATE
    SET 
        current_value = EXCLUDED.current_value,
        last_updated = CURRENT_TIMESTAMP;

    -- 更新连接数使用情况
    INSERT INTO review_system.resource_limits (
        resource_type,
        max_value,
        current_value,
        warning_threshold,
        critical_threshold
    )
    SELECT 
        'connections',
        setting::integer, -- 最大连接数
        (SELECT count(*) FROM pg_stat_activity), -- 当前连接数
        75,
        90
    FROM pg_settings
    WHERE name = 'max_connections'
    ON CONFLICT (resource_type) DO UPDATE
    SET 
        current_value = EXCLUDED.current_value,
        last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;