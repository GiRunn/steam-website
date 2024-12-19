-- 设置环境变量
SET client_encoding = 'UTF8';
SET datestyle = 'ISO, YMD';
SET timezone = 'Asia/Shanghai';

-- 创建测试结果目录（如果需要）
DO $$
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS test_results');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 设置搜索路径
SET search_path = test_framework, review_system, public; 