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
        v_end_date := v_start_date + '1 month'::INTERVAL;
        v_partition_name := 'reviews_y' || TO_CHAR(v_start_date, 'YYYY') || 'm' || TO_CHAR(v_start_date, 'MM');
        
        -- 检查分区是否存在
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE n.nspname = 'review_system' 
            AND c.relname = v_partition_name
        ) THEN
            -- 创建新分区
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS review_system.%I 
                PARTITION OF review_system.reviews_partitioned_new 
                FOR VALUES FROM (%L) TO (%L)',
                v_partition_name,
                v_start_date,
                v_end_date
            );
            
            -- 创建分区本地索引
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS %I ON review_system.%I (game_id, created_at)',
                v_partition_name || '_game_id_idx',
                v_partition_name
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建自动维护分区的触发器
CREATE OR REPLACE FUNCTION review_system.auto_maintain_partitions()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM review_system.maintain_partitions();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_partitions_trigger
    AFTER INSERT ON review_system.reviews_partitioned_new
    FOR EACH STATEMENT
    EXECUTE FUNCTION review_system.auto_maintain_partitions();

-- 4. 创建初始分区
SELECT review_system.maintain_partitions();

-- 5. 迁移数据（如果需要）
INSERT INTO review_system.reviews_partitioned_new
SELECT * FROM review_system.reviews_partitioned
ON CONFLICT DO NOTHING;

-- 6. 创建全局索引
CREATE INDEX IF NOT EXISTS reviews_partitioned_new_game_id_idx 
ON review_system.reviews_partitioned_new (game_id, created_at);

CREATE INDEX IF NOT EXISTS reviews_partitioned_new_user_id_idx 
ON review_system.reviews_partitioned_new (user_id, created_at);

-- 7. 设置分区表统计信息
ALTER TABLE review_system.reviews_partitioned_new 
SET (autovacuum_analyze_scale_factor = 0.01);

-- 8. 添加分区表注释
COMMENT ON TABLE review_system.reviews_partitioned_new 
IS '游戏评论分区表 - 按时间范围分区';