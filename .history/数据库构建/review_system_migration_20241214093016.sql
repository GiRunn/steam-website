-- 1. 创建迁移状态表
CREATE TABLE IF NOT EXISTS review_system.migration_status (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    batch_number INTEGER,
    start_id BIGINT,
    end_id BIGINT,
    total_records INTEGER,
    processed_records INTEGER,
    status VARCHAR(20),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. 创建分批迁移存储过程
CREATE OR REPLACE PROCEDURE review_system.migrate_reviews_batch(
    batch_size INTEGER DEFAULT 1000
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_batch_number INTEGER;
    v_start_id BIGINT;
    v_end_id BIGINT;
    v_total_count INTEGER;
    v_processed INTEGER;
BEGIN
    -- 获取新批次号
    SELECT COALESCE(MAX(batch_number), 0) + 1 
    INTO v_batch_number 
    FROM review_system.migration_status;

    -- 获取待迁移数据的ID范围
    SELECT MIN(review_id), MAX(review_id), COUNT(*)
    INTO v_start_id, v_end_id, v_total_count
    FROM review_system.reviews r
    WHERE NOT EXISTS (
        SELECT 1 
        FROM review_system.reviews_partitioned rp 
        WHERE rp.review_id = r.review_id
    );

    -- 记录开始迁移
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, start_id, end_id, total_records, processed_records, status)
    VALUES 
    ('reviews', v_batch_number, v_start_id, v_end_id, v_total_count, 0, 'in_progress');

    -- 分批迁移数据
    FOR i IN 0..CEIL(v_total_count::float / batch_size) - 1 LOOP
        INSERT INTO review_system.reviews_partitioned
        SELECT *
        FROM review_system.reviews
        WHERE review_id >= v_start_id + (i * batch_size)
        AND review_id < v_start_id + ((i + 1) * batch_size)
        AND NOT EXISTS (
            SELECT 1 
            FROM review_system.reviews_partitioned rp 
            WHERE rp.review_id = reviews.review_id
        );

        GET DIAGNOSTICS v_processed = ROW_COUNT;

        -- 更新进度
        UPDATE review_system.migration_status
        SET processed_records = processed_records + v_processed
        WHERE batch_number = v_batch_number;

        -- 每批次后暂停一小段时间，避免系统负载过高
        PERFORM pg_sleep(0.1);
    END LOOP;

    -- 更新完成状态
    UPDATE review_system.migration_status
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE batch_number = v_batch_number;

EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    UPDATE review_system.migration_status
    SET status = 'error',
        error_message = SQLERRM,
        completed_at = CURRENT_TIMESTAMP
    WHERE batch_number = v_batch_number;
    RAISE;
END;
$$;

-- 3. 创建数据验证存储过程
CREATE OR REPLACE PROCEDURE review_system.validate_migration()
LANGUAGE plpgsql
AS $$
DECLARE
    v_old_count INTEGER;
    v_new_count INTEGER;
    v_mismatch_count INTEGER;
    v_validation_result JSONB;
BEGIN
    -- 检查记录总数
    SELECT COUNT(*) INTO v_old_count FROM review_system.reviews;
    SELECT COUNT(*) INTO v_new_count FROM review_system.reviews_partitioned;
    
    -- 检查数据一致性
    WITH comparison AS (
        SELECT review_id, game_id, user_id, rating, content, 
               MD5(COALESCE(content, '')) as content_hash
        FROM review_system.reviews
        EXCEPT
        SELECT review_id, game_id, user_id, rating, content,
               MD5(COALESCE(content, '')) as content_hash
        FROM review_system.reviews_partitioned
    )
    SELECT COUNT(*) INTO v_mismatch_count FROM comparison;
    
    -- 构建验证结果
    v_validation_result = jsonb_build_object(
        'old_count', v_old_count,
        'new_count', v_new_count,
        'mismatch_count', v_mismatch_count,
        'validation_time', CURRENT_TIMESTAMP
    );
    
    -- 记录验证结果
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, status, error_message)
    VALUES (
        'validation',
        -1,
        CASE 
            WHEN v_mismatch_count = 0 AND v_old_count = v_new_count THEN 'success'
            ELSE 'failed'
        END,
        v_validation_result::TEXT
    );

    -- 如果验证失败，抛出异常
    IF v_mismatch_count > 0 OR v_old_count != v_new_count THEN
        RAISE EXCEPTION 'Migration validation failed: %', v_validation_result;
    END IF;
END;
$$;

-- 4. 创建切换数据库存储过程
CREATE OR REPLACE PROCEDURE review_system.switch_to_partitioned()
LANGUAGE plpgsql
AS $$
BEGIN
    -- 验证迁移是否成功
    CALL review_system.validate_migration();
    
    -- 重命名原表
    ALTER TABLE review_system.reviews RENAME TO reviews_old;
    ALTER TABLE review_system.review_replies RENAME TO review_replies_old;
    ALTER TABLE review_system.review_summary RENAME TO review_summary_old;
    
    -- 创建新的视图
    CREATE OR REPLACE VIEW review_system.reviews AS 
    SELECT * FROM review_system.reviews_partitioned;
    
    -- 记录切换操作
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, status)
    VALUES ('switch_operation', -2, 'completed');
    
EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, status, error_message)
    VALUES ('switch_operation', -2, 'error', SQLERRM);
    RAISE;
END;
$$;

-- 5. 创建分区准备存储过程
CREATE OR REPLACE PROCEDURE review_system.prepare_partitions()
LANGUAGE plpgsql
AS $$
DECLARE
    v_min_date DATE;
    v_max_date DATE;
    v_current_date DATE;
    v_partition_name TEXT;
    v_start_date TEXT;
    v_end_date TEXT;
BEGIN
    -- 获取数据的时间范围
    SELECT 
        DATE_TRUNC('month', MIN(created_at))::DATE,
        DATE_TRUNC('month', MAX(created_at))::DATE + INTERVAL '1 month'
    INTO v_min_date, v_max_date
    FROM review_system.reviews;

    -- 创建每个月的分区
    v_current_date := v_min_date;
    WHILE v_current_date < v_max_date LOOP
        -- 评论分区
        v_partition_name := 'reviews_y' || TO_CHAR(v_current_date, 'YYYY') || 'm' || TO_CHAR(v_current_date, 'MM');
        v_start_date := v_current_date::TEXT;
        v_end_date := (v_current_date + INTERVAL '1 month')::TEXT;

        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            v_partition_name,
            v_start_date,
            v_end_date
        );

        -- 回复分区
        v_partition_name := 'review_replies_y' || TO_CHAR(v_current_date, 'YYYY') || 'm' || TO_CHAR(v_current_date, 'MM');
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_replies_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            v_partition_name,
            v_start_date,
            v_end_date
        );

        -- 汇总分区
        v_partition_name := 'review_summary_y' || TO_CHAR(v_current_date, 'YYYY') || 'm' || TO_CHAR(v_current_date, 'MM');
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.review_summary_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            v_partition_name,
            v_start_date,
            v_end_date
        );

        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;

    -- 记录分区创建状态
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, status, error_message)
    VALUES (
        'partition_creation',
        -3,
        'completed',
        format('Created partitions from %s to %s', v_min_date, v_max_date)
    );

EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    INSERT INTO review_system.migration_status 
    (table_name, batch_number, status, error_message)
    VALUES ('partition_creation', -3, 'error', SQLERRM);
    RAISE;
END;
$$; 