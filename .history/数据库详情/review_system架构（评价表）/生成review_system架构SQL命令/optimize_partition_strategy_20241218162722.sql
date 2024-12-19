-- 优化分区策略

-- 0. 确保基础分区表存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename = 'reviews_partitioned'
    ) THEN
        CREATE TABLE review_system.reviews_partitioned (
            review_id BIGSERIAL,
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
            deleted_at TIMESTAMP WITH TIME ZONE,
            PRIMARY KEY (review_id, created_at)
        ) PARTITION BY RANGE (created_at);
    END IF;
END $$;

-- 1. 创建新的分区表结构（确保与原表结构完全匹配）
CREATE TABLE IF NOT EXISTS review_system.reviews_partitioned_new (
    review_id BIGSERIAL,
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
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (review_id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. 创建分区维护函数
CREATE OR REPLACE FUNCTION review_system.maintain_partitions()
RETURNS void AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_partition_name TEXT;
    v_min_date DATE;
    v_max_date DATE;
BEGIN
    -- 获取数据的时间范围
    SELECT 
        COALESCE(DATE_TRUNC('month', MIN(created_at)), CURRENT_DATE),
        COALESCE(DATE_TRUNC('month', MAX(created_at)), CURRENT_DATE)
    INTO v_min_date, v_max_date
    FROM review_system.reviews_partitioned;

    -- 如果reviews_partitioned表为空，则使用当前月份作为起始点
    IF v_min_date IS NULL THEN
        v_min_date := DATE_TRUNC('month', CURRENT_DATE);
        v_max_date := v_min_date;
    END IF;

    -- 创建从最早数据到未来3个月的分区
    v_start_date := v_min_date;
    WHILE v_start_date <= v_max_date + INTERVAL '3 months' LOOP
        v_end_date := v_start_date + INTERVAL '1 month';
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
            
            RAISE NOTICE '创建分区: % (% to %)', v_partition_name, v_start_date, v_end_date;
        END IF;
        
        v_start_date := v_end_date;
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

-- 删除已存在的触发器（如果存在）
DROP TRIGGER IF EXISTS maintain_partitions_trigger ON review_system.reviews_partitioned_new;

-- 创建新的触发器
CREATE TRIGGER maintain_partitions_trigger
    AFTER INSERT ON review_system.reviews_partitioned_new
    FOR EACH STATEMENT
    EXECUTE FUNCTION review_system.auto_maintain_partitions();

-- 4. 创建初始分区
SELECT review_system.maintain_partitions();

-- 5. 迁移数据（如果需要）
-- 使用安全的迁移方式
DO $$
BEGIN
    -- 检查是否有数据需要迁移
    IF EXISTS (
        SELECT 1 
        FROM review_system.reviews_partitioned 
        WHERE NOT EXISTS (
            SELECT 1 
            FROM review_system.reviews_partitioned_new 
            WHERE review_id = reviews_partitioned.review_id
        )
    ) THEN
        INSERT INTO review_system.reviews_partitioned_new (
            review_id, game_id, user_id, rating, content, 
            playtime_hours, platform, language, is_recommended, 
            likes_count, review_status, created_at, updated_at, deleted_at
        )
        SELECT 
            review_id, game_id, user_id, rating, content, 
            playtime_hours, platform, language, is_recommended, 
            COALESCE(likes_count::INTEGER, 0), review_status, 
            created_at, updated_at, deleted_at
        FROM review_system.reviews_partitioned
        ON CONFLICT (review_id, created_at) DO NOTHING;
    END IF;
END $$;

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