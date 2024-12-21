-- 创建备份记录表
CREATE TABLE IF NOT EXISTS review_system.backup_history (
    backup_id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL,
    backup_status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    file_path TEXT,
    file_size BIGINT,
    error_message TEXT
);

-- 创建备份元数据表
CREATE TABLE IF NOT EXISTS review_system.backup_metadata (
    metadata_id SERIAL PRIMARY KEY,
    backup_id INTEGER REFERENCES review_system.backup_history(backup_id),
    table_name VARCHAR(100) NOT NULL,
    record_count BIGINT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE,
    checksum TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建备份验证函数
CREATE OR REPLACE FUNCTION review_system.verify_backup(
    p_backup_id INTEGER
)
RETURNS TABLE (
    table_name VARCHAR(100),
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_metadata record;
BEGIN
    FOR v_metadata IN 
        SELECT * FROM review_system.backup_metadata 
        WHERE backup_id = p_backup_id
    LOOP
        -- 返回验证结果
        table_name := v_metadata.table_name;
        BEGIN
            -- 验证记录数
            EXECUTE format(
                'SELECT CASE WHEN COUNT(*) = $1 THEN true ELSE false END 
                 FROM %I.%I',
                'review_system',
                v_metadata.table_name
            ) USING v_metadata.record_count INTO is_valid;
            
            IF NOT is_valid THEN
                error_message := '记录数不匹配';
            ELSE
                error_message := NULL;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            is_valid := false;
            error_message := SQLERRM;
        END;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 