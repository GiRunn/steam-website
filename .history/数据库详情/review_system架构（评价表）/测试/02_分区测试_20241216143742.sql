-- 分区功能测试
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    future_date timestamp with time zone;
    v_partition_name text;
    v_exists boolean;
BEGIN
    -- 测试当前月份分区是否存在
    v_partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    
    -- 检查分区是否存在
    SELECT EXISTS (
        SELECT 1 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = v_partition_name
        AND n.nspname = 'review_system'
    ) INTO v_exists;

    IF v_exists THEN
        RAISE NOTICE '当前月份分区存在性测试通过: %', v_partition_name;
    ELSE
        RAISE EXCEPTION '当前月份分区不存在: %', v_partition_name;
    END IF;

    -- 测试未来分区创建
    future_date := date_trunc('month', current_date + interval '1 month');
    v_partition_name := 'reviews_y' || to_char(future_date, 'YYYY') || 'm' || to_char(future_date, 'MM');
    
    -- 创建新分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        v_partition_name,
        future_date,
        future_date + interval '1 month'
    );
    
    -- 记录分区创建
    INSERT INTO review_system.partition_management (
        table_name,
        partition_name,
        start_date,
        end_date
    ) VALUES (
        'reviews_partitioned',
        v_partition_name,
        future_date,
        future_date + interval '1 month'
    ) ON CONFLICT (table_name, partition_name) DO NOTHING;
    
    RAISE NOTICE '未来分区创建测试通过: %', v_partition_name;
END $$; 