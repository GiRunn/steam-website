-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 创建监控相关的表
CREATE TABLE IF NOT EXISTS admin_monitor.system_metrics (
    id BIGSERIAL PRIMARY KEY,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_monitor.database_metrics (
    id BIGSERIAL PRIMARY KEY,
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    cache_hit_ratio DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建视图来简化查询
CREATE OR REPLACE VIEW admin_monitor.v_system_stats AS
SELECT 
    (SELECT count(*) FROM pg_stat_activity) as total_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
    (SELECT COALESCE(ROUND(100.0 * sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2), 0.0)
     FROM pg_statio_user_tables) as cache_hit_ratio; 