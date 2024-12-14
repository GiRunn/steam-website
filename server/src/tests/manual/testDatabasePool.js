// server/src/tests/manual/testDatabasePool.js
require('dotenv').config();
const { pool, checkConnection } = require('../../config/database');

async function testDatabasePool() {
    console.log('开始数据库连接池测试...');
    console.log('当前环境:', process.env.NODE_ENV);

    // 测试连接
    console.log('\n测试单个连接...');
    const isConnected = await checkConnection();
    console.log('单个连接测试结果:', isConnected ? '成功' : '失败');

    if (!isConnected) {
        console.log('由于连接失败，跳过并发连接测试');
        return;
    }

    // 测试并发连接
    console.log('\n测试并发连接...');
    const concurrentQueries = 5;
    const startTime = Date.now();
    
    try {
        const queries = Array(concurrentQueries).fill().map(async (_, index) => {
            console.log(`尝试建立连接 ${index + 1}...`);
            const client = await pool.connect();
            console.log(`连接 ${index + 1} 已建立`);
            const result = await client.query('SELECT current_timestamp;');
            console.log(`查询 ${index + 1} 已执行，时间戳:`, result.rows[0].current_timestamp);
            client.release();
            console.log(`连接 ${index + 1} 已释放`);
            return result;
        });

        await Promise.all(queries);
        console.log(`\n成功处理 ${concurrentQueries} 个并发连接`);
        console.log(`总耗时: ${Date.now() - startTime}毫秒`);

        // 输出连接池状态
        console.log('\n连接池状态:');
        console.log(`总连接数: ${pool.totalCount}`);
        console.log(`空闲连接数: ${pool.idleCount}`);
        console.log(`等待请求数: ${pool.waitingCount}`);

    } catch (error) {
        console.error('\n并发连接测试出错:', {
            错误名称: error.name,
            错误信息: error.message,
            错误堆栈: error.stack
        });
    }
}

async function runTests() {
    try {
        await testDatabasePool();
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        console.log('\n正在关闭连接池...');
        await pool.end();
        console.log('连接池已关闭');
    }
}

runTests();