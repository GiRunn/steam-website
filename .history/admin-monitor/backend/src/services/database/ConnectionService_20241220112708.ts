import BaseService from '../base/BaseService';

export default class ConnectionService extends BaseService {
    async getConnectionStatus() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                WITH base_stats AS (
                    SELECT 
                        COUNT(*) as total_count,
                        COUNT(*) FILTER (WHERE state = 'active') as active_count,
                        COUNT(*) FILTER (WHERE state = 'idle') as idle_count,
                        COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction_count,
                        COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_count
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                    AND pid != pg_backend_pid()
                ),
                state_distribution AS (
                    SELECT 
                        COALESCE(state, 'unknown') as conn_state,
                        COALESCE(wait_event_type, 'none') as wait_type,
                        COUNT(*) as count,
                        COUNT(*) FILTER (WHERE application_name != '') as named_connections
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                    AND pid != pg_backend_pid()
                    GROUP BY state, wait_event_type
                )
                SELECT json_build_object(
                    'total_connections', (SELECT total_count FROM base_stats),
                    'active_connections', (SELECT active_count FROM base_stats),
                    'idle_connections', (SELECT idle_count FROM base_stats),
                    'idle_in_transaction', (SELECT idle_in_transaction_count FROM base_stats),
                    'waiting_connections', (SELECT waiting_count FROM base_stats),
                    'connection_distribution', (
                        SELECT COALESCE(
                            json_agg(
                                json_build_object(
                                    'state', conn_state,
                                    'wait_type', wait_type,
                                    'count', count,
                                    'named_connections', named_connections
                                )
                            ),
                            '[]'::json
                        )
                        FROM state_distribution
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
            try {
                console.log('开始执行连接详情查询');
                const result = await client.query(`
                    SELECT 
                        pid,
                        usename as username,
                        COALESCE(client_addr::text, 'local') as client_ip,
                        datname as database,
                        state,
                        query,
                        backend_start,
                        state_change
                    FROM pg_stat_activity
                    WHERE 
                        datname = current_database()
                        AND pid != pg_backend_pid()
                    LIMIT 50
                `);

                console.log('查询结果行数:', result.rows.length);
                console.log('查询结果示例:', result.rows[0]);

                return result.rows.map(row => ({
                    pid: row.pid,
                    username: row.username,
                    client_ip: row.client_ip,
                    database: row.database,
                    state: this.formatState(row.state),
                    current_query: row.query || '-',
                    connection_time: row.backend_start ? new Date(row.backend_start).toLocaleString() : '-',
                    last_activity: row.state_change ? new Date(row.state_change).toLocaleString() : '-'
                }));
            } catch (error) {
                console.error('连接详情查询异常:', error);
                throw error;
            }
        }).catch(error => {
            console.error('获取连接详情失败:', error);
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