import pool from '../config/database';

class MonitorService {
    async getSystemMetrics() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM admin_monitor.system_metrics 
                ORDER BY created_at DESC 
                LIMIT 50
            `);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getDatabaseMetrics() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM admin_monitor.database_metrics 
                ORDER BY created_at DESC 
                LIMIT 50
            `);
            return result.rows;
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
}

export default MonitorService; 