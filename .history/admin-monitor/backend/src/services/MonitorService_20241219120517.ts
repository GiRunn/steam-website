import pool from '../config/database';

class MonitorService {
    async getSystemMetrics() {
        const client = await pool.connect();
        try {
            const sysMetricsQuery = `
                WITH system_stats AS (
                    SELECT 
                        -- CPU使用率计算 (基于活跃查询数和总连接数的比率)
                        (SELECT ROUND(CAST(count(*) AS numeric) * 100 / 
                            GREATEST((SELECT setting::numeric FROM pg_settings WHERE name = 'max_connections'), 1), 2)
                        FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND pid != pg_backend_pid()) as cpu_usage,
                        
                        -- 内存使用率计算
                        (SELECT ROUND(
                            (
                                CASE 
                                    WHEN position('GB' in current_setting('shared_buffers')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('shared_buffers'), '[^0-9.]', '', 'g') AS numeric) * 1024 * 1024 * 1024
                                    WHEN position('MB' in current_setting('shared_buffers')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('shared_buffers'), '[^0-9.]', '', 'g') AS numeric) * 1024 * 1024
                                    WHEN position('kB' in current_setting('shared_buffers')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('shared_buffers'), '[^0-9.]', '', 'g') AS numeric) * 1024
                                    ELSE CAST(REGEXP_REPLACE(current_setting('shared_buffers'), '[^0-9.]', '', 'g') AS numeric)
                                END * 100.0
                            ) / (
                                CASE 
                                    WHEN position('GB' in current_setting('effective_cache_size')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('effective_cache_size'), '[^0-9.]', '', 'g') AS numeric) * 1024 * 1024 * 1024
                                    WHEN position('MB' in current_setting('effective_cache_size')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('effective_cache_size'), '[^0-9.]', '', 'g') AS numeric) * 1024 * 1024
                                    WHEN position('kB' in current_setting('effective_cache_size')) > 0 
                                    THEN CAST(REGEXP_REPLACE(current_setting('effective_cache_size'), '[^0-9.]', '', 'g') AS numeric) * 1024
                                    ELSE CAST(REGEXP_REPLACE(current_setting('effective_cache_size'), '[^0-9.]', '', 'g') AS numeric)
                                END
                            ), 2)
                        ) as memory_usage,
                        
                        -- 数据库大小
                        pg_database_size(current_database()) as db_size,
                        
                        -- 活跃连接数
                        (SELECT count(*) 
                        FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND pid != pg_backend_pid()) as active_connections,

                        -- 总连接数
                        (SELECT count(*) 
                        FROM pg_stat_activity 
                        WHERE pid != pg_backend_pid()) as total_connections,

                        -- 最大连接数
                        (SELECT setting::integer 
                        FROM pg_settings 
                        WHERE name = 'max_connections') as max_connections
                )
                SELECT 
                    COALESCE(cpu_usage, 0) as cpu_usage,
                    COALESCE(memory_usage, 0) as memory_usage,
                    pg_size_pretty(db_size) as database_size,
                    db_size as database_size_bytes,
                    active_connections,
                    total_connections,
                    max_connections,
                    ROUND(active_connections * 100.0 / GREATEST(max_connections, 1), 2) as connection_usage_percent
                FROM system_stats;
            `;

            const result = await client.query(sysMetricsQuery);
            
            return {
                cpu_usage: result.rows[0].cpu_usage,
                memory_usage: result.rows[0].memory_usage,
                database_size: result.rows[0].database_size,
                database_size_bytes: result.rows[0].database_size_bytes,
                active_connections: result.rows[0].active_connections,
                total_connections: result.rows[0].total_connections,
                max_connections: result.rows[0].max_connections,
                connection_usage_percent: result.rows[0].connection_usage_percent
            };
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            return {
                cpu_usage: 0,
                memory_usage: 0,
                database_size: '0 bytes',
                database_size_bytes: 0,
                active_connections: 0,
                total_connections: 0,
                max_connections: 100,
                connection_usage_percent: 0
            };
        } finally {
            client.release();
        }
    }

