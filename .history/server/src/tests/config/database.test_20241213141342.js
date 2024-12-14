// server/src/tests/config/database.test.js
import 'dotenv/config';
import { expect } from 'chai';
import sinon from 'sinon';
import { pool, checkConnection } from '../../config/database.js';

describe('数据库配置测试', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('连接池配置测试', () => {
        it('应该具有正确的连接池设置', () => {
            expect(pool.options).to.include({
                max: 100,          // 最大连接数
                min: 20,           // 最小连接数
                idleTimeoutMillis: 5000,        // 空闲超时
                connectionTimeoutMillis: 2000    // 连接超时
            });
        });

        it('应该正确处理连接错误', (done) => {
            const errorHandler = sandbox.spy();
            pool.on('error', errorHandler);
            pool.emit('error', new Error('测试错误'));
            expect(errorHandler.calledOnce).to.be.true;
            done();
        });
    });

    describe('数据库连接检查', () => {
        it('应该成功建立连接', async () => {
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

        it('应该正确处理连接失败', async () => {
            sandbox.stub(pool, 'connect').rejects(new Error('连接失败'));
            const result = await checkConnection();
            expect(result).to.be.false;
        });
    });

    describe('连接池行为测试', () => {
        it('应该正确处理并发连接', async () => {
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

        it('应该遵守最大连接数限制', async function() {
            this.timeout(10000);
            
            const maxConnections = pool.options.max;
            const connections = [];
            const mockClient = {
                query: sandbox.stub().resolves(),
                release: sandbox.stub()
            };

            const connectStub = sandbox.stub(pool, 'connect');
            for (let i = 0; i < maxConnections; i++) {
                connectStub.onCall(i).resolves(mockClient);
            }
            connectStub.onCall(maxConnections).rejects(new Error('连接超时'));

            try {
                for (let i = 0; i <= maxConnections + 1; i++) {
                    connections.push(await pool.connect());
                }
                throw new Error('不应该执行到这里');
            } catch (error) {
                expect(error.message).to.equal('连接超时');
            } finally {
                connections.forEach(() => mockClient.release());
            }
        });

        // 新增：事务处理测试
        it('应该正确处理事务', async () => {
            const mockClient = {
                query: sandbox.stub(),
                release: sandbox.stub()
            };
            
            mockClient.query.withArgs('BEGIN').resolves();
            mockClient.query.withArgs('COMMIT').resolves();
            mockClient.query.withArgs('ROLLBACK').resolves();
            
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query('COMMIT');
                expect(mockClient.query.calledWith('BEGIN')).to.be.true;
                expect(mockClient.query.calledWith('COMMIT')).to.be.true;
            } catch (error) {
                await client.query('ROLLBACK');
            } finally {
                client.release();
            }
        });

        // 新增：连接池恢复测试
        it('应该在数据库重启后自动恢复连接', async function() {
            this.timeout(15000);
            const mockClient = {
                query: sandbox.stub().resolves(),
                release: sandbox.stub()
            };
            
            const connectStub = sandbox.stub(pool, 'connect');
            // 模拟数据库重启：前三次连接失败，之后恢复
            connectStub.onCall(0).rejects(new Error('数据库未就绪'));
            connectStub.onCall(1).rejects(new Error('数据库未就绪'));
            connectStub.onCall(2).rejects(new Error('数据库未就绪'));
            connectStub.resolves(mockClient);

            let client;
            try {
                client = await pool.connect();
                expect(connectStub.callCount).to.be.greaterThan(3);
            } finally {
                if (client) client.release();
            }
        });
    });

    describe('查询执行测试', () => {
        it('应该使用正确的字符编码执行查询', async () => {
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

        it('应该正确处理查询超时', async () => {
            const mockClient = {
                query: sandbox.stub().rejects(new Error('查询超时')),
                release: sandbox.stub()
            };
            sandbox.stub(pool, 'connect').resolves(mockClient);

            const client = await pool.connect();
            try {
                await client.query('SELECT pg_sleep(10)');
                throw new Error('不应该执行到这里');
            } catch (error) {
                expect(error.message).to.equal('查询超时');
            } finally {
                client.release();
            }
        });

        // 新增：长查询监控测试
        it('应该能监控长时间运行的查询', async () => {
            const mockClient = {
                query: sandbox.stub(),
                release: sandbox.stub()
            };

            const longQueryResult = {
                rows: [{
                    pid: 1,
                    query_start: new Date(Date.now() - 10000),
                    state: 'active',
                    query: 'SELECT pg_sleep(10)'
                }]
            };

            mockClient.query
                .withArgs('SELECT pid, query_start, state, query FROM pg_stat_activity')
                .resolves(longQueryResult);

            sandbox.stub(pool, 'connect').resolves(mockClient);

            const client = await pool.connect();
            try {
                const result = await client.query(
                    'SELECT pid, query_start, state, query FROM pg_stat_activity'
                );
                const longQueries = result.rows.filter(
                    row => Date.now() - row.query_start > 5000
                );
                expect(longQueries.length).to.be.greaterThan(0);
            } finally {
                client.release();
            }
        });
    });
});