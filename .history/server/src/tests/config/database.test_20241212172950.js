// server/src/tests/config/database.test.js
const { strict: assert } = require('assert');
const { pool, checkConnection } = require('../../config/database');

describe('Database Configuration Tests', () => {
  it('should have correct pool configuration', () => {
    assert.equal(pool.options.max, 100);
    assert.equal(pool.options.min, 20);
    assert.equal(pool.options.idleTimeoutMillis, 5000);
    assert.equal(pool.options.connectionTimeoutMillis, 2000);
  });

  it('should successfully connect to database', async () => {
    const result = await checkConnection();
    assert.equal(result, true);
  });

  it('should handle concurrent connections', async () => {
    const queries = Array(10).fill().map(() => checkConnection());
    const results = await Promise.all(queries);
    assert.equal(results.every(result => result === true), true);
  });
});