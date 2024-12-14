// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // 添加以下编码配置
    client_encoding: 'utf8',
    // 添加额外的连接选项
    options: '-c client_encoding=utf8'
});

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