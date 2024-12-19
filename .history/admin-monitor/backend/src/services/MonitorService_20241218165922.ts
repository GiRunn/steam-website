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
}

export default MonitorService; 