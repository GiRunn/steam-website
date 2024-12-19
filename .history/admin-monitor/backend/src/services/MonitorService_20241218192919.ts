import pool from '../config/database';

class MonitorService {
    async getSystemMetrics() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    'CPU_USAGE' as metric_name,
                    (SELECT count(*) FROM review_system.reviews_partitioned) as metric_value,
                    'COUNT' as metric_unit,
                    '评论总数' as description,
                    CURRENT_TIMESTAMP as created_at
            `);
            
            return result.rows;
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
                SELECT 
                    current_database() as database_name,
                    (SELECT count(*) FROM review_system.reviews_partitioned) as connections_total,
                    (SELECT count(*) FROM review_system.review_replies_partitioned) as connections_active,
                    CURRENT_TIMESTAMP as created_at
            `);
            
            return result.rows;
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
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state != 'idle') as active_connections,
                    count(*) FILTER (WHERE state = 'idle') as idle_connections,
                    current_setting('max_connections')::INTEGER as max_connections
                FROM pg_stat_activity
            `);
            
            return result.rows[0];
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
                ),
                metrics AS (
                    SELECT 
                        date_trunc($3, current_timestamp) as time,
                        (SELECT count(*) FROM pg_stat_activity) as connections,
                        COALESCE(
                        (SELECT round(blks_hit * 100.0 / (blks_hit + blks_read), 2) 
                         FROM pg_stat_database 
                         WHERE datname = current_database()) as cache_hit_ratio,
                        (SELECT round(xact_commit * 100.0 / 
                                GREATEST(xact_commit + xact_rollback, 1), 2)
                         FROM pg_stat_database 
                         WHERE datname = current_database()) as transaction_success_rate,
                        (SELECT round(temp_files * 100.0 / 
                                GREATEST(temp_files + heap_blks_read, 1), 2)
                         FROM pg_stat_database 
                         WHERE datname = current_database()) as temp_file_ratio,
                        (SELECT count(*) FROM review_system.reviews_partitioned 
                         WHERE created_at >= NOW() - interval '1 hour') as review_count_last_hour,
                        (SELECT avg(rating) FROM review_system.reviews_partitioned 
                         WHERE created_at >= NOW() - interval '1 hour') as avg_rating_last_hour
                )
                SELECT 
                    ts as timestamp,
                    COALESCE(connections, 0) as connections,
                    COALESCE(cache_hit_ratio, 0) as cache_hit_ratio,
                    COALESCE(transaction_success_rate, 0) as transaction_success_rate,
                    COALESCE(temp_file_ratio, 0) as temp_file_ratio,
                    COALESCE(review_count_last_hour, 0) as review_count_last_hour,
                    COALESCE(avg_rating_last_hour, 0) as avg_rating_last_hour
                FROM time_series 
                LEFT JOIN metrics ON date_trunc($3, time_series.ts) = metrics.time
                ORDER BY ts DESC
            `, [timeRange, interval, 'minute']);

            // 添加数据验证和转换
            const formattedData = result.rows.map(row => ({
                timestamp: row.ts.toISOString(),
                connections: Number(row.connections) || 0,
                cache_hit_ratio: Number(row.cache_hit_ratio) || 0,
                transaction_success_rate: Number(row.transaction_success_rate) || 0,
                temp_file_ratio: Number(row.temp_file_ratio) || 0,
                review_count_last_hour: Number(row.review_count_last_hour) || 0,
                avg_rating_last_hour: Number(row.avg_rating_last_hour) || 0
            }));

            console.log('Formatted metrics history:', formattedData); // 添加日志
            return formattedData;
        } catch (error) {
            console.error('Error fetching system metrics history:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export default MonitorService; 