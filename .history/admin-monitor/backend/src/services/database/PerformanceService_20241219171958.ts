import BaseService from '../base/BaseService';

export default class PerformanceService extends BaseService {
    async getPerformanceMetrics() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT json_build_object(
                    'cache_hit_ratio', (
                        SELECT ROUND(COALESCE(
                            (SELECT sum(heap_blks_hit) * 100.0 / 
                             NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)
                             FROM pg_statio_user_tables), 0
                        ), 2)
                    ),
                    'avg_query_time', (
                        SELECT ROUND(COALESCE(
                            (SELECT AVG(EXTRACT(epoch FROM now() - query_start) * 1000)
                             FROM pg_stat_activity 
                             WHERE state = 'active' 
                             AND query_start IS NOT NULL), 0
                        ), 2)
                    ),
                    'connection_stats', (
                        SELECT json_build_object(
                            'active', COUNT(*) FILTER (WHERE state = 'active'),
                            'idle', COUNT(*) FILTER (WHERE state = 'idle'),
                            'idle_in_transaction', COUNT(*) FILTER (WHERE state = 'idle in transaction'),
                            'waiting', COUNT(*) FILTER (WHERE wait_event IS NOT NULL)
                        )
                        FROM pg_stat_activity
                        WHERE datname = current_database()
                    ),
                    'query_stats', (
                        SELECT json_agg(json_build_object(
                            'query', query,
                            'duration_ms', EXTRACT(epoch FROM (now() - query_start)) * 1000,
                            'state', state,
                            'waiting', wait_event IS NOT NULL
                        ))
                        FROM pg_stat_activity
                        WHERE state = 'active'
                        AND query NOT LIKE '%pg_stat%'
                        AND query_start IS NOT NULL
                        LIMIT 5
                    )
                ) as performance_metrics
            `);
            
            return result.rows[0].performance_metrics;
        });
    }

    async getOptimizationSuggestions() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH 
                table_stats AS (
                    SELECT 
                        schemaname,
                        relname as tablename,
                        n_live_tup as row_count,
                        n_dead_tup as dead_tuples,
                        ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_ratio
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                    ORDER BY n_dead_tup DESC
                    LIMIT 5
                ),
                index_stats AS (
                    SELECT 
                        schemaname,
                        relname as tablename,
                        indexrelname as indexname,
                        idx_scan,
                        idx_tup_read,
                        idx_tup_fetch,
                        CASE 
                            WHEN idx_scan = 0 THEN 'Unused index'
                            WHEN idx_tup_read = 0 THEN 'Index might be redundant'
                            ELSE 'Index is being used'
                        END as suggestion
                    FROM pg_stat_user_indexes
                    WHERE schemaname = 'review_system'
                    ORDER BY idx_scan ASC
                    LIMIT 5
                )
                SELECT json_build_object(
                    'table_suggestions', (SELECT json_agg(table_stats) FROM table_stats),
                    'index_suggestions', (SELECT json_agg(index_stats) FROM index_stats)
                ) as optimization_suggestions
            `);
            
            return result.rows[0].optimization_suggestions;
        });
    }
} 