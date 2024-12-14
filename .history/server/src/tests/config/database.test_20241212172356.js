// server/src/tests/config/database.test.js
const { expect } = require('chai');
const { pool, checkConnection } = require('../../config/database');

describe('Database Configuration Tests', () => {
  it('should have correct pool configuration', () => {
    expect(pool.options.max).to.equal(100);
    expect(pool.options.min).to.equal(20);
    expect(pool.options.idleTimeoutMillis).to.equal(5000);
    expect(pool.options.connectionTimeoutMillis).to.equal(2000);
  });

  it('should successfully connect to database', async () => {
    const result = await checkConnection();
    expect(result).to.be.true;
  });

  it('should handle concurrent connections', async () => {
    const queries = Array(10).fill().map(() => checkConnection());
    const results = await Promise.all(queries);
    expect(results.every(result => result === true)).to.be.true;
  });
});