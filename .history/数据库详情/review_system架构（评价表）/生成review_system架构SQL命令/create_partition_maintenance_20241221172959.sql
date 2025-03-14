-- 创建分区管理表
CREATE TABLE IF NOT EXISTS review_system.partition_management (
    partition_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    partition_name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (table_name, partition_name)
);

-- 创建检查分区状态的函数
CREATE OR REPLACE FUNCTION review_system.check_partition_status()
RETURNS void AS $$
DECLARE
    latest_partition_date TIMESTAMP WITH TIME ZONE;
    current_date TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    months_ahead INTEGER := 2; -- 保持至少2个月的分区
BEGIN
    -- 获取最新分区的结束日期
    SELECT MAX(end_date)
    INTO latest_partition_date
    FROM review_system.partition_management
    WHERE table_name = 'reviews_partitioned';

    -- 如果最新分区日期小于当前日期加上2个月，则创建新分区
    IF latest_partition_date IS NULL OR latest_partition_date < (current_date + (months_ahead || ' months')::interval) THEN
        PERFORM review_system.create_future_partitions(months_ahead);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建分区创建后的记录函数
CREATE OR REPLACE FUNCTION review_system.record_partition_creation(
    p_table_name VARCHAR,
    p_partition_name VARCHAR,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS void AS $$
BEGIN
    INSERT INTO review_system.partition_management (
        table_name,
        partition_name,
        start_date,
        end_date
    ) VALUES (
        p_table_name,
        p_partition_name,
        p_start_date,
        p_end_date
    )
    ON CONFLICT (table_name, partition_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 创建定期维护函数
CREATE OR REPLACE FUNCTION review_system.maintain_partitions()
RETURNS void AS $$
BEGIN
    -- 执行VACUUM
    FOR partition_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename LIKE 'reviews_y%'
    LOOP
        EXECUTE format('VACUUM ANALYZE review_system.%I', partition_name);
    END LOOP;
    
    -- 更新统计信息
    ANALYZE review_system.reviews_partitioned;
    
    -- 记录维护时间
    INSERT INTO review_system.maintenance_jobs (
        job_type,
        last_run,
        next_run
    ) VALUES (
        'partition_maintenance',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + interval '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        SELECT cron.schedule('0 2 * * *', $$SELECT review_system.maintain_partitions()$$);
    END IF;
END $$; 