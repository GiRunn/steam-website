-- 创建物化视图加速常用查询
CREATE MATERIALIZED VIEW IF NOT EXISTS review_system.review_stats_daily AS
SELECT 
    date_trunc('day', created_at) AS stat_date,
    game_id,
    COUNT(*) AS review_count,
    CAST(AVG(rating) AS NUMERIC(3,2)) AS avg_rating,
    CAST(
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END)::NUMERIC * 100.0 / COUNT(*))
            ELSE 0 
        END 
    AS NUMERIC(5,2)) AS positive_rate,
    COUNT(DISTINCT user_id) AS unique_reviewers,
    COALESCE(SUM(playtime_hours), 0) AS total_playtime,
    CAST(COALESCE(AVG(playtime_hours), 0) AS NUMERIC(10,2)) AS avg_playtime
FROM review_system.reviews_partitioned
WHERE review_status = 'active' AND deleted_at IS NULL
GROUP BY date_trunc('day', created_at), game_id;

-- 创建物化视图的唯一索引（用于并发刷新）
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_stats_daily_unique 
ON review_system.review_stats_daily (stat_date, game_id);

-- 创建自动刷新物化视图的函数
CREATE OR REPLACE FUNCTION review_system.refresh_materialized_views()
RETURNS void AS $$
BEGIN
    -- 并发刷新物化视图
    REFRESH MATERIALIZED VIEW CONCURRENTLY review_system.review_stats_daily;
    -- 记录刷新时间
    INSERT INTO review_system.maintenance_jobs (
        job_type, 
        last_run, 
        next_run
    ) VALUES (
        'refresh_materialized_views',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + interval '1 hour'
    )
    ON CONFLICT (job_type) DO UPDATE 
    SET last_run = CURRENT_TIMESTAMP,
        next_run = CURRENT_TIMESTAMP + interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- 创建表分区自动优化函数
CREATE OR REPLACE FUNCTION review_system.optimize_partitions()
RETURNS void AS $$
DECLARE
    v_partition record;
    v_start_time timestamp with time zone;
BEGIN
    v_start_time := CURRENT_TIMESTAMP;
    
    FOR v_partition IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'review_system' 
        AND tablename LIKE 'reviews_y%m%'
    LOOP
        BEGIN
            -- 更新表统计信息
            EXECUTE format('ANALYZE %I.%I', v_partition.schemaname, v_partition.tablename);
            
            -- 重整表空间
            EXECUTE format('VACUUM (ANALYZE, VERBOSE) %I.%I', 
                         v_partition.schemaname, v_partition.tablename);
                         
            -- 记录优化结果
            INSERT INTO review_system.maintenance_jobs (
                job_type,
                details,
                last_run,
                next_run
            ) VALUES (
                'partition_optimization',
                format('已优化分区: %I.%I', v_partition.schemaname, v_partition.tablename),
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP + interval '1 day'
            );
        EXCEPTION WHEN OTHERS THEN
            -- 记录错误但继续处理其他分区
            RAISE WARNING '优化分区 %.% 时出错: %', 
                v_partition.schemaname, v_partition.tablename, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务
DO $$
BEGIN
    -- 如果已安装pg_cron扩展，则创建定时任务
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- 每小时刷新物化视图
        PERFORM cron.schedule('refresh_mv_hourly', '0 * * * *', 
            'SELECT review_system.refresh_materialized_views()');
            
        -- 每天凌晨3点优化分区
        PERFORM cron.schedule('optimize_partitions_daily', '0 3 * * *', 
            'SELECT review_system.optimize_partitions()');
    END IF;
END $$; 

-- 添加自适应统计信息收集
CREATE OR REPLACE FUNCTION review_system.update_table_statistics()
RETURNS void AS $$
DECLARE
    v_table record;
BEGIN
    FOR v_table IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'review_system'
    LOOP
        EXECUTE format('ANALYZE VERBOSE %I.%I', v_table.schemaname, v_table.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 添加查询性能监控
CREATE TABLE review_system.query_performance_log (
    log_id SERIAL PRIMARY KEY,
    query_text TEXT,
    execution_time INTERVAL,
    cpu_usage NUMERIC(5,2),
    memory_usage NUMERIC(5,2),
    rows_affected BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 