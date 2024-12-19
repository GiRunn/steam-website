/******************************************
 * 分区创建功能测试
 * 测试目标：验证分区表的自动创建和管理功能
 ******************************************/

-- 测试准备
--------------------------
-- 记录当前分区数量
SELECT COUNT(*) as initial_partition_count
FROM pg_partitions
WHERE schemaname = 'review_system'
AND tablename LIKE 'reviews_%';
错误： 关系 "pg_partitions" 不存在
LINE 2: FROM pg_partitions
             ^ 

错误:  关系 "pg_partitions" 不存在
SQL 状态: 42P01
字符: 49

-- 1. 自动分区创建测试
--------------------------

-- 1.1 测试当前月份分区
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, platform, language
) VALUES 
(9001, 901, 4.5, '测试当前月份分区', 'PC', 'zh-CN');

-- 验证当前月份分区是否存在
SELECT 
    schemaname,
    tablename,
    partitiontype,
    partitionboundary
FROM pg_partitions
WHERE schemaname = 'review_system'
AND tablename = 'reviews_y' || to_char(CURRENT_DATE, 'YYYY') || 'm' || to_char(CURRENT_DATE, 'MM');

/* 预期结果：
- 应自动创建当前月份的分区
- 分区边界应正确设置
*/

-- 1.2 测试未来月份分区
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, platform, language, created_at
) VALUES 
(9001, 902, 4.0, '测试下个月分区', 'PC', 'zh-CN', 
 CURRENT_TIMESTAMP + interval '1 month');

-- 验证未来月份分区是否创建
SELECT 
    schemaname,
    tablename,
    partitiontype,
    partitionboundary
FROM pg_partitions
WHERE schemaname = 'review_system'
AND tablename = 'reviews_y' || 
    to_char(CURRENT_DATE + interval '1 month', 'YYYY') || 
    'm' || 
    to_char(CURRENT_DATE + interval '1 month', 'MM');

/* 预期结果：
- 应自动创建下个月的分区
- 分区边界应正确设置
*/

-- 2. 分区索引测试
--------------------------

-- 2.1 验证分区索引创建
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'review_system'
AND tablename LIKE 'reviews_y%'
ORDER BY tablename, indexname;

/* 预期结果：
- 每个分区都应该有相应的索引
- 索引定义应与主表一致
*/

-- 3. 分区边界测试
--------------------------

-- 3.1 测试分区边界
BEGIN;
    -- 测试月份边界的第一天
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, platform, language, created_at
    ) VALUES 
    (9001, 903, 4.0, '测试月初', 'PC', 'zh-CN',
     date_trunc('month', CURRENT_DATE)::timestamp);

    -- 测试月份边界的最后一秒
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, platform, language, created_at
    ) VALUES 
    (9001, 904, 4.0, '测试月末', 'PC', 'zh-CN',
     (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 second')::timestamp);
ROLLBACK;

/* 预期结果：
- 边界值插入应成功
- 数据应进入正确的分区
*/

-- 4. 分区裁剪测试
--------------------------

-- 4.1 测试查询优化器的分区裁剪
EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
SELECT COUNT(*)
FROM review_system.reviews_partitioned
WHERE created_at >= date_trunc('month', CURRENT_DATE)
AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month';

/* 预期结果：
- 查询计划应显示分区裁剪
- 只应扫描相关分区
*/

-- 5. 分区管理功能测试
--------------------------

-- 5.1 测试分区重组
-- 注意：这是维护操作，需要在低峰期执行
BEGIN;
    -- 创建临时表
    CREATE TABLE review_system.temp_partition (LIKE review_system.reviews_partitioned);
    
    -- 移动数据
    INSERT INTO review_system.temp_partition
    SELECT * FROM review_system.reviews_partitioned
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month';
    
    -- 验证数据
    SELECT COUNT(*) as migrated_rows FROM review_system.temp_partition;
    
    -- 清理
    DROP TABLE review_system.temp_partition;
ROLLBACK;

-- 5.2 测试分区统计信息更新
ANALYZE review_system.reviews_partitioned;
SELECT 
    schemaname,
    tablename,
    n_live_tup,
    last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'review_system'
AND tablename LIKE 'reviews_y%'
ORDER BY tablename;

-- 6. 性能测试
--------------------------

-- 6.1 测试分区表写入性能
\timing on

DO $$
DECLARE
    v_start timestamp;
    v_end timestamp;
    v_count int := 1000;
BEGIN
    v_start := clock_timestamp();
    
    FOR i IN 1..v_count LOOP
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, platform, language,
            created_at
        ) VALUES (
            9001, 1000 + i, 4.0, 'Performance test ' || i, 'PC', 'en-US',
            CURRENT_TIMESTAMP + (random() * interval '30 days')
        );
    END LOOP;
    
    v_end := clock_timestamp();
    RAISE NOTICE 'Inserted % rows in %', v_count, v_end - v_start;
END;
$$;

\timing off

/* 预期结果：
- 批量插入性能应在可接受范围内
- 不同分区的写入应均匀分布
*/

-- 7. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

-- 清理统计信息
ANALYZE review_system.reviews_partitioned;
*/ 