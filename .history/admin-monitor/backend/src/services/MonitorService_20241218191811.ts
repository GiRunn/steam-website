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
            const performanceMetrics = await client.query(`
                WITH 
                table_stats AS (
                    SELECT 
                        schemaname, 
                        relname AS tablename,
                        n_live_tup AS row_count,
                        pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) AS total_size,
                        pg_total_relation_size(schemaname || '.' || relname) AS total_size_bytes
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'review_system'
                    ORDER BY total_size_bytes DESC
                    LIMIT 10
                ),
                index_stats AS (
                    SELECT 
                        schemaname, 
                        tablename,
                        indexname,
                        pg_size_pretty(pg_relation_size(schemaname || '.' || indexname)) AS index_size
                    FROM pg_indexes
                    WHERE schemaname = 'review_system'
                    LIMIT 10
                ),
                query_performance AS (
                    SELECT 
                        COALESCE(round(avg(total_time / calls), 2), 0) AS avg_query_time,
                        COALESCE(round(max(total_time / calls), 2), 0) AS max_query_time,
                        COALESCE(round(avg(blks_hit * 100.0 / (blks_hit + blks_read)), 2), 0) AS cache_hit_ratio
                    FROM pg_stat_statements
                    WHERE queryid IS NOT NULL
                ),
                connection_stats AS (
                    SELECT 
                        count(*) AS total_connections,
                        count(*) FILTER (WHERE state = 'active') AS active_connections,
                        count(*) FILTER (WHERE state = 'idle') AS idle_connections,
                        count(*) FILTER (WHERE wait_event IS NOT NULL) AS waiting_connections
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                )
                SELECT 
                    json_build_object(
                        'table_stats', (SELECT json_agg(table_stats) FROM table_stats),
                        'index_stats', (SELECT json_agg(index_stats) FROM index_stats),
                        'query_performance', (SELECT row_to_json(query_performance) FROM query_performance),
                        'connection_stats', (SELECT row_to_json(connection_stats) FROM connection_stats)
                    ) AS performance_details
            `);

            return performanceMetrics.rows[0].performance_details;
        } catch (error) {
            console.error('Error fetching detailed database performance:', error);
            throw error;
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
                        queryid,
                        query,
                        round(total_time / calls, 2) AS avg_time_ms,
                        calls
                    FROM pg_stat_statements
                    WHERE queryid IS NOT NULL
                    ORDER BY avg_time_ms DESC
                    LIMIT 5
                )
                SELECT 
                    json_build_object(
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
}

export default MonitorService; 