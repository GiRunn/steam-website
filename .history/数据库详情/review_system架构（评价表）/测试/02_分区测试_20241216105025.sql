-- 分区功能测试
DO $$
DECLARE
    current_date timestamp with time zone := CURRENT_TIMESTAMP;
    future_date timestamp with time zone;
    partition_name text;
BEGIN
    -- 测试当前月份分区是否存在
    partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    
    PERFORM review_system.run_test(
        '当前月份分区存在性测试',
        '分区测试',
        format($$
        SELECT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = %L
            AND n.nspname = 'review_system'
        );
        $$, partition_name)
    );

    -- 测试未来分区创建
    PERFORM review_system.run_test(
        '未来分区创建测试',
        '分区测试',
        $$
        SELECT review_system.create_future_partitions(2);
        $$
    );

    -- 测试分区边界数据插入
    future_date := date_trunc('month', current_date + interval '1 month');
    
    PERFORM review_system.run_test(
        '分区边界数据插入测试',
        '分区测试',
        format($$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, '这是一个边界测试评论', %L
        );
        $$, future_date)
    );

    -- 测试分区管理表记录
    PERFORM review_system.run_test(
        '分区管理表记录测试',
        '分区测试',
        $$
        SELECT EXISTS (
            SELECT 1 
            FROM review_system.partition_management
            WHERE table_name = 'reviews_partitioned'
        );
        $$
    );
END;
$$; 