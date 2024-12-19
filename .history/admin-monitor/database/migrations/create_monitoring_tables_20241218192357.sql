-- 在review_system架构中创建监控相关表

-- 系统指标历史记录表
CREATE TABLE IF NOT EXISTS review_system.system_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_in_bytes BIGINT,
    network_out_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 数据库性能指标历史记录表
CREATE TABLE IF NOT EXISTS review_system.database_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    database_name VARCHAR(50),
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    transactions_per_second DECIMAL(10,2),
    cache_hit_ratio DECIMAL(5,2),
    buffer_hit_ratio DECIMAL(5,2),
    deadlocks_count INTEGER,
    blocks_read BIGINT,
    blocks_hit BIGINT,
    temp_files BIGINT,
    temp_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 查询性能历史记录表
CREATE TABLE IF NOT EXISTS review_system.query_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    query_id TEXT,
    database_name VARCHAR(50),
    query_text TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    min_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows_processed BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 表空间使用历史记录表
CREATE TABLE IF NOT EXISTS review_system.tablespace_metrics_history (
    id BIGSERIAL PRIMARY KEY,
    tablespace_name VARCHAR(50),
    total_size BIGINT,
    used_size BIGINT,
    free_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建分区索引
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at 
ON review_system.system_metrics_history(created_at);

CREATE INDEX IF NOT EXISTS idx_database_metrics_created_at 
ON review_system.database_metrics_history(created_at);

CREATE INDEX IF NOT EXISTS idx_query_metrics_created_at 
ON review_system.query_metrics_history(created_at);

CREATE INDEX IF NOT EXISTS idx_tablespace_metrics_created_at 
ON review_system.tablespace_metrics_history(created_at);

-- 创建保留策略(保留30天数据)
CREATE OR REPLACE FUNCTION review_system.cleanup_old_metrics()
RETURNS void AS $$
BEGIN
    DELETE FROM review_system.system_metrics_history 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    DELETE FROM review_system.database_metrics_history 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    DELETE FROM review_system.query_metrics_history 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    DELETE FROM review_system.tablespace_metrics_history 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql; 