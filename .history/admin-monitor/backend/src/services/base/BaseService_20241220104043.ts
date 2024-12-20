import pool from '../../config/database';
import { PoolClient } from 'pg';

export default class BaseService {
    protected async withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
            return await callback(client);
        } catch (error) {
            console.error('Database Error:', {
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        } finally {
            client.release();
        }
    }

    protected handleError(error: any, defaultValue: any = null) {
        if (error.code === '23505') {
            throw new Error('数据已存在');
        }
        if (error.code === '23503') {
            throw new Error('关联数据不存在');
        }
        console.error('Service Error:', {
            timestamp: new Date().toISOString(),
            type: error.name,
            message: error.message,
            stack: error.stack
        });
        return defaultValue;
    }
} 