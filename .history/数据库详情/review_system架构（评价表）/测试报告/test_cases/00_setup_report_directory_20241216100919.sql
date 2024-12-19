-- 创建报告目录并设置权限
DO $$
BEGIN
    -- 检查是否有权限创建目录
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_roles 
        WHERE rolname = current_user 
        AND rolsuper
    ) THEN
        RAISE EXCEPTION '需要超级用户权限来创建报告目录';
    END IF;

    -- 创建报告保存目录
    PERFORM pg_file_write(
        'create_report_dir.sh',
        E'#!/bin/bash\n' ||
        'mkdir -p /var/lib/postgresql/test_reports\n' ||
        'chown postgres:postgres /var/lib/postgresql/test_reports\n' ||
        'chmod 755 /var/lib/postgresql/test_reports',
        false
    );
    
    -- 执行shell脚本
    PERFORM pg_exec('sh /tmp/create_report_dir.sh');
END $$;

-- 修改报告生成函数中的保存路径
CREATE OR REPLACE FUNCTION review_system.get_report_path()
RETURNS TEXT AS $$
BEGIN
    -- 检查默认目录是否可写
    IF pg_file_write('/var/lib/postgresql/test_reports/test.tmp', '', false) THEN
        RETURN '/var/lib/postgresql/test_reports/';
    END IF;
    
    -- 如果默认目录不可写，使用临时目录
    RETURN '/tmp/review_system_test_reports/';
END;
$$ LANGUAGE plpgsql; 