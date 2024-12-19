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

-- 加载测试工具函数
\i test_utils.sql