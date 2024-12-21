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
        ) PARTITION BY RANGE (created_at, game_id);
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
CREATE OR REPLACE FUNCTION review_system.create_partition_for_month(
    p_schema_name TEXT, 
    p_table_name TEXT, 
    p_start_date DATE, 
    p_end_date DATE
) RETURNS VOID AS $$
DECLARE
    v_partition_name TEXT;
BEGIN
    v_partition_name := p_table_name || '_y' || TO_CHAR(p_start_date, 'YYYY') || 'm' || TO_CHAR(p_start_date, 'MM');
    
    -- 检查分区是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = p_schema_name 
        AND c.relname = v_partition_name
    ) THEN
        -- 创建新分区
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I.%I 
            PARTITION OF %I.%I 
            FOR VALUES FROM (%L) TO (%L)
            WITH (
                autovacuum_analyze_scale_factor = 0.01,
                autovacuum_vacuum_scale_factor = 0.01
            )',
            p_schema_name, v_partition_name,
            p_schema_name, p_table_name,
            p_start_date,
            p_end_date
        );
        
        -- 创建分区本地索引
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I.%I (game_id, created_at)',
            v_partition_name || '_game_id_idx',
            p_schema_name, v_partition_name
        );
        
        RAISE NOTICE '创建分区: % (% to %)', v_partition_name, p_start_date, p_end_date;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建分区管理函数
CREATE OR REPLACE FUNCTION review_system.maintain_partitions()
RETURNS VOID AS $$
DECLARE
    v_current_date DATE := CURRENT_DATE;
    v_start_date DATE;
    v_end_date DATE;
    v_months_ahead INTEGER := 3;
BEGIN
    -- 创建当前月份及未来3个月的分区
    FOR i IN 0..v_months_ahead LOOP
        v_start_date := DATE_TRUNC('month', v_current_date + (i || ' months')::interval);
        v_end_date := v_start_date + INTERVAL '1 month';
        
        -- 为 reviews_partitioned_new 创建分区
        PERFORM review_system.create_partition_for_month(
            'review_system', 
            'reviews_partitioned_new', 
            v_start_date, 
            v_end_date
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建自动维护分区的触发器函数
CREATE OR REPLACE FUNCTION review_system.auto_maintain_partitions()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM review_system.maintain_partitions();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS maintain_partitions_trigger ON review_system.reviews_partitioned_new;
CREATE TRIGGER maintain_partitions_trigger
    AFTER INSERT ON review_system.reviews_partitioned_new
    FOR EACH STATEMENT
    EXECUTE FUNCTION review_system.auto_maintain_partitions();

-- 6. 初始化分区
DO $$
BEGIN
    PERFORM review_system.maintain_partitions();
END $$;

-- 7. 数据迁移（安全的迁移方式）
DO $$
DECLARE
    v_current_date TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    v_start_date TIMESTAMP WITH TIME ZONE := DATE_TRUNC('month', v_current_date);
    v_end_date TIMESTAMP WITH TIME ZONE := v_start_date + INTERVAL '1 month';
BEGIN
    -- 检查是否有数据需要迁移
    IF EXISTS (
        SELECT 1 
        FROM review_system.reviews_partitioned 
        WHERE created_at >= v_start_date AND created_at < v_end_date
        AND NOT EXISTS (
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
        WHERE created_at >= v_start_date AND created_at < v_end_date
        ON CONFLICT (review_id, created_at) DO NOTHING;
    END IF;
END $$;

-- 8. 创建全局索引
CREATE INDEX IF NOT EXISTS reviews_partitioned_new_game_id_idx 
ON review_system.reviews_partitioned_new (game_id, created_at);

CREATE INDEX IF NOT EXISTS reviews_partitioned_new_user_id_idx 
ON review_system.reviews_partitioned_new (user_id, created_at);

-- 9. 添加分区表注释
COMMENT ON TABLE review_system.reviews_partitioned_new 
IS '游戏评论分区表 - 按时间范围分区';