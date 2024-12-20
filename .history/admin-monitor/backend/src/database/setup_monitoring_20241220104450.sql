-- 添加性能优化相关的视图
CREATE OR REPLACE VIEW review_system.performance_insights AS
WITH table_stats AS (
    SELECT
        schemaname,
        relname,
        seq_scan,
        idx_scan,
        n_live_tup,
        n_dead_tup,
        last_vacuum,
        last_autovacuum
    FROM pg_stat_user_tables
    WHERE schemaname = 'review_system'
)
SELECT
    relname as table_name,
    CASE
        WHEN n_dead_tup > n_live_tup * 0.2 THEN '建议执行VACUUM'
        WHEN last_vacuum IS NULL AND last_autovacuum IS NULL THEN '建议配置自动VACUUM'
        WHEN seq_scan > idx_scan AND n_live_tup > 1000 THEN '建议添加索引'
        ELSE '性能正常'
    END as optimization_suggestion,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM table_stats; 