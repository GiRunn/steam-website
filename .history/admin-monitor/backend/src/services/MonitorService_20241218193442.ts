import pool from '../config/database';

class MonitorService {
    async getSystemMetrics() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT json_build_object(
                    'cpu_usage', (
                        SELECT ROUND(COALESCE(
                            (SELECT EXTRACT(epoch FROM cpu_user_time) / 
                             EXTRACT(epoch FROM total_time) * 100
                             FROM pg_stat_activity 
                             WHERE pid = pg_backend_pid()), 0
                        ), 2)
                    ),
                    'memory_usage', (
                        SELECT ROUND(COALESCE(
                            (SELECT SUM(work_mem::bigint) * 100.0 / 
                             (SELECT setting::bigint FROM pg_settings WHERE name = 'work_mem')
                             FROM pg_stat_activity 
                             WHERE state = 'active'), 0
                        ), 2)
                    ),
                    'database_size', (
                        SELECT pg_size_pretty(pg_database_size(current_database()))
                    ),
                    'database_size_bytes', (
                        SELECT pg_database_size(current_database())
                    )
                ) as system_metrics
            `);
            
            return result.rows[0].system_metrics;
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            throw error;
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
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE datname = current_database()
                    ),
                    'active_queries', (
                        SELECT count(*) FROM pg_stat_activity 
                        WHERE state = 'active' 
                        AND query NOT LIKE '%pg_stat_activity%'
                        AND datname = current_database()
                    ),
                    'cache_hit_ratio', (
                        SELECT round(sum(heap_blks_hit) * 100.0 / 
                            nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2)
                        FROM pg_statio_user_tables
                    ),
                    'transaction_rate', (
                        SELECT round(xact_commit::numeric / 
                            GREATEST(extract(epoch from (now() - stats_reset))::numeric, 1), 2)
                        FROM pg_stat_database
                        WHERE datname = current_database()
                    )
                ) as database_metrics
            `);
            
            return result.rows[0].database_metrics;
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
                SELECT 
                    (SELECT count(*) FROM review_system.reviews_partitioned) as total_reviews,
                    (SELECT round(avg(rating), 2) FROM review_system.reviews_partitioned) as avg_rating,
                    (SELECT count(*) FROM review_system.reviews_partitioned WHERE created_at >= NOW() - INTERVAL '1 hour') as reviews_last_hour,
                    (SELECT count(DISTINCT game_id) FROM review_system.reviews_partitioned) as unique_games_reviewed,
                    (SELECT count(*) FROM review_system.review_replies_partitioned) as total_replies,
                    (SELECT round(avg(length(content)), 2) FROM review_system.reviews_partitioned) as avg_review_length
            `);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching review system metrics:', error);
            throw error;
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
                SELECT 
                    (SELECT round(blks_hit * 100.0 / (blks_hit + blks_read), 2) 
                     FROM pg_stat_database 
                     WHERE datname = current_database()) as cache_hit_ratio,
                    (SELECT round(xact_commit / (extract(epoch from (now() - stats_reset))), 2) 
                     FROM pg_stat_database 
                     WHERE datname = current_database()) as transactions_per_second,
                    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
                    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
            `);
            
            return result.rows[0];
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
                WITH table_stats AS (
                    SELECT 
                        schemaname,
                        relname as table_name,
                        n_live_tup as row_count,
                        n_dead_tup as dead_tuples,
                        n_mod_since_analyze as mods_since_analyze,
                        last_vacuum,
                        last_autovacuum,
                        last_analyze,
                        last_autoanalyze
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                ),
                index_stats AS (
                    SELECT 
                        schemaname,
                        relname as table_name,
                        indexrelname as index_name,
                        idx_scan as index_scans,
                        idx_tup_read as tuples_read,
                        idx_tup_fetch as tuples_fetched
                    FROM pg_stat_user_indexes
                    WHERE schemaname = 'review_system'
                ),
                table_io AS (
                    SELECT 
                        schemaname,
                        relname as table_name,
                        heap_blks_read,
                        heap_blks_hit,
                        idx_blks_read,
                        idx_blks_hit,
                        toast_blks_read,
                        toast_blks_hit
                    FROM pg_statio_user_tables
                    WHERE schemaname = 'review_system'
                ),
                query_stats AS (
                    SELECT 
                        queryid,
                        query,
                        calls,
                        total_time / calls as avg_time,
                        rows / calls as avg_rows,
                        shared_blks_hit + shared_blks_read as total_blocks
                    FROM pg_stat_statements
                    WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
                    ORDER BY total_time DESC
                    LIMIT 10
                )
                SELECT json_build_object(
                    'table_stats', (SELECT json_agg(table_stats) FROM table_stats),
                    'index_stats', (SELECT json_agg(index_stats) FROM index_stats),
                    'table_io', (SELECT json_agg(table_io) FROM table_io),
                    'query_stats', (SELECT json_agg(query_stats) FROM query_stats),
                    'database_info', (
                        SELECT json_build_object(
                            'name', current_database(),
                            'size', pg_size_pretty(pg_database_size(current_database())),
                            'connections', (SELECT count(*) FROM pg_stat_activity),
                            'active_queries', (
                                SELECT count(*) FROM pg_stat_activity 
                                WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
                            ),
                            'cache_hit_ratio', (
                                SELECT round(blks_hit * 100.0 / (blks_hit + blks_read), 2)
                                FROM pg_stat_database
                                WHERE datname = current_database()
                            ),
                            'transaction_rate', (
                                SELECT xact_commit + xact_rollback
                                FROM pg_stat_database
                                WHERE datname = current_database()
                            )
                        )
                    )
                ) as performance_details
            `);

            return result.rows[0].performance_details;
        } finally {
            client.release();
        }
    }

    async getOptimizationSuggestions() {
        const client = await pool.connect();
        try {
            const suggestions = await client.query(`
                WITH 
                large_tables AS (
                    SELECT 
                        schemaname, 
                        relname AS tablename,
                        pg_total_relation_size(schemaname || '.' || relname) AS total_size_bytes
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                    ORDER BY total_size_bytes DESC
                    LIMIT 5
                ),
                index_usage AS (
                    SELECT 
                        schemaname, 
                        relname AS tablename,
                        indexrelname AS indexname,
                        idx_scan,
                        idx_tup_read,
                        idx_tup_fetch
                    FROM pg_stat_user_indexes
                    WHERE schemaname = 'review_system'
                    ORDER BY idx_scan DESC
                    LIMIT 5
                ),
                slow_queries AS (
                    SELECT 
                        query,
                        calls,
                        rows,
                        shared_blks_hit + shared_blks_read as total_blocks
                    FROM pg_stat_statements
                    WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
                    ORDER BY total_blocks DESC
                    LIMIT 5
                )
                SELECT json_build_object(
                    'large_tables', (SELECT json_agg(large_tables) FROM large_tables),
                    'index_usage', (SELECT json_agg(index_usage) FROM index_usage),
                    'slow_queries', (SELECT json_agg(slow_queries) FROM slow_queries)
                ) AS optimization_suggestions
            `);

            return suggestions.rows[0].optimization_suggestions;
        } catch (error) {
            console.error('Error fetching optimization suggestions:', error);
            throw error;
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
}

export default MonitorService; 