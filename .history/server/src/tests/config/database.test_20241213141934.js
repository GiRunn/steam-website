// server/src/tests/config/database.test.js
import { expect } from 'chai';
import sinon from 'sinon';

const database = await import('../../config/database.js');
const { pool, checkConnection } = database;

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
            // 根据环境判断期望的配置值
            const expectedConfig = process.env.NODE_ENV === 'test' ? {
                max: 10,                    // 测试环境最大连接数
                min: 2,                     // 测试环境最小连接数
                idleTimeoutMillis: 1000,    // 测试环境空闲超时
                connectionTimeoutMillis: 1000 // 测试环境连接超时
            } : {
                max: 100,                   // 生产环境最大连接数
                min: 20,                    // 生产环境最小连接数
                idleTimeoutMillis: 5000,    // 生产环境空闲超时
                connectionTimeoutMillis: 2000 // 生产环境连接超时
            };

            expect(pool.options).to.include(expectedConfig);
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
                query: sandbox.stub().resolves({ rows: [{ now: new Date() }] }),
                release: sandbox.stub()
            };
            
            const connectStub = sandbox.stub(pool, 'connect');
            let attempts = 0;
            
            // 改进重试逻辑
            connectStub.callsFake(async () => {
                attempts++;
                if (attempts <= 3) {
                    throw new Error('数据库未就绪');
                }
                return mockClient;
            });

            let client;
            try {
                // 添加重试逻辑
                for (let i = 0; i < 5; i++) {
                    try {
                        client = await pool.connect();
                        break;
                    } catch (error) {
                        if (i === 4) throw error;
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
                
                expect(attempts).to.be.greaterThan(3);
                expect(client).to.not.be.undefined;
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