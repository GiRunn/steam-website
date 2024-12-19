-- 分区管理测试
DO $$ 
BEGIN
    -- 测试分区创建
    PERFORM test_framework.run_test(
        'Create Future Partitions Test',
        'Partition Management',
        $$
        SELECT review_system.create_future_partitions(3);
        SELECT COUNT(*) 
        FROM review_system.partition_management 
        WHERE created_at >= CURRENT_DATE;
        $$
    );

    -- 测试分区边界插入
    PERFORM test_framework.run_test(
        'Partition Boundary Insert Test',
        'Partition Management',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, 'Test review',
            CURRENT_TIMESTAMP + interval '2 months'
        );
        $$
    );

    -- 测试分区检查触发器
    PERFORM test_framework.run_test(
        'Partition Check Trigger Test',
        'Partition Management',
        $$
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, 'Trigger test review',
            CURRENT_TIMESTAMP + interval '1 month'
        );
        $$
    );
END $$; 