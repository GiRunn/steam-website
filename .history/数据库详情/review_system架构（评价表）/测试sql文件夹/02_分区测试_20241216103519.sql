-- 测试分区创建和管理
DO $$
DECLARE
    current_partition_name TEXT;
    future_partition_name TEXT;
    current_date TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    future_date TIMESTAMP WITH TIME ZONE := current_date + INTERVAL '1 month';
BEGIN
    -- 构造分区名称
    current_partition_name := 'reviews_y' || to_char(current_date, 'YYYY') || 'm' || to_char(current_date, 'MM');
    future_partition_name := 'reviews_y' || to_char(future_date, 'YYYY') || 'm' || to_char(future_date, 'MM');
    
    -- 测试当前月份分区是否存在
    PERFORM review_system.assert_equals(
        '测试当前月份分区存在',
        TRUE,
        EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = current_partition_name
            AND n.nspname = 'review_system'
        )
    );
    
    -- 测试未来分区是否创建
    PERFORM review_system.assert_equals(
        '测试未来月份分区存在',
        TRUE,
        EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = future_partition_name
            AND n.nspname = 'review_system'
        )
    );
    
    -- 测试分区管理表记录
    PERFORM review_system.assert_equals(
        '测试分区管理记录',
        TRUE,
        EXISTS (
            SELECT 1 FROM review_system.partition_management
            WHERE partition_name = current_partition_name
        )
    );
END;
$$; 