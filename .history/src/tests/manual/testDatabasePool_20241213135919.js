const { pool } = require('../../config/database');
const { performance } = require('perf_hooks');

// 测试配置
const TEST_CONFIG = {
    CONCURRENT_QUERIES: 50,
    QUERY_TIMEOUT: 5000,
    MAX_RETRIES: 3,
    LONG_QUERY_THRESHOLD: 2000
};

// 测试场景1: 基础连接测试
async function testBasicConnection() {
    console.log('\n=== 基础连接测试 ===');
    const client = await pool.connect();
    try {
        // 1.1 基本查询测试
        const result = await client.query('SELECT NOW()');
        console.log('基本查询成功:', result.rows[0]);

        // 1.2 字符编码测试
        const encodingResult = await client.query('SHOW client_encoding');
        console.log('客户端编码:', encodingResult.rows[0].client_encoding);

        // 1.3 事务测试
        await client.query('BEGIN');
        await client.query('SELECT 1');
        await client.query('COMMIT');
        console.log('事务测试成功');
    } catch (error) {
        console.error('基础连接测试失败:', error);
        throw error;
    } finally {
        client.release();
    }
}

// 测试场景2: 并发连接测试
async function testConcurrentConnections() {
    console.log('\n=== 并发连接测试 ===');
    const start = performance.now();
    
    // 2.1 并发查询测试
    const queries = Array(TEST_CONFIG.CONCURRENT_QUERIES).fill().map(async (_, index) => {
        const client = await pool.connect();
        try {
            // 模拟不同负载的查询
            if (index % 3 === 0) {
                await client.query('SELECT pg_sleep(0.1)'); // 慢查询
            } else if (index % 3 === 1) {
                await client.query('SELECT 1'); // 快查询
            } else {
                await client.query('SELECT * FROM pg_stat_activity'); // 中等查询
            }
            return true;
        } finally {
            client.release();
        }
    });

    const results = await Promise.all(queries);
    const duration = performance.now() - start;

    console.log(`完成 ${TEST_CONFIG.CONCURRENT_QUERIES} 个并发查询`);
    console.log(`总耗时: ${duration.toFixed(2)}ms`);
    console.log(`平均查询时间: ${(duration / TEST_CONFIG.CONCURRENT_QUERIES).toFixed(2)}ms`);
}

// 测试场景3: 错误恢复测试
async function testErrorRecovery() {
    console.log('\n=== 错误恢复测试 ===');
    const client = await pool.connect();
    
    try {
        // 3.1 语法错误测试
        try {
            await client.query('INVALID SQL');
        } catch (error) {
            console.log('语法错误处理成功');
        }

        // 3.2 事务回滚测试
        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO non_existent_table VALUES (1)');
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.log('事务回滚成功');
        }

        // 3.3 重试机制测试
        let retries = 0;
        while (retries < TEST_CONFIG.MAX_RETRIES) {
            try {
                await client.query('SELECT pg_sleep(0.1)');
                break;
            } catch (error) {
                retries++;
                console.log(`重试第 ${retries} 次`);
            }
        }
    } finally {
        client.release();
    }
}

// 测试场景4: 长时间运行查询测试
async function testLongRunningQueries() {
    console.log('\n=== 长时间运行查询测试 ===');
    
    const client = await pool.connect();
    try {
        // 4.1 超时测试
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), TEST_CONFIG.QUERY_TIMEOUT);
        });

        const queryPromise = client.query('SELECT pg_sleep(3)');
        
        try {
            await Promise.race([queryPromise, timeoutPromise]);
            console.log('查询在超时前完成');
        } catch (error) {
            console.log('查询超时被捕获');
        }

        // 4.2 查询取消测试
        const longQuery = client.query('SELECT pg_sleep(10)');
        setTimeout(() => longQuery.cancel(), 1000);
        try {
            await longQuery;
        } catch (error) {
            console.log('查询取消成功');
        }
    } finally {
        client.release();
    }
}

// 测试场景5: 连接池参数验证
async function testPoolParameters() {
    console.log('\n=== 连接池参数测试 ===');
    
    // 5.1 测试最大连接数
    const connections = [];
    try {
        for (let i = 0; i <= pool.options.max + 1; i++) {
            const client = await pool.connect();
            connections.push(client);
        }
    } catch (error) {
        console.log('最大连接数限制生效:', error.message);
    } finally {
        await Promise.all(connections.map(client => client.release()));
    }

    // 5.2 测试空闲超时
    const client = await pool.connect();
    await new Promise(resolve => setTimeout(resolve, pool.options.idleTimeoutMillis + 100));
    try {
        await client.query('SELECT NOW()');
        console.log('连接保持活跃');
    } catch (error) {
        console.log('空闲连接已关闭');
    }
}

// 主测试函数
async function runAllTests() {
    try {
        await testBasicConnection();
        await testConcurrentConnections();
        await testErrorRecovery();
        await testLongRunningQueries();
        await testPoolParameters();
        
        console.log('\n所有测试完成');
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        await pool.end();
    }
}

// 运行测试
runAllTests();