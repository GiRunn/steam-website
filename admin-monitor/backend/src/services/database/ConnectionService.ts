import BaseService from '../base/BaseService';

export default class ConnectionService extends BaseService {
    async getConnectionStatus() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH connection_stats AS (
                    SELECT 
                        state,
                        wait_event_type,
                        COUNT(*) as count
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                    GROUP BY state, wait_event_type
                )
                SELECT json_build_object(
                    'total_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE datname = current_database()
                    ),
                    'active_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND datname = current_database()
                    ),
                    'idle_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'idle'
                        AND datname = current_database()
                    ),
                    'idle_in_transaction', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'idle in transaction'
                        AND datname = current_database()
                    ),
                    'waiting_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE wait_event_type IS NOT NULL
                        AND datname = current_database()
                    ),
                    'connection_distribution', (
                        SELECT json_agg(json_build_object(
                            'state', COALESCE(state, 'unknown'),
                            'wait_type', COALESCE(wait_event_type, 'none'),
                            'count', count
                        ))
                        FROM connection_stats
                    )
                ) as connection_status
            `);
            
            return result.rows[0].connection_status;
        });
    }

    async getConnectionDetails() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT 
                    pid,
                    usename as username,
                    client_addr as client_ip,
                    datname as database,
                    state,
                    query,
                    backend_start as connected_at,
                    state_change as last_activity
                FROM pg_stat_activity
                WHERE datname IS NOT NULL
                ORDER BY backend_start DESC
            `);
            return result.rows;
        });
    }
} 