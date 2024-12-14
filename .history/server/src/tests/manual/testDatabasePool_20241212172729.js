// server/src/tests/manual/testDatabasePool.js
const { pool, checkConnection } = require('../../config/database');

async function testDatabasePool() {
  console.log('Starting database pool tests...');

  // 测试连接
  console.log('Testing connection...');
  const isConnected = await checkConnection();
  console.log('Connection test result:', isConnected);

  // 测试并发连接
  console.log('\nTesting concurrent connections...');
  const concurrentQueries = 50;
  const startTime = Date.now();
  
  try {
    const queries = Array(concurrentQueries).fill().map(async (_, index) => {
      const client = await pool.connect();
      console.log(`Connection ${index + 1} established`);
      const result = await client.query('SELECT NOW()');
      client.release();
      return result;
    });

    await Promise.all(queries);
    console.log(`Successfully handled ${concurrentQueries} concurrent connections`);
    console.log(`Total time: ${Date.now() - startTime}ms`);

    // 输出连接池状态
    console.log('\nPool status:');
    console.log(`Total connections: ${pool.totalCount}`);
    console.log(`Idle connections: ${pool.idleCount}`);
    console.log(`Waiting requests: ${pool.waitingCount}`);

  } catch (error) {
    console.error('Error during concurrent connection test:', error);
  }
}

// 测试性能监控
const { performanceMonitor, logger } = require('../../middleware/performanceMonitor');

async function testPerformanceMonitor() {
  console.log('\nTesting performance monitor...');

  // 模拟请求和响应
  const req = {
    method: 'GET',
    url: '/test',
    ip: '127.0.0.1',
    headers: {}
  };

  const res = {
    statusCode: 200,
    on: (event, callback) => {
      if (event === 'finish') {
        // 模拟不同响应时间
        setTimeout(() => {
          callback();
        }, Math.random() * 1200); // 随机延迟0-1200ms
      }
    }
  };

  // 测试多个请求
  for (let i = 0; i < 5; i++) {
    performanceMonitor(req, res, () => {
      console.log(`Request ${i + 1} processed`);
    });
  }
}

async function runTests() {
  try {
    await testDatabasePool();
    await testPerformanceMonitor();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // 清理连接
    await pool.end();
    process.exit();
  }
}

runTests();