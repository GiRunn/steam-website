// server/src/config/database.js
const { Pool } = require('pg');

const poolConfig = {
    // 原有配置
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    client_encoding: 'utf8',
    options: '-c client_encoding=utf8',

    // 添加连接池配置参数（根据开发规范文档）
    max: 100,                    // 最大连接数
    min: 20,                     // 最小保持连接数
    idleTimeoutMillis: 5000,     // 连接超时时间
    connectionTimeoutMillis: 2000 // 连接获取超时
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
        console.log('Database connection test successful');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};

module.exports = { pool, checkConnection };