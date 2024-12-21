-- 创建物化视图加速常用查询
CREATE MATERIALIZED VIEW review_system.review_stats_daily AS
SELECT 
    date_trunc('day', created_at) AS stat_date,
    game_id,
    COUNT(*) AS review_count,
    AVG(rating) AS avg_rating,
    SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 AS positive_rate,
    COUNT(DISTINCT user_id) AS unique_reviewers
FROM review_system.reviews_partitioned
WHERE review_status = 'active' AND deleted_at IS NULL
GROUP BY date_trunc('day', created_at), game_id;

-- 创建自动刷新物化视图的函数
CREATE OR REPLACE FUNCTION review_system.refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY review_system.review_stats_daily;
END;
$$ LANGUAGE plpgsql;

-- 创建表分区自动优化函数
CREATE OR REPLACE FUNCTION review_system.optimize_partitions()
RETURNS void AS $$
DECLARE
    v_partition record;
BEGIN
    FOR v_partition IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename LIKE 'reviews_y%m%'
    LOOP
        -- 更新表统计信息
        EXECUTE format('ANALYZE %I.%I', v_partition.schemaname, v_partition.tablename);
        
        -- 重整表空间
        EXECUTE format('VACUUM (ANALYZE, VERBOSE) %I.%I', 
                      v_partition.schemaname, v_partition.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql; 