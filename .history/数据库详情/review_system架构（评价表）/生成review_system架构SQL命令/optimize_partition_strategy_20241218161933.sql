-- 优化分区策略

-- 1. 创建新的分区表结构
CREATE TABLE IF NOT EXISTS review_system.reviews_partitioned_new (
    review_id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    content TEXT NOT NULL,
    playtime_hours INTEGER,
    platform VARCHAR(50),
    language VARCHAR(10),
    is_recommended BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (created_at);

-- 2. 创建分区维护函数
CREATE OR REPLACE FUNCTION review_system.maintain_partitions()
RETURNS void AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_partition_name TEXT;
BEGIN
    -- 创建未来3个月的分区
    FOR i IN 0..2 LOOP
        v_start_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' month')::INTERVAL);
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (game_id, created_at, review_id)
) PARTITION BY RANGE (created_at), LIST (game_id);

-- 创建游戏ID范围分区
CREATE OR REPLACE FUNCTION review_system.create_game_partitions(
    p_start_id BIGINT,
    p_end_id BIGINT,
    p_interval BIGINT DEFAULT 1000
)
RETURNS void AS $$
DECLARE
    v_start BIGINT;
    v_end BIGINT;
BEGIN
    v_start := p_start_id;
    WHILE v_start < p_end_id LOOP
        v_end := v_start + p_interval;
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.reviews_game_%s_%s 
             PARTITION OF review_system.reviews_partitioned
             FOR VALUES FROM (%s) TO (%s)',
            v_start, v_end, v_start, v_end
        );
        
        v_start := v_end;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建分区维护函数
CREATE OR REPLACE FUNCTION review_system.maintain_partitions()
RETURNS void AS $$
BEGIN
    -- 检查并创建新的时间分区
    PERFORM review_system.create_future_partitions(3);
    
    -- 检查并创建新的游戏ID分区
    PERFORM review_system.create_game_partitions(
        (SELECT COALESCE(MIN(game_id), 1) FROM review_system.reviews_partitioned),
        (SELECT COALESCE(MAX(game_id) + 1000, 2000) FROM review_system.reviews_partitioned)
    );
    
    -- 清理过期分区
    PERFORM review_system.cleanup_old_partitions();
END;
$$ LANGUAGE plpgsql; 