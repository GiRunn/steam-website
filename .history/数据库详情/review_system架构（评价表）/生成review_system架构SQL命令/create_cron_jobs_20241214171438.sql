-- 首先确保已安装pg_cron扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建定时任务，每月30日凌晨2点执行分区维护
SELECT cron.schedule('partition_maintenance_job', '0 2 30 * *', $$
    -- 执行分区检查和创建
    SELECT review_system.check_and_create_partitions();
    
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
$$);

-- 查看已创建的定时任务
SELECT * FROM cron.job;

-- 如果需要删除定时任务
-- SELECT cron.unschedule('partition_maintenance_job');

-- 如果没有pg_cron扩展，也可以使用系统cron，创建一个SQL脚本：
-- 创建执行脚本
DO $$
BEGIN
    EXECUTE format(
        'CREATE OR REPLACE FUNCTION review_system.run_maintenance_job()
        RETURNS void AS $func$
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
                ''partition_maintenance'',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP + interval ''1 month''
            )
            ON CONFLICT (job_type) 
            DO UPDATE SET 
                last_run = CURRENT_TIMESTAMP,
                next_run = CURRENT_TIMESTAMP + interval ''1 month'';
        END;
        $func$ LANGUAGE plpgsql;'
    );
END $$;

-- 然后可以通过系统cron调用这个函数：
-- 30 2 30 * * psql -U your_user -d your_database -c "SELECT review_system.run_maintenance_job();" 