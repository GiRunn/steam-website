-- 修改分区策略为复合分区
ALTER TABLE review_system.reviews_partitioned 
    DETACH PARTITION reviews_y202401;

-- 重新创建为复合分区表
CREATE TABLE review_system.reviews_partitioned (
    review_id BIGSERIAL,
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    content TEXT NOT NULL,
    playtime_hours INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'active',
    is_recommended BOOLEAN,
    platform VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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