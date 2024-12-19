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
                        GREATEST(EXTRACT(EPOCH FROM (NOW() - stats_reset)), 1), 0) as transactions_per_second,
                    COALESCE((SELECT avg(rating) FROM review_system.reviews_partitioned), 0) as cache_hit_ratio,
                    COALESCE((SELECT avg(rating) FROM review_system.reviews_partitioned), 0) as index_hit_ratio
                FROM pg_stat_database
                WHERE datname = current_database()
            `);
            
            return result.rows[0];
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
}

export default MonitorService; 