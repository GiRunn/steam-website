const { Pool } = require('pg');

let pool;

try {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    // 添加错误处理
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

    // 测试连接
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection error:', err);
        } else {
            console.log('Database connected successfully at:', res.rows[0].now);
        }
    });

} catch (error) {
    console.error('Error creating pool:', error);
    process.exit(-1);
}

// 添加连接检查函数
const checkConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connection test successful');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};

module.exports = { pool, checkConnection };