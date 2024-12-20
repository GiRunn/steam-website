import BaseService from '../base/BaseService';

export default class ConnectionService extends BaseService {
    async getConnectionStatus() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH connection_stats AS (
                    SELECT 
                        state,
                        wait_event_type,
                        COUNT(*) as count,
                        COUNT(*) FILTER (WHERE application_name != '') as named_connections
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                    AND pid != pg_backend_pid() -- 排除当前连接
                    GROUP BY state, wait_event_type
                )
                SELECT json_build_object(
                    'total_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE datname = current_database()
                        AND pid != pg_backend_pid()
                    ),
                    'active_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND datname = current_database()
                        AND pid != pg_backend_pid()
                    ),
                    'idle_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'idle'
                        AND datname = current_database()
                        AND pid != pg_backend_pid()
                    ),
                    'idle_in_transaction', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'idle in transaction'
                        AND datname = current_database()
                        AND pid != pg_backend_pid()
                    ),
                    'waiting_connections', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE wait_event_type IS NOT NULL
                        AND datname = current_database()
                        AND pid != pg_backend_pid()
                    ),
                    'connection_distribution', (
                        SELECT COALESCE(
                            json_agg(
                                json_build_object(
                                    'state', COALESCE(state, 'unknown'),
                                    'wait_type', COALESCE(wait_event_type, 'none'),
                                    'count', count,
                                    'named_connections', named_connections
                                )
                            ),
                            '[]'::json
                        )
                        FROM connection_stats
                    )
                ) as connection_status
            `);
            
            return result.rows[0]?.connection_status || {
                total_connections: 0,
                active_connections: 0,
                idle_connections: 0,
                idle_in_transaction: 0,
                waiting_connections: 0,
                connection_distribution: []
            };
        });
    }

    async getConnectionDetails() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT 
                    pid,
                    usename as username,
                    COALESCE(client_addr::text, 'local') as client_ip,
                    datname as database,
                    state,
                    CASE 
                        WHEN state = 'active' THEN 
                            CASE 
                                WHEN query LIKE '%pg_stat_activity%' THEN '系统查询'
                                ELSE substring(query, 1, 100)
                            END
                        ELSE NULL 
                    END as query,
                    to_char(backend_start, 'YYYY-MM-DD HH24:MI:SS') as connected_at,
                    to_char(state_change, 'YYYY-MM-DD HH24:MI:SS') as last_activity,
                    CASE 
                        WHEN state = 'active' AND query_start IS NOT NULL 
                        THEN EXTRACT(epoch FROM (now() - query_start))::integer 
                        ELSE NULL 
                    END as query_duration
                FROM pg_stat_activity
                WHERE 
                    datname = current_database()
                    AND pid != pg_backend_pid()
                    AND backend_type = 'client backend'
                ORDER BY 
                    CASE state
                        WHEN 'active' THEN 1
                        WHEN 'idle in transaction' THEN 2
                        WHEN 'idle' THEN 3
                        ELSE 4
                    END,
                    backend_start DESC
            `);

            // 直接返回查询结果
            return result.rows.map(row => ({
                ...row,
                state: this.formatState(row.state),
                query: row.query || '-',
                query_duration: row.query_duration ? `${row.query_duration}秒` : '-'
            }));
        }).catch(error => {
            console.error('Error fetching connection details:', error);
            return [];
        });
    }

    private formatState(state: string): string {
        const stateMap: { [key: string]: string } = {
            'active': '活动',
            'idle': '空闲',
            'idle in transaction': '事务中空闲',
            'idle in transaction (aborted)': '事务中空闲(已中止)',
            'fastpath function call': '快速路径函数调用',
            'disabled': '已禁用'
        };
        return stateMap[state] || state;
    }

    // 添加新方法：获取长时间运行的查询
    async getLongRunningQueries() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT json_agg(
                    json_build_object(
                        'pid', pid,
                        'username', usename,
                        'database', datname,
                        'query', query,
                        'duration', EXTRACT(epoch FROM (now() - query_start))::integer,
                        'state', state,
                        'wait_event_type', wait_event_type,
                        'wait_event', wait_event
                    )
                ) as long_queries
                FROM pg_stat_activity
                WHERE state = 'active'
                AND query_start < now() - interval '30 seconds'
                AND pid != pg_backend_pid()
                AND query NOT LIKE '%pg_stat_activity%'
                ORDER BY query_start ASC
            `);

            return result.rows[0]?.long_queries || [];
        });
    }
} 