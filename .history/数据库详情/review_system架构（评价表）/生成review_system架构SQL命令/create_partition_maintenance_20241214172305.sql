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