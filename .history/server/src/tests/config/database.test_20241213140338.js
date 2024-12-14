// server/src/tests/config/database.test.js
require('dotenv').config();  // 确保在最开始加载环境变量
const { expect } = require('chai');
const sinon = require('sinon');
const { pool, checkConnection } = require('../../config/database');

describe('Database Configuration Tests', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Pool Configuration', () => {
        it('should have correct pool settings', () => {
            expect(pool.options).to.include({
                max: 100,
                min: 20,
                idleTimeoutMillis: 5000,
                connectionTimeoutMillis: 2000
            });
        });

        it('should handle connection errors', (done) => {
            const errorHandler = sandbox.spy();
            pool.on('error', errorHandler);

            // 模拟连接错误
            pool.emit('error', new Error('Test error'));

            expect(errorHandler.calledOnce).to.be.true;
            done();
        });
    });

    describe('Connection Check', () => {
        it('should successfully check connection', async () => {
            const mockClient = {
                query: sandbox.stub().resolves(),
                release: sandbox.stub()
            };
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const result = await checkConnection();
            expect(result).to.be.true;
            expect(mockClient.query.calledWith('SET client_encoding = utf8')).to.be.true;
            expect(mockClient.release.calledOnce).to.be.true;
        });

        it('should handle connection failure', async () => {
            sandbox.stub(pool, 'connect').rejects(new Error('Connection failed'));

            const result = await checkConnection();
            expect(result).to.be.false;
        });
    });

    describe('Connection Pool Behavior', () => {
        it('should handle concurrent connections', async () => {
            const mockClient = {
                query: sandbox.stub().resolves({ rows: [{ now: new Date() }] }),
                release: sandbox.stub()
            };
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const concurrentQueries = 10;
            const queries = Array(concurrentQueries).fill().map(() => 
                pool.connect().then(client => {
                    return client.query('SELECT NOW()').then(() => client.release());
                })
            );

            await Promise.all(queries);
            expect(pool.connect.callCount).to.equal(concurrentQueries);
            expect(mockClient.release.callCount).to.equal(concurrentQueries);
        });

        it('should respect max connection limit', async () => {
            const maxConnections = pool.options.max;
            const connections = [];

            try {
                for (let i = 0; i <= maxConnections + 1; i++) {
                    connections.push(await pool.connect());
                }
                throw new Error('Should not reach here');
            } catch (error) {
                expect(error.message).to.include('timeout');
            } finally {
                // 释放所有连接
                await Promise.all(connections.map(client => client.release()));
            }
        });
    });

    describe('Query Execution', () => {
        it('should execute queries with proper encoding', async () => {
            const mockClient = {
                query: sandbox.stub().resolves({ rows: [{ encoding: 'UTF8' }] }),
                release: sandbox.stub()
            };
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const client = await pool.connect();
            const result = await client.query('SHOW client_encoding');
            client.release();

            expect(result.rows[0].encoding).to.equal('UTF8');
        });

        it('should handle query timeouts', async () => {
            const mockClient = {
                query: sandbox.stub().rejects(new Error('Query timeout')),
                release: sandbox.stub()
            };
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const client = await pool.connect();
            try {
                await client.query('SELECT pg_sleep(10)');
                throw new Error('Should not reach here');
            } catch (error) {
                expect(error.message).to.equal('Query timeout');
            } finally {
                client.release();
            }
        });
    });
});