import { Request, Response } from 'express';
import { Pool } from 'pg';

class MonitorController {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getSystemMetrics(req: Request, res: Response) {
        try {
            const client = await this.pool.connect();
            const result = await client.query(`
                SELECT 
                    metric_name, 
                    metric_value, 
                    metric_unit, 
                    timestamp
                FROM admin_monitor.performance_metrics
                ORDER BY timestamp DESC
                LIMIT 50
            `);
            client.release();

            res.json({
                code: 200,
                data: result.rows,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '获取系统指标失败',
                error: error.message
            });
        }
    }

    async getRealTimeMetrics(req: Request, res: Response) {
        try {
            const client = await this.pool.connect();
            const result = await client.query(`
                SELECT * FROM admin_monitor.get_system_metrics()
            `);
            client.release();

            res.json({
                code: 200,
                data: result.rows,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '获取实时指标失败',
                error: error.message
            });
        }
    }
}

export default MonitorController; 