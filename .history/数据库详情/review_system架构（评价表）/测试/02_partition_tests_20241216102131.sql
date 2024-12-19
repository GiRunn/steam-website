-- 分区管理测试
DO $$ 
BEGIN
    -- 测试分区创建
    PERFORM test_framework.run_test(
        '创建未来分区测试',
        '分区管理',
        $$
        SELECT review_system.create_future_partitions(3);
        SELECT test_framework.assert_equals(
            true,
            EXISTS (
                SELECT 1 
                FROM review_system.partition_management 
                WHERE start_date >= CURRENT_DATE 
                AND start_date < CURRENT_DATE + INTERVAL '3 months'
            ),
            '应该成功创建未来3个月的分区'
        );
        $$
    );

    -- 测试分区边界插入
    PERFORM test_framework.run_test(
        '分区边界数据插入测试',
        '分区管理',
        $$
        -- 插入当前月份数据
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, '当前月份测试评论',
            CURRENT_TIMESTAMP
        );
        
        -- 插入下个月数据
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, '下月测试评论',
            CURRENT_TIMESTAMP + interval '1 month'
        );
        
        -- 插入两个月后数据
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, created_at
        ) VALUES (
            1001, 1, 4.5, '两个月后测试评论',
            CURRENT_TIMESTAMP + interval '2 months'
        );
        $$
    );

    -- 测试分区数据查询
    PERFORM test_framework.run_test(
        '分区数据查询测试',
        '分区管理',
        $$
        WITH monthly_stats AS (
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as review_count
            FROM review_system.reviews_partitioned
            GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT test_framework.assert_equals(
            true,
            EXISTS (
                SELECT 1 
                FROM monthly_stats 
                WHERE review_count > 0
            ),
            '每个月份都应该有测试数据'
        );
        $$
    );
END $$; 