import BaseService from '../base/BaseService';

export default class DatabaseMetricsService extends BaseService {
    async getDatabaseMetrics() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT json_build_object(
                    'size', pg_size_pretty(pg_database_size(current_database())),
                    'size_bytes', pg_database_size(current_database()),
                    'connections', (
                        SELECT count(*) 
                        FROM pg_stat_activity 
                        WHERE datname = current_database()
                    ),
                    'active_queries', (
                        SELECT count(*) 
                        FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND query NOT LIKE '%pg_stat_activity%'
                        AND datname = current_database()
                    ),
                    'cache_hit_ratio', (
                        SELECT ROUND(
                            COALESCE(
                                sum(heap_blks_hit) * 100.0 / 
                                NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
                                0
                            ),
                            2
                        )
                        FROM pg_statio_user_tables
                    ),
                    'transaction_rate', (
                        SELECT ROUND(
                            COALESCE(
                                xact_commit::numeric / 
                                GREATEST(EXTRACT(epoch FROM (now() - stats_reset))::numeric, 1),
                                0
                            ),
                            2
                        )
                        FROM pg_stat_database
                        WHERE datname = current_database()
                    )
                ) as metrics
            `);
            
            return result.rows[0].metrics;
        });
    }
} 