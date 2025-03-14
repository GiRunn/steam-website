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

-- 优化物化视图刷新策略
CREATE MATERIALIZED VIEW review_system.review_stats_hourly
WITH (parallel_workers = 4) AS -- 启用并行处理
SELECT 
    date_trunc('hour', created_at) AS stat_hour,
    game_id,
    COUNT(*) AS review_count,
    AVG(rating) AS avg_rating,
    SUM(likes_count) AS total_likes
FROM review_system.reviews_partitioned
WHERE review_status = 'active'
GROUP BY 1, 2
WITH DATA;

-- 创建并发刷新函数
CREATE OR REPLACE FUNCTION review_system.refresh_stats_concurrent()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY review_system.review_stats_hourly;
END;
$$ LANGUAGE plpgsql; 

-- 添加并发控制机制
CREATE OR REPLACE FUNCTION review_system.handle_concurrent_writes()
RETURNS TRIGGER AS $$
DECLARE
    max_retries INTEGER := 3;
    current_retry INTEGER := 0;
    success BOOLEAN := false;
BEGIN
    WHILE NOT success AND current_retry < max_retries LOOP
        BEGIN
            -- 使用行级锁
            PERFORM 1 FROM review_system.reviews_partitioned
            WHERE review_id = NEW.review_id
            FOR UPDATE NOWAIT;
            
            success := true;
        EXCEPTION WHEN lock_not_available THEN
            current_retry := current_retry + 1;
            PERFORM pg_sleep(random() * 0.1); -- 随机退避
        END;
    END LOOP;

    IF NOT success THEN
        RAISE EXCEPTION '并发写入失败，请重试';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建并发写入触发器
CREATE TRIGGER trg_handle_concurrent_writes
    BEFORE INSERT OR UPDATE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.handle_concurrent_writes();