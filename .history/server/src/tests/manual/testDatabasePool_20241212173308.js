// server/src/tests/manual/testDatabasePool.js
require('dotenv').config();
const { pool, checkConnection } = require('../../config/database');

async function testDatabasePool() {
    console.log('Starting database pool tests...');
    console.log('Environment:', process.env.NODE_ENV);

    // 测试连接
    console.log('\nTesting single connection...');
    const isConnected = await checkConnection();
    console.log('Single connection test result:', isConnected);

    if (!isConnected) {
        console.log('Skipping concurrent connection tests due to connection failure');
        return;
    }

    // 测试并发连接
    console.log('\nTesting concurrent connections...');
    const concurrentQueries = 5; // 降低并发数用于测试
    const startTime = Date.now();
    
    try {
        const queries = Array(concurrentQueries).fill().map(async (_, index) => {
            console.log(`Attempting connection ${index + 1}...`);
            const client = await pool.connect();
            console.log(`Connection ${index + 1} established`);
            const result = await client.query('SELECT current_timestamp;');
            console.log(`Query ${index + 1} executed:`, result.rows[0]);
            client.release();
            console.log(`Connection ${index + 1} released`);
            return result;
        });

        await Promise.all(queries);
        console.log(`\nSuccessfully handled ${concurrentQueries} concurrent connections`);
        console.log(`Total time: ${Date.now() - startTime}ms`);

        // 输出连接池状态
        console.log('\nPool status:');
        console.log(`Total connections: ${pool.totalCount}`);
        console.log(`Idle connections: ${pool.idleCount}`);
        console.log(`Waiting requests: ${pool.waitingCount}`);

    } catch (error) {
        console.error('\nError during concurrent connection test:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

async function runTests() {
    try {
        await testDatabasePool();
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        console.log('\nClosing pool...');
        await pool.end();
        console.log('Pool closed');
    }
}

runTests();