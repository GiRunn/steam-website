// server/src/config/database.js
import pg from 'pg';
const { Pool } = pg;

const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    client_encoding: 'utf8',
    options: '-c client_encoding=utf8',

    // 测试环境使用较小的连接池配置
    max: process.env.NODE_ENV === 'test' ? 10 : 100,
    min: process.env.NODE_ENV === 'test' ? 2 : 20,
    idleTimeoutMillis: process.env.NODE_ENV === 'test' ? 1000 : 5000,
    connectionTimeoutMillis: process.env.NODE_ENV === 'test' ? 1000 : 2000
};

const pool = new Pool(poolConfig);

// 连接错误处理
pool.on('error', (err, client) => {
    // 在测试环境中不输出错误日志
    if (process.env.NODE_ENV !== 'test') {
        console.error('Unexpected error on idle client', err);
    }
});

// 连接检查函数
const checkConnection = async () => {
    try {
        const client = await pool.connect();
        await client.query('SET client_encoding = utf8');
        if (process.env.NODE_ENV !== 'test') {
            console.log('Database connection test successful');
        }
        client.release();
        return true;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Database connection test failed:', error);
        }
        return false;
    }
};

export { pool, checkConnection };