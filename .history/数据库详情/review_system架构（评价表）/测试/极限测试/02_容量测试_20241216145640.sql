-- 容量测试
DO $$
DECLARE
    v_start_time timestamp;
    v_test_content text;
BEGIN
    -- 1. 超大数据量测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试插入100万条记录
        SELECT * FROM review_system.test_massive_data_load(
            1000000,  -- 总记录数
            10000     -- 批次大小
        );
        
        PERFORM review_system.record_test_result(
            '超大数据量测试',
            '极限测试-容量测试',
            '通过',
            '成功测试大规模数据插入',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '超大数据量测试',
            '极限测试-容量测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. 超长内容测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 测试10MB大小的内容
        SELECT * FROM review_system.test_long_content(
            10 * 1024 * 1024  -- 10MB in bytes
        );
        
        PERFORM review_system.record_test_result(
            '超长内容测试',
            '极限测试-容量测试',
            '通过',
            '成功测试超长内容处理',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '超长内容测试',
            '极限测试-容量测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 3. 大量分区测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 创建未来12个月的分区
        FOR i IN 1..12 LOOP
            DECLARE
                v_partition_date timestamp;
                v_partition_name text;
            BEGIN
                v_partition_date := date_trunc('month', CURRENT_DATE + (i || ' months')::interval);
                v_partition_name := 'reviews_y' || to_char(v_partition_date, 'YYYY') || 'm' || to_char(v_partition_date, 'MM');
                
                EXECUTE format(
                    'CREATE TABLE IF NOT EXISTS review_system.%I PARTITION OF review_system.reviews_partitioned
                    FOR VALUES FROM (%L) TO (%L)',
                    v_partition_name,
                    v_partition_date,
                    v_partition_date + interval '1 month'
                );
            END;
        END LOOP;
        
        PERFORM review_system.record_test_result(
            '大量分区测试',
            '极限测试-容量测试',
            '通过',
            '成功创建12个月的分区',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '大量分区测试',
            '极限测试-容量测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 4. 大量索引测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 创建多个测试索引
        CREATE INDEX IF NOT EXISTS idx_reviews_rating 
            ON review_system.reviews_partitioned(rating);
        CREATE INDEX IF NOT EXISTS idx_reviews_platform 
            ON review_system.reviews_partitioned(platform);
        CREATE INDEX IF NOT EXISTS idx_reviews_language 
            ON review_system.reviews_partitioned(language);
        CREATE INDEX IF NOT EXISTS idx_reviews_recommended 
            ON review_system.reviews_partitioned(is_recommended);
        CREATE INDEX IF NOT EXISTS idx_reviews_created 
            ON review_system.reviews_partitioned(created_at);
        CREATE INDEX IF NOT EXISTS idx_reviews_updated 
            ON review_system.reviews_partitioned(updated_at);
        CREATE INDEX IF NOT EXISTS idx_reviews_playtime 
            ON review_system.reviews_partitioned(playtime_hours);
        CREATE INDEX IF NOT EXISTS idx_reviews_content_gin 
            ON review_system.reviews_partitioned USING gin(to_tsvector('english', content));
        
        PERFORM review_system.record_test_result(
            '大量索引测试',
            '极限测试-容量测试',
            '通过',
            '成功创建和维护多个索引',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '大量索引测试',
            '极限测试-容量测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 5. 存储空间监控测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 检查表和索引的大小
        WITH TableSizes AS (
            SELECT
                schemaname,
                tablename,
                pg_total_relation_size(schemaname || '.' || tablename) as total_bytes,
                pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
                pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
                pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - 
                             pg_relation_size(schemaname || '.' || tablename)) as index_size
            FROM pg_tables
            WHERE schemaname = 'review_system'
        )
        SELECT * FROM TableSizes
        WHERE total_bytes > 0
        ORDER BY total_bytes DESC;
        
        PERFORM review_system.record_test_result(
            '存储空间监控测试',
            '极限测试-容量测试',
            '通过',
            '成功监控存储空间使用情况',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '存储空间监控测试',
            '极限测试-容量测试',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;
END $$; 