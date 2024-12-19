-- 分区功能测试
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    future_date timestamp with time zone;
    v_partition_name text;
    v_exists boolean;
    v_start_time timestamp;
BEGIN
    v_start_time := clock_timestamp();
    
    -- 测试当前月份分区是否存在
    BEGIN
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
            PERFORM review_system.record_test_result(
                '当前月份分区检查',
                '分区测试',
                '通过',
                NULL,
                clock_timestamp() - v_start_time
            );
        ELSE
            PERFORM review_system.record_test_result(
                '当前月份分区检查',
                '分区测试',
                '失败',
                '分区不存在: ' || v_partition_name,
                clock_timestamp() - v_start_time
            );
            RAISE EXCEPTION '当前月份分区不存在: %', v_partition_name;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '当前月份分区检查',
            '分区测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;

    -- 测试未来分区创建
    BEGIN
        v_start_time := clock_timestamp();
        
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
        
        PERFORM review_system.record_test_result(
            '未来分区创建',
            '分区测试',
            '通过',
            NULL,
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '未来分区创建',
            '分区测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
        RAISE;
    END;
END $$; 