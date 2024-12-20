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
                            (SELECT setting::bigint * 1024 FROM pg_settings WHERE name = 'shared_buffers')::numeric * 100.0 / 
                            (SELECT setting::bigint * 1024 FROM pg_settings WHERE name = 'effective_cache_size'), 2
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
            max_connections: 100
        }));
    }
} 