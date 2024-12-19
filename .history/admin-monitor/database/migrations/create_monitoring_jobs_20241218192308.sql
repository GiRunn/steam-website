-- 创建定时任务表
CREATE TABLE IF NOT EXISTS review_system.monitoring_jobs (
    job_id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    interval_seconds INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT true
);

-- 插入默认任务
INSERT INTO review_system.monitoring_jobs (job_name, interval_seconds)
VALUES 
    ('collect_metrics_1s', 1),
    ('collect_metrics_1m', 60),
    ('collect_metrics_5m', 300),
    ('collect_metrics_1h', 3600);

-- 创建任务执行函数
CREATE OR REPLACE FUNCTION review_system.run_monitoring_jobs()
RETURNS void AS $$
BEGIN
    -- 执行所有到期的任务
    UPDATE review_system.monitoring_jobs
    SET 
        last_run = CURRENT_TIMESTAMP,
        next_run = CURRENT_TIMESTAMP + (interval_seconds || ' seconds')::interval
    WHERE 
        is_enabled = true 
        AND (next_run IS NULL OR next_run <= CURRENT_TIMESTAMP);

    -- 收集指标
    PERFORM review_system.collect_all_metrics();
END;
$$ LANGUAGE plpgsql; 