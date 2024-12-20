import BaseService from '../base/BaseService';

export default class SystemMetricsService extends BaseService {
    async getSystemMetrics() {
        return this.withClient(async (client) => {
            const sysMetricsQuery = `
                SELECT json_build_object(
                    'cpu_usage', (
                        SELECT ROUND(CAST(count(*) AS numeric) * 100 / 
                            GREATEST((SELECT setting::numeric FROM pg_settings WHERE name = 'max_connections'), 1), 2)
                        FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND pid != pg_backend_pid()
                    ),
                    'memory_usage', (
                        SELECT ROUND(
                            (SELECT setting::bigint FROM pg_settings WHERE name = 'shared_buffers')::numeric * 100.0 / 
                            (SELECT setting::bigint FROM pg_settings WHERE name = 'effective_cache_size'), 2
                        )
                    ),
                    'database_size', pg_size_pretty(pg_database_size(current_database())),
                    'database_size_bytes', pg_database_size(current_database()),
                    'active_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'active' AND pid != pg_backend_pid()
                    ),
                    'total_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE pid != pg_backend_pid()
                    ),
                    'max_connections', (
                        SELECT setting::int FROM pg_settings WHERE name = 'max_connections'
                    ),
                    'slow_queries', (
                        SELECT COUNT(*) 
                        FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND NOW() - query_start > interval '10 seconds'
                    ),
                    'table_bloat', (
                        SELECT COALESCE(SUM(
                            CASE 
                                WHEN pg_total_relation_size(c.oid) > pg_relation_size(c.oid) 
                                THEN pg_total_relation_size(c.oid) - pg_relation_size(c.oid)
                                ELSE 0 
                            END
                        ), 0)
                        FROM pg_class c
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        WHERE relkind = 'r'
                        AND n.nspname = 'review_system'
                    ),
                    'index_usage', (
                        SELECT COALESCE(
                            ROUND(
                                AVG(
                                    CASE 
                                        WHEN (seq_scan + idx_scan) = 0 THEN 0
                                        ELSE 100.0 * idx_scan / (seq_scan + idx_scan)
                                    END
                                )::numeric, 
                                2
                            ),
                            0
                        )
                        FROM pg_stat_user_tables
                        WHERE schemaname = 'review_system'
                    )
                ) as metrics
            `;

            const result = await client.query(sysMetricsQuery);
            return result.rows[0].metrics;
        }).catch(error => this.handleError(error, {
            cpu_usage: 0,
            memory_usage: 0,
            database_size: '0 bytes',
            database_size_bytes: 0,
            active_connections: 0,
            total_connections: 0,
            max_connections: 100,
            slow_queries: 0,
            table_bloat: 0,
            index_usage: 0
        }));
    }

    async getSystemMetricsHistory(timeRange: string) {
        return this.withClient(async (client) => {
            let interval;
            switch(timeRange) {
                case '24h': interval = '1 hour'; break;
                case '7d': interval = '6 hours'; break;
                default: interval = '1 minute';
            }

            const result = await client.query(`
                WITH time_series AS (
                    SELECT generate_series(
                        NOW() - CASE 
                            WHEN $1 = '24h' THEN INTERVAL '24 hours'
                            WHEN $1 = '7d' THEN INTERVAL '7 days'
                            ELSE INTERVAL '1 hour'
                        END,
                        NOW(),
                        $2::interval
                    ) AS ts
                )
                SELECT 
                    ts as timestamp,
                    (SELECT count(*) FROM pg_stat_activity) as connections,
                    (SELECT COALESCE(ROUND(100.0 * sum(heap_blks_hit) / 
                        NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2), 0)
                    FROM pg_statio_user_tables) as cache_hit_ratio
                FROM time_series 
                ORDER BY ts DESC
            `, [timeRange, interval]);

            return result.rows;
        });
    }

    async saveMonitoringMetrics() {
        return this.withClient(async (client) => {
            await client.query('SELECT review_system.save_monitoring_metrics()');
            return true;
        });
    }
} 