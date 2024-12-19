CREATE OR REPLACE FUNCTION review_system.monitor_database_metrics()
RETURNS TABLE (
    metric_name TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    
    -- CPU使用率
    SELECT 
        'CPU使用率'::TEXT,
        (SELECT COALESCE(cpu_usage, 0) FROM pg_stat_activity WHERE pid = pg_backend_pid()),
        80.0,
        CASE 
            WHEN cpu_usage > 80 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity 
    WHERE pid = pg_backend_pid();

    -- 内存使用情况
    UNION ALL
    SELECT 
        '内存使用率'::TEXT,
        (SELECT COALESCE(total_exec_time, 0) FROM pg_stat_statements 
         WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user) 
         LIMIT 1),
        90.0,
        CASE 
            WHEN total_exec_time > 90 THEN '警告'
            ELSE '正常'
        END;

    -- 连接数
    UNION ALL
    SELECT 
        '当前连接数'::TEXT,
        (SELECT count(*) FROM pg_stat_activity)::NUMERIC,
        100.0,
        CASE 
            WHEN count(*) > 100 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_activity;

    -- 查询响应时间
    UNION ALL
    SELECT 
        '平均查询响应时间(ms)'::TEXT,
        COALESCE(mean_exec_time, 0),
        1000.0,
        CASE 
            WHEN mean_exec_time > 1000 THEN '警告'
            ELSE '正常'
        END
    FROM pg_stat_statements
    WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql; 