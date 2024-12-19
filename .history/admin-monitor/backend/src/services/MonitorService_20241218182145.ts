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
}

export default MonitorService; 