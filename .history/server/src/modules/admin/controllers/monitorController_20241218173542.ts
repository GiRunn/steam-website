import { Pool, PoolClient } from 'pg';  // 明确导入 Pool 类型

class MonitorController {
    private pool: Pool;  // 使用 Pool 类型

    constructor(pool: Pool) {  // 使用 Pool 类型
        this.pool = pool;
    }

    async getSystemMetrics() {
        const client: PoolClient = await this.pool.connect();
        try {
            // 执行查询
            const result = await client.query('SELECT * FROM system_metrics');
            return result.rows;
        } finally {
            client.release();
        }
    }

    // 其他方法...
}

export default MonitorController; 