import pool from '../../config/database';
import { PoolClient } from 'pg';

export default class BaseService {
    protected async withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
            return await callback(client);
        } finally {
            client.release();
        }
    }

    protected handleError(error: any, defaultValue: any = null) {
        console.error('Service Error:', error);
        return defaultValue;
    }
} 