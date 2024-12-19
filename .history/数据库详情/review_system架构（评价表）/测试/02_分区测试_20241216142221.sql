-- 分区功能测试
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    future_date timestamp with time zone;
    partition_name text;
    v_exists boolean;
BEGIN
    -- 测试当前月份分区是否存在
    partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    
    -- 检查分区是否存在
    SELECT EXISTS (
        SELECT 1 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
        AND n.nspname = 'review_system'
    ) INTO v_exists;

    IF v_exists THEN
        RAISE NOTICE '当前月份分区存在性测试通过: %', partition_name;
    ELSE
        RAISE EXCEPTION '当前月份分区不存在: %', partition_name;
    END IF;

    -- 测试未来分区创建
    future_date := date_trunc('month', current_date + interval '1 month');
    partition_name := 'reviews_y' || to_char(future_date, 'YYYY') || 'm' || to_char(future_date, 'MM');
    
    -- 创建新分区
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
        FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        future_date,
        future_date + interval '1 month'
    );
    
    RAISE NOTICE '未来分区创建测试通过: %', partition_name;

    -- 测试分区边界数据插入
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        created_at
    ) VALUES (
        1001,
        1,
        4.5,
        '这是一个边界测试评论',
        future_date + interval '1 day'
    );
    
    RAISE NOTICE '分区边界数据插入测试通过';

    -- 测试分区管理表记录
    -- 使用 ON CONFLICT DO NOTHING 避免重复键错误
    INSERT INTO review_system.partition_management (
        table_name,
        partition_name,
        start_date,
        end_date
    ) VALUES (
        'reviews_partitioned',
        partition_name,
        future_date,
        future_date + interval '1 month'
    ) ON CONFLICT (table_name, partition_name) DO NOTHING;
    
    -- 验证分区管理表记录是否存在
    SELECT EXISTS (
        SELECT 1
        FROM review_system.partition_management
        WHERE table_name = 'reviews_partitioned'
        AND partition_name = partition_name
    ) INTO v_exists;

    IF v_exists THEN
        RAISE NOTICE '分区管理表记录测试通过';
    ELSE
        RAISE EXCEPTION '分区管理表记录验证失败';
    END IF;

    -- 验证分区数据
    SELECT EXISTS (
        SELECT 1
        FROM review_system.reviews_partitioned
        WHERE created_at >= future_date
        AND created_at < future_date + interval '1 month'
    ) INTO v_exists;

    IF v_exists THEN
        RAISE NOTICE '分区数据验证测试通过';
    ELSE
        RAISE EXCEPTION '分区数据验证失败';
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '分区测试失败: %', SQLERRM;
    RAISE;
END;
$$; 