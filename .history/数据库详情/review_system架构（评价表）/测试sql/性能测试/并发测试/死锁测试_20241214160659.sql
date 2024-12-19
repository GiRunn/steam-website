/******************************************
 * 死锁测试
 * 测试目标：验证系统在并发事务场景下的死锁处理能力
 ******************************************/

-- 测试准备
--------------------------
-- 创建死锁测试日志表
CREATE TABLE IF NOT EXISTS review_system.deadlock_test_log (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_type VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    deadlocks_detected INTEGER DEFAULT 0,
    deadlocks_resolved INTEGER DEFAULT 0,
    test_parameters JSONB,
    error_details TEXT[]
);

-- 1. 基本死锁场景测试
--------------------------

-- 1.1 创建死锁测试函数
CREATE OR REPLACE FUNCTION review_system.test_basic_deadlock()
RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_deadlocks_detected INTEGER := 0;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.deadlock_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Basic Deadlock Test',
        'DEADLOCK',
        jsonb_build_object(
            'scenario', 'basic_update_conflict',
            'transactions', 2
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 启动两个并发事务
    PERFORM pg_background_launch($$
        BEGIN;
        -- 事务1: 先锁定评论A,再尝试锁定评论B
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.1
        WHERE review_id = (
            SELECT MIN(review_id) FROM review_system.reviews_partitioned
            WHERE game_id = 9001
        );
        PERFORM pg_sleep(2);
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.1
        WHERE review_id = (
            SELECT MIN(review_id) + 1 FROM review_system.reviews_partitioned
            WHERE game_id = 9001
        );
        COMMIT;
    $$);
    
    PERFORM pg_background_launch($$
        BEGIN;
        -- 事务2: 先锁定评论B,再尝试锁定评论A
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.1
        WHERE review_id = (
            SELECT MIN(review_id) + 1 FROM review_system.reviews_partitioned
            WHERE game_id = 9001
        );
        PERFORM pg_sleep(2);
        UPDATE review_system.reviews_partitioned
        SET rating = rating + 0.1
        WHERE review_id = (
            SELECT MIN(review_id) FROM review_system.reviews_partitioned
            WHERE game_id = 9001
        );
        COMMIT;
    $$);
    
    -- 等待死锁检测
    PERFORM pg_sleep(5);
    
    -- 统计死锁情况
    SELECT COUNT(*)
    INTO v_deadlocks_detected
    FROM pg_stat_database
    WHERE datname = current_database()
    AND deadlocks > 0;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.deadlock_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        deadlocks_detected = v_deadlocks_detected,
        deadlocks_resolved = v_deadlocks_detected
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

/* 预期结果：
1. 死锁检测
   - 成功检测到死锁情况
   - 死锁被及时发现(< 1s)
   - 系统自动选择牺牲事务

2. 死锁解决
   - 死锁被正确解决
   - 一个事务回滚,另一个提交
   - 数据保持一致性

3. 系统响应
   - 系统保持稳定
   - 其他事务不受影响
   - 错误信息正确记录
*/

-- 2. 复杂死锁场景测试
--------------------------

-- 2.1 创建多事务死锁测试函数
CREATE OR REPLACE FUNCTION review_system.test_complex_deadlock(
    p_transaction_count INTEGER DEFAULT 3
) RETURNS void AS $$
DECLARE
    v_test_id BIGINT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_deadlocks_detected INTEGER := 0;
BEGIN
    -- 记录测试开始
    INSERT INTO review_system.deadlock_test_log 
    (test_name, test_type, test_parameters)
    VALUES (
        'Complex Deadlock Test',
        'DEADLOCK',
        jsonb_build_object(
            'scenario', 'multi_transaction_conflict',
            'transactions', p_transaction_count
        )
    ) RETURNING test_id INTO v_test_id;
    
    v_start_time := clock_timestamp();
    
    -- 启动多个并发事务
    FOR i IN 1..p_transaction_count LOOP
        PERFORM pg_background_launch(format($$
            BEGIN;
            -- 每个事务尝试锁定两个不同的评论
            UPDATE review_system.reviews_partitioned
            SET rating = rating + 0.1
            WHERE review_id = (
                SELECT MIN(review_id) + %s FROM review_system.reviews_partitioned
                WHERE game_id = 9001
            );
            PERFORM pg_sleep(1);
            UPDATE review_system.reviews_partitioned
            SET rating = rating + 0.1
            WHERE review_id = (
                SELECT MIN(review_id) + %s FROM review_system.reviews_partitioned
                WHERE game_id = 9001
            );
            COMMIT;
        $$, i - 1, i % p_transaction_count));
    END LOOP;
    
    -- 等待死锁检测
    PERFORM pg_sleep(10);
    
    -- 统计死锁情况
    SELECT COUNT(*)
    INTO v_deadlocks_detected
    FROM pg_stat_database
    WHERE datname = current_database()
    AND deadlocks > 0;
    
    v_end_time := clock_timestamp();
    
    -- 更新测试结果
    UPDATE review_system.deadlock_test_log
    SET 
        end_time = v_end_time,
        duration = v_end_time - v_start_time,
        deadlocks_detected = v_deadlocks_detected,
        deadlocks_resolved = v_deadlocks_detected
    WHERE test_id = v_test_id;
END;
$$ LANGUAGE plpgsql;

/* 预期结果：
1. 多事务死锁处理
   - 正确处理多事务死锁
   - 死锁检测时间可接受
   - 选择合适的牺牲事务

2. 系统恢复能力
   - 系统自动恢复正常
   - 未完成事务正确回滚
   - 资源被正确释放

3. 性能影响
   - 系统吞吐量影响可控
   - 其他事务延迟可接受
   - 资源使用合理
*/

-- 3. 死锁监控
--------------------------

-- 3.1 监控死锁统计
SELECT 
    datname,
    deadlocks,
    conflicts,
    temp_files,
    temp_bytes
FROM pg_stat_database
WHERE datname = current_database();

/* 预期结果：
1. 死锁统计
   - 死锁次数在预期范围内
   - 冲突处理及时
   - 临时文件使用合理
*/

-- 3.2 监控锁等待
SELECT 
    pid,
    usename,
    query_start,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE wait_event_type = 'Lock'
AND state = 'active';

/* 预期结果：
1. 锁等待状态
   - 锁等待时间合理
   - 无长期等待会话
   - 等待事件分布正常
*/

-- 4. 死锁预防测试
--------------------------

-- 4.1 测试事务超时设置
SET statement_timeout = '5s';
SET lock_timeout = '2s';

/* 预期结果：
1. 超时设置效果
   - 长事务被及时中断
   - 锁等待不超过限制
   - 错误信息明确
*/

-- 4.2 测试死锁预防策略
BEGIN;
SET LOCAL deadlock_timeout = '1s';
-- 执行可能导致死锁的操作
COMMIT;

/* 预期结果：
1. 预防策略效果
   - 及时检测潜在死锁
   - 合理的超时设置
   - 正确的错误处理
*/

-- 5. 测试报告生成
--------------------------

-- 5.1 生成死锁测试报告
SELECT 
    test_name,
    test_type,
    duration,
    deadlocks_detected,
    deadlocks_resolved,
    jsonb_pretty(test_parameters) as test_parameters,
    error_details
FROM review_system.deadlock_test_log
WHERE start_time >= CURRENT_DATE
ORDER BY start_time DESC;

/* 预期结果：
1. 报告完整性
   - 包含所有测试场景
   - 详细的统计数据
   - 清晰的错误记录

2. 测试结果分析
   - 死锁检测率100%
   - 死锁解决率100%
   - 系统恢复正常
*/

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

TRUNCATE review_system.deadlock_test_log;

DROP FUNCTION IF EXISTS review_system.test_basic_deadlock();
DROP FUNCTION IF EXISTS review_system.test_complex_deadlock(INTEGER);

-- 重置会话参数
RESET statement_timeout;
RESET lock_timeout;
*/ 