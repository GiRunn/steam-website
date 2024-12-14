// server/src/tests/config/database.test.js
require('dotenv').config();  // 确保在最开始加载环境变量
const { strict: assert } = require('assert');
const { pool, checkConnection } = require('../../config/database');

describe('数据库配置测试', () => {
  it('应该有正确的连接池配置', () => {
    assert.equal(pool.options.max, 100);
    assert.equal(pool.options.min, 20);
    assert.equal(pool.options.idleTimeoutMillis, 5000);
    assert.equal(pool.options.connectionTimeoutMillis, 2000);

    // 验证数据库连接参数是否与.env一致
    assert.equal(pool.options.user, process.env.DB_USER);
    assert.equal(pool.options.host, process.env.DB_HOST);
    assert.equal(pool.options.database, process.env.DB_NAME);
    assert.equal(pool.options.password, process.env.DB_PASSWORD);
    assert.equal(pool.options.port, parseInt(process.env.DB_PORT));
  });

  it('应该成功连接到数据库', async () => {
    const result = await checkConnection();
    assert.equal(result, true);
  });

  it('应该处理并发连接', async () => {
    const queries = Array(10).fill().map(() => checkConnection());
    const results = await Promise.all(queries);
    assert.equal(results.every(result => result === true), true);
  });

  // 测试完成后关闭连接池
  after(async () => {
    await pool.end();
  });
});