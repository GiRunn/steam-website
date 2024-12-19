import pool from '../config/database';

class MonitorService {
    async getSystemMetrics() {
        const client = await pool.connect();
        try {
            console.log('Fetching system metrics...');
            const result = await client.query(`
                SELECT * FROM admin_monitor.system_metrics 
                ORDER BY created_at DESC 
                LIMIT 50
            `);
            console.log('System Metrics Result:', result.rows);
            return result.rows.length > 0 ? result.rows : [
                { 
                    metric_name: 'CPU_USAGE', 
                    metric_value: 50.0, 
                    metric_unit: 'PERCENT', 
                    description: '默认测试数据' 
                }
            ];
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
            console.log('Fetching database metrics...');
            const result = await client.query(`
                SELECT * FROM admin_monitor.database_metrics 
                ORDER BY created_at DESC 
                LIMIT 50
            `);
            console.log('Database Metrics Result:', result.rows);
            return result.rows.length > 0 ? result.rows : [
                { 
                    database_name: 'games', 
                    connections_total: 10, 
                    connections_active: 5,
                    connections_idle: 5,
                    cache_hit_ratio: 95.5,
                    transactions_per_second: 10.5
                }
            ];
        } catch (error) {
            console.error('Error fetching database metrics:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async collectMetrics() {
        const client = await pool.connect();
        try {
            await client.query('CALL admin_monitor.collect_system_metrics()');
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
                    xact_commit + xact_rollback as total_transactions,
                    (xact_commit + xact_rollback) / 
                        GREATEST(EXTRACT(EPOCH FROM (NOW() - stats_reset)), 1) as transactions_per_second,
                    blks_hit * 100.0 / GREATEST(blks_hit + blks_read, 1) as cache_hit_ratio,
                    idx_blks_hit * 100.0 / GREATEST(idx_blks_hit + idx_blks_read, 1) as index_hit_ratio
                FROM pg_stat_database
                WHERE datname = current_database()
            `);
            return result.rows[0];
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
                    (SELECT round(avg(playtime_hours), 2) FROM review_system.reviews_partitioned) as avg_playtime
            `);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getReviewSystemAnomalies() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH anomalous_reviews AS (
                    SELECT 
                        game_id, 
                        rating,
                        COUNT(*) as review_count
                    FROM review_system.reviews_partitioned
                    GROUP BY game_id, rating
                    HAVING COUNT(*) > (
                        SELECT percentile_cont(0.99) WITHIN GROUP (ORDER BY review_count)
                        FROM (
                            SELECT game_id, rating, COUNT(*) as review_count
                            FROM review_system.reviews_partitioned
                            GROUP BY game_id, rating
                        ) subquery
                    )
                )
                SELECT 
                    game_id,
                    rating,
                    review_count
                FROM anomalous_reviews
            `);
            return result.rows;
        } finally {
            client.release();
        }
    }
}

export default MonitorService; 