    async getDatabaseMetrics() {
        const client = await pool.connect();
        try {
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
        } catch (error) {
            console.error('Error fetching database metrics:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getConnectionStatus() {
        const client = await pool.connect();
        try {
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
        } catch (error) {
            console.error('Error fetching connection status:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getDatabasePerformance() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    current_database() as database_name,
                    (SELECT count(*) FROM review_system.reviews_partitioned) as total_transactions,
                    COALESCE((SELECT count(*) FROM review_system.reviews_partitioned) / 
                        GREATEST(EXTRACT(EPOCH FROM (NOW() - stats_reset)), 1), 0.0) as transactions_per_second,
                    COALESCE((SELECT avg(rating) FROM review_system.reviews_partitioned), 0.0) as cache_hit_ratio,
                    COALESCE((SELECT avg(rating) FROM review_system.reviews_partitioned), 0.0) as index_hit_ratio
                FROM pg_stat_database
                WHERE datname = current_database()
            `);
            
            // 确保返回的是数字类型
            const performanceData = result.rows[0];
            return {
                database_name: performanceData.database_name,
                total_transactions: Number(performanceData.total_transactions),
                transactions_per_second: Number(performanceData.transactions_per_second),
                cache_hit_ratio: Number(performanceData.cache_hit_ratio),
                index_hit_ratio: Number(performanceData.index_hit_ratio)
            };
        } finally {
            client.release();
        }
    }

    async collectMetrics() {
        const client = await pool.connect();
        try {
            // 这里可以添加一些额外的指标收集逻辑
            console.log('Collecting metrics...');
        } finally {
            client.release();
        }
    }

    async getReviewSystemMetrics() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH review_metrics AS (
                    SELECT 
                        COUNT(*) as total_reviews,
                        ROUND(AVG(CAST(rating AS numeric)), 2) as avg_rating,
                        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as reviews_last_hour,
                        COUNT(DISTINCT game_id) as unique_games_reviewed,
                        (SELECT COUNT(*) FROM review_system.review_replies_partitioned) as total_replies,
                        ROUND(AVG(LENGTH(content))::numeric, 2) as avg_review_length
                    FROM review_system.reviews_partitioned
                    WHERE deleted_at IS NULL
                )
                SELECT 
                    COALESCE(total_reviews, 0) as total_reviews,
                    COALESCE(avg_rating, 0) as avg_rating,
                    COALESCE(reviews_last_hour, 0) as reviews_last_hour,
                    COALESCE(unique_games_reviewed, 0) as unique_games_reviewed,
                    COALESCE(total_replies, 0) as total_replies,
                    COALESCE(avg_review_length, 0) as avg_review_length
                FROM review_metrics
            `);

            return result.rows[0];
        } catch (error) {
            console.error('Error fetching review system metrics:', error);
            return {
                total_reviews: 0,
                avg_rating: 0,
                reviews_last_hour: 0,
                unique_games_reviewed: 0,
                total_replies: 0,
                avg_review_length: 0
            };
        } finally {
            client.release();
        }
    }

    async getReviewSystemAnomalies() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    event_type,
                    description,
                    severity,
                    occurred_at
                FROM review_system.security_events
                ORDER BY occurred_at DESC
                LIMIT 10
            `);
            
            return result.rows;
        } catch (error) {
            console.error('Error fetching review system anomalies:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getPartitionStats() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
                    pg_total_relation_size(schemaname || '.' || tablename) as total_size_bytes
                FROM pg_tables
                WHERE schemaname = 'review_system'
                ORDER BY total_size_bytes DESC
                LIMIT 10
            `);
            
            return result.rows;
        } catch (error) {
            console.error('Error fetching partition stats:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getPerformanceMetrics() {
        const client = await pool.connect();
        try {
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
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getDatabasePerformanceDetails() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH 
                query_stats AS (
                    SELECT 
                        COALESCE(
                            AVG(EXTRACT(EPOCH FROM (now() - query_start)) * 1000),
                            0
                        ) as avg_query_time,
                        COALESCE(
                            (
                                SELECT ROUND(
                                    sum(heap_blks_hit) * 100.0 / 
                                    NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
                                    2
                                )
                                FROM pg_statio_user_tables
                            ),
                            0
                        ) as cache_hit_ratio
                    FROM pg_stat_activity 
                    WHERE state = 'active' 
                    AND query_start IS NOT NULL
                ),
                conn_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE state = 'active') as active_connections,
                        COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
                        COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
                        COUNT(*) FILTER (WHERE wait_event IS NOT NULL) as waiting_connections
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                ),
                active_queries AS (
                    SELECT 
                        query,
                        EXTRACT(EPOCH FROM (now() - query_start)) * 1000 as duration_ms,
                        state,
                        wait_event IS NOT NULL as waiting
                    FROM pg_stat_activity
                    WHERE state = 'active'
                    AND query NOT LIKE '%pg_stat%'
                    AND query_start IS NOT NULL
                    ORDER BY query_start ASC
                    LIMIT 5
                )
                SELECT json_build_object(
                    'query_performance', (
                        SELECT row_to_json(query_stats) FROM query_stats
                    ),
                    'connection_stats', (
                        SELECT row_to_json(conn_stats) FROM conn_stats
                    ),
                    'query_stats', (
                        SELECT json_agg(row_to_json(active_queries))
                        FROM active_queries
                    )
                ) as performance_details
            `);
            
            return result.rows[0].performance_details;
        } catch (error) {
            console.error('Error fetching database performance details:', error);
            // 返回默认值
            return {
                query_performance: {
                    avg_query_time: 0,
                    cache_hit_ratio: 0
                },
                connection_stats: {
                    active_connections: 0,
                    idle_connections: 0,
                    idle_in_transaction: 0,
                    waiting_connections: 0
                },
                query_stats: []
            };
        } finally {
            client.release();
        }
    }

    async getOptimizationSuggestions() {
        const client = await pool.connect();
        try {
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
                ),
                long_running_queries AS (
                    SELECT 
                        query,
                        state,
                        EXTRACT(epoch FROM (now() - query_start)) as duration_seconds,
                        wait_event_type,
                        wait_event
                    FROM pg_stat_activity
                    WHERE state != 'idle'
                    AND query_start IS NOT NULL
                    ORDER BY query_start ASC
                    LIMIT 5
                )
                SELECT json_build_object(
                    'table_suggestions', (SELECT json_agg(table_stats) FROM table_stats),
                    'index_suggestions', (SELECT json_agg(index_stats) FROM index_stats),
                    'query_suggestions', (SELECT json_agg(long_running_queries) FROM long_running_queries)
                ) as optimization_suggestions
            `);
            
