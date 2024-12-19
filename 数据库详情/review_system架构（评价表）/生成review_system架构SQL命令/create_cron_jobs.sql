-- 方案1：如果已安装pg_cron扩展（需要管理员权限安装扩展）
-- 安装步骤：
-- 1. 使用管理员权限运行：
--    apt-get install postgresql-17-cron  (Ubuntu/Debian)
--    或
--    yum install postgresql-17-cron      (CentOS/RHEL)
--    或
--    在Windows下需要手动下载并安装pg_cron扩展
-- 2. 在postgresql.conf中添加：shared_preload_libraries = 'pg_cron'
-- 3. 重启PostgreSQL服务
-- 4. 然后运行以下命令：
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('partition_maintenance_job', '0 2 30 * *', 'SELECT review_system.run_maintenance_job();');

-- 方案2：使用系统调度（不需要pg_cron扩展）
-- 创建维护任务执行函数
CREATE OR REPLACE FUNCTION review_system.run_maintenance_job()
RETURNS void AS $$
BEGIN
    -- 执行分区检查和创建
    PERFORM review_system.check_and_create_partitions();
    
    -- 记录执行日志
    INSERT INTO review_system.maintenance_jobs (
        job_type, 
        last_run, 
        next_run
    ) 
    VALUES (
        'partition_maintenance',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + interval '1 month'
    )
    ON CONFLICT (job_type) 
    DO UPDATE SET 
        last_run = CURRENT_TIMESTAMP,
        next_run = CURRENT_TIMESTAMP + interval '1 month';
END;
$$ LANGUAGE plpgsql;

-- 测试执行维护任务
SELECT review_system.run_maintenance_job();