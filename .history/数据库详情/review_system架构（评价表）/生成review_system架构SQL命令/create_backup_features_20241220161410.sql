-- 创建备份记录表
CREATE TABLE IF NOT EXISTS review_system.backup_history (
    backup_id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('FULL', 'INCREMENTAL', 'SCHEMA', 'TABLE')),
    backup_status VARCHAR(20) NOT NULL CHECK (backup_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    compression_type VARCHAR(20) DEFAULT 'GZIP',
    retention_days INTEGER DEFAULT 30,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    file_path TEXT,
    file_size BIGINT,
    error_message TEXT,
    created_by TEXT DEFAULT CURRENT_USER
);

-- 创建备份元数据表
CREATE TABLE IF NOT EXISTS review_system.backup_metadata (
    metadata_id SERIAL PRIMARY KEY,
    backup_id INTEGER REFERENCES review_system.backup_history(backup_id),
    table_name VARCHAR(100) NOT NULL,
    record_count BIGINT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE,
    checksum TEXT,
    partition_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建备份验证函数
CREATE OR REPLACE FUNCTION review_system.verify_backup(
    p_backup_id INTEGER
)
RETURNS TABLE (
    table_name VARCHAR(100),
    is_valid BOOLEAN,
    error_message TEXT,
    verification_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_metadata record;
    v_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 检查备份是否存在
    IF NOT EXISTS (SELECT 1 FROM review_system.backup_history WHERE backup_id = p_backup_id) THEN
        RAISE EXCEPTION '备份ID % 不存在', p_backup_id;
    END IF;
    
    FOR v_metadata IN 
        SELECT * FROM review_system.backup_metadata 
        WHERE backup_id = p_backup_id
    LOOP
        v_start_time := CURRENT_TIMESTAMP;
        table_name := v_metadata.table_name;
        verification_time := v_start_time;
        
        BEGIN
            -- 验证记录数
            EXECUTE format(
                'SELECT CASE WHEN COUNT(*) = $1 THEN true ELSE false END 
                 FROM %I.%I',
                'review_system',
                v_metadata.table_name
            ) USING v_metadata.record_count INTO is_valid;
            
            IF NOT is_valid THEN
                error_message := format(
                    '记录数不匹配. 预期: %s, 实际: %s',
                    v_metadata.record_count,
                    (SELECT COUNT(*) FROM review_system.reviews_partitioned)
                );
            ELSE
                error_message := NULL;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            is_valid := false;
            error_message := SQLERRM;
        END;
        
        -- 记录验证结果
        INSERT INTO review_system.backup_history (
            backup_type,
            backup_status,
            start_time,
            end_time,
            error_message
        ) VALUES (
            'VERIFICATION',
            CASE WHEN is_valid THEN 'COMPLETED' ELSE 'FAILED' END,
            v_start_time,
            CURRENT_TIMESTAMP,
            error_message
        );
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建清理过期备份的函数
CREATE OR REPLACE FUNCTION review_system.cleanup_old_backups()
RETURNS void AS $$
DECLARE
    v_backup record;
BEGIN
    FOR v_backup IN 
        SELECT * FROM review_system.backup_history
        WHERE backup_status = 'COMPLETED'
        AND start_time < CURRENT_TIMESTAMP - (retention_days || ' days')::interval
    LOOP
        -- 删除物理文件
        -- 注意：这里需要系统权限，建议通过外部脚本处理
        -- EXECUTE format('rm -f %s', v_backup.file_path);
        
        -- 删除元数据
        DELETE FROM review_system.backup_metadata
        WHERE backup_id = v_backup.backup_id;
        
        -- 删除历史记录
        DELETE FROM review_system.backup_history
        WHERE backup_id = v_backup.backup_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 