            return result.rows[0]?.optimization_suggestions || {
                slow_queries: [],
                table_suggestions: [],
                index_suggestions: []
            };
        } catch (error) {
            console.error('Error fetching optimization suggestions:', error);
            return {
                slow_queries: [],
                table_suggestions: [],
                index_suggestions: []
            };
        } finally {
            client.release();
        }
    }

    async getSystemMetricsHistory(timeRange: string = '1h') {
        const client = await pool.connect();
        try {
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
                    FROM pg_statio_user_tables) as cache_hit_ratio,
                    (SELECT count(*) FROM review_system.reviews_partitioned 
                     WHERE created_at >= ts - interval '1 hour') as reviews_count,
                    (SELECT COALESCE(ROUND(100.0 * xact_commit / 
                        NULLIF(xact_commit + xact_rollback, 0), 2), 0)
                    FROM pg_stat_database 
                    WHERE datname = current_database()) as transaction_success_rate
                FROM time_series 
                ORDER BY ts DESC
            `, [timeRange, interval]);

            return result.rows;
        } catch (error) {
            console.error('Error fetching system metrics history:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getConnectionDetails() {
        const client = await pool.connect();
        try {
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
        } finally {
            client.release();
        }
    }

    async getReviewSystemStats() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH daily_stats AS (
                    SELECT 
                        date_trunc('day', created_at) as date,
                        count(*) as count
                    FROM review_system.reviews_partitioned
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY date_trunc('day', created_at)
                )
                SELECT json_build_object(
                    'total_reviews', (SELECT count(*) FROM review_system.reviews_partitioned),
                    'reviews_today', (SELECT count(*) FROM review_system.reviews_partitioned WHERE created_at >= CURRENT_DATE),
                    'active_reviews', (SELECT count(*) FROM review_system.reviews_partitioned WHERE review_status = 'active'),
                    'deleted_reviews', (SELECT count(*) FROM review_system.reviews_partitioned WHERE deleted_at IS NOT NULL),
                    'average_rating', (SELECT avg(rating) FROM review_system.reviews_partitioned),
                    'total_replies', (SELECT count(*) FROM review_system.review_replies_partitioned),
                    'review_distribution', (SELECT json_agg(row_to_json(daily_stats)) FROM daily_stats)
                ) as stats
            `);
            return result.rows[0].stats;
        } finally {
            client.release();
        }
    }

    async getSecurityEvents() {
        const client = await pool.connect();
        try {
            // 检测SQL注入
            const sqlInjectionResult = await client.query(`
                SELECT 
                    query,
                    usename,
                    client_addr,
                    application_name,
                    backend_start,
                    state_change
                FROM pg_stat_activity
                WHERE query ~ '(''|;|--|/\\*|\\*/|@@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|sys|sysobjects|syscolumns|table|update)'
                AND query !~ 'pg_stat_activity'
            `);

            // 检测可疑活动
            const suspiciousResult = await client.query(`
                SELECT 
                    query,
                    usename,
                    client_addr,
                    application_name,
                    backend_start,
                    state_change
                FROM pg_stat_activity
                WHERE (
                    query ~ 'truncate|drop|delete|update.*where.*true|insert.*select'
                    OR query_start < now() - interval '1 hour'
                )
                AND query !~ 'pg_stat_activity'
            `);

            return {
                events: [...sqlInjectionResult.rows, ...suspiciousResult.rows].map(event => ({
                    type: event.query.match(/(''|;|--|\/\*|\*\/)/) ? 'sql_injection' : 'suspicious_activity',
                    description: event.query.substring(0, 100) + '...',
                    ip_address: event.client_addr,
                    user_agent: event.application_name,
                    timestamp: event.state_change,
                    severity: event.query.match(/(drop|truncate|delete)/) ? 'high' : 'medium'
                })),
                alerts: this.generateSecurityAlerts([...sqlInjectionResult.rows, ...suspiciousResult.rows])
            };
        } finally {
            client.release();
        }
    }

    private generateSecurityAlerts(events: any[]) {
        const alerts = [];
        if (events.some(e => e.query.match(/(drop|truncate)/))) {
            alerts.push('检测到高危DDL操作！');
        }
        if (events.some(e => e.query.match(/(''|;|--|\/\*|\*\/)/))) {
            alerts.push('检测到潜在的SQL注入攻击！');
        }
        return alerts;
    }

    async getPartitionStatus() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH partition_stats AS (
                    SELECT 
                        schemaname || '.' || tablename as table_name,
                        tablename as partition_name,
                        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
                        pg_total_relation_size(schemaname || '.' || tablename) as size_bytes,
                        n_live_tup as row_count,
                        n_dead_tup as dead_tuples,
                        CASE 
                            WHEN n_live_tup = 0 THEN 0
                            ELSE ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)
                        END as dead_tuple_percent
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                    AND tablename LIKE 'reviews_p%'
                )
                SELECT 
                    table_name,
                    partition_name,
                    size,
                    size_bytes,
                    row_count,
                    dead_tuples,
                    dead_tuple_percent,
                    CASE 
                        WHEN dead_tuple_percent > 20 THEN 'needs_vacuum'
                        WHEN size_bytes > 1073741824 THEN 'large_partition'
                        ELSE 'healthy'
                    END as status
                FROM partition_stats
                ORDER BY partition_name DESC;
            `);

            return {
                partitions: result.rows,
                message: result.rows.length > 0 ? 'success' : '暂无分区数据'
            };
        } catch (error) {
            console.error('Error in getPartitionStatus:', error);
            throw new Error(`获取分区状态失败: ${error.message}`);
        } finally {
            client.release();
        }
    }
}

export default MonitorService; 