-- 设置环境变量
SET client_encoding = 'UTF8';
SET datestyle = 'ISO, YMD';
SET timezone = 'Asia/Shanghai';

-- 确保有足够的权限写入文件
SET session_preload_libraries = 'pg_stat_statements';
ALTER DATABASE games SET pg_stat_statements.track = 'all';

-- 创建必要的schema
CREATE SCHEMA IF NOT EXISTS test_framework;
CREATE SCHEMA IF NOT EXISTS test_results;

-- 设置搜索路径
SET search_path = test_framework, review_system, public;

-- 确保PostgreSQL有写入权限
DO $$
BEGIN
    -- 检查是否有写入权限
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_roles 
        WHERE rolname = current_user 
        AND rolsuper = true
    ) THEN
        RAISE NOTICE '警告: 当前用户可能没有足够的权限生成测试报告';
    END IF;
END $$;

-- 加载测试工具函数
\i test_utils.sql