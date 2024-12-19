-- 创建定时任务表（如果不存在）
CREATE TABLE IF NOT EXISTS review_system.maintenance_jobs (
    job_id SERIAL PRIMARY KEY,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    job_type VARCHAR(50) UNIQUE
);

-- 创建定时任务执行函数
CREATE OR REPLACE FUNCTION review_system.run_partition_maintenance()
RETURNS void AS $$
BEGIN
    -- 执行分区检查
    PERFORM review_system.check_and_create_partitions();
    
    -- 更新任务执行时间
    INSERT INTO review_system.maintenance_jobs (last_run, next_run, job_type)
    VALUES (
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + interval '1 day',
        'partition_maintenance'
    )
    ON CONFLICT (job_type) DO UPDATE
    SET last_run = CURRENT_TIMESTAMP,
        next_run = CURRENT_TIMESTAMP + interval '1 day';
END;
$$ LANGUAGE plpgsql; 