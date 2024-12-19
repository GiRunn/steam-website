/******************************************
 * 并发读写测试
 * 测试目标：验证评论系统在并发读写场景下的性能和稳定性
 ******************************************/

-- 测试准备
--------------------------
-- 创建并发测试日志表
CREATE TABLE IF NOT EXISTS review_system.concurrency_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    concurrent_users INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    avg_response_time DECIMAL(10,2),
    test_parameters JSONB,
    notes TEXT
);

-- 1. 并发读测试
--------------------------

-- 1.1 创建并发读测试函数
CREATE OR REPLACE FUNCTION review_system.test_concurrent_reads(
    p_concurrent_users INTEGER,
    p_iterations_per_user INTEGER
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.concurrency_test_log 
    (test_name, test_type, concurrent_users, test_parameters)
    VALUES (
        'Concurrent Read Test',
        'READ',
        p_concurrent_users,
        jsonb_build_object(
            'iterations_per_user', p_iterations_per_user
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 启动并发会话
    PERFORM pg_background_launch($$ 
        SELECT COUNT(*) 
        FROM review_system.reviews_partitioned 
        WHERE game_id = 9001 
        AND created_at >= CURRENT_DATE - interval '30 days'
    $$)
    FROM generate_series(1, p_concurrent_users);
    
    -- 等待所有会话完成
    PERFORM pg_sleep(5);
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.concurrency_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

/* 预期结果：
1. 并发读取性能
   - 10个并发用户: 响应时间 < 100ms
   - 50个并发用户: 响应时间 < 200ms
   - 100个并发用户: 响应时间 < 500ms

2. 系统稳定性
   - 无死锁发生
   - 无查询超时
   - 缓存命中率 > 90%

3. 资源使用
   - CPU使用率 < 80%
   - 内存使用正常
   - 无过多的磁盘I/O
*/

-- 2. 并发写测试
--------------------------

-- 2.1 创建并发写测试函数
CREATE OR REPLACE FUNCTION review_system.test_concurrent_writes(
    p_concurrent_users INTEGER,
    p_iterations_per_user INTEGER
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.concurrency_test_log 
    (test_name, test_type, concurrent_users, test_parameters)
    VALUES (
        'Concurrent Write Test',
        'WRITE',
        p_concurrent_users,
        jsonb_build_object(
            'iterations_per_user', p_iterations_per_user
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 启动并发会话
    PERFORM pg_background_launch($$ 
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content,
            playtime_hours, is_recommended, platform, language
        ) VALUES (
            9001,
            floor(random() * 1000000)::int,
            4.0 + random(),
            '并发测试评论',
            floor(random() * 100 + 1)::int,
            random() > 0.5,
            (ARRAY['PC', 'PS5', 'XBOX'])[floor(random() * 3 + 1)],
            'zh-CN'
        )
    $$)
    FROM generate_series(1, p_concurrent_users);
    
    -- 等待所有会话完成
    PERFORM pg_sleep(5);
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.concurrency_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

/* 预期结果：
1. 并发写入性能
   - 10个并发用户: 响应时间 < 200ms
   - 30个并发用户: 响应时间 < 500ms
   - 50个并发用户: 响应时间 < 1000ms

2. 数据一致性
   - 所有事务正确提交
   - 无数据丢失
   - 触发器正确执行

3. 系统稳定性
   - 无死锁
   - 无事务超时
   - 正确处理并发冲突
*/

-- 3. 执行并发测试
--------------------------

-- 3.1 执行读测试
SELECT review_system.test_concurrent_reads(10, 100);  -- 10个用户,每个执行100次
SELECT review_system.test_concurrent_reads(50, 100);  -- 50个用户,每个执行100次
SELECT review_system.test_concurrent_reads(100, 100); -- 100个用户,每个执行100次

-- 3.2 执行写测试
SELECT review_system.test_concurrent_writes(10, 50);  -- 10个用户,每个执行50次
SELECT review_system.test_concurrent_writes(30, 50);  -- 30个用户,每个执行50次
SELECT review_system.test_concurrent_writes(50, 50);  -- 50个用户,每个执行50次

-- 4. 性能监控
--------------------------

-- 4.1 监控活动会话
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    xact_start,
    query_start,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE state != 'idle'
AND backend_type = 'client backend';

/* 预期结果：
1. 活动会话状态
   - 正常的并发连接数
   - 无长时间运行的查询
   - 等待事件分布合理

2. 资源使用情况
   - 连接数在限制范围内
   - 会话状态分布合理
   - 无异常等待事件
*/

-- 4.2 监控锁等待
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

/* 预期结果：
1. 锁等待情况
   - 无死锁发生
   - 锁等待时间在可接受范围内
   - 锁冲突次数在预期范围内

2. 锁类型分布
   - 主要是行级锁
   - 表级锁使用合理
   - 无长时间的锁等待
*/

-- 5. 测试报告生成
--------------------------

-- 5.1 生成并发测试报告
SELECT 
    test_name,
    test_type,
    concurrent_users,
    duration,
    success_count,
    error_count,
    avg_response_time,
    jsonb_pretty(test_parameters) as test_parameters
FROM review_system.concurrency_test_log
WHERE start_time >= CURRENT_DATE
ORDER BY start_time DESC;

/* 预期结果：
1. 测试覆盖率
   - 所有并发场景都已测试
   - 结果数据完整记录

2. 性能指标
   - 响应时间符合预期
   - 成功率 > 99%
   - 错误率 < 1%
*/

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

TRUNCATE review_system.concurrency_test_log;

DROP FUNCTION IF EXISTS review_system.test_concurrent_reads(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS review_system.test_concurrent_writes(INTEGER, INTEGER);
*/ 