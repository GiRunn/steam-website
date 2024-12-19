-- 创建辅助函数来处理文件操作
CREATE OR REPLACE FUNCTION test_framework.write_file(
    p_filename text,
    p_content text,
    p_append boolean DEFAULT false
) RETURNS void AS $$
BEGIN
    PERFORM pg_catalog.pg_file_write(p_filename, p_content, p_append);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '无法写入文件 %: %', p_filename, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 创建函数来获取安全的文件路径
CREATE OR REPLACE FUNCTION test_framework.get_safe_path(
    p_filename text
) RETURNS text AS $$
BEGIN
    RETURN current_setting('data_directory') || '/' || p_filename;
END;
$$ LANGUAGE plpgsql; 