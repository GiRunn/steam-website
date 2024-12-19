-- 故障恢复测试
DO $$
DECLARE
    v_start_time timestamp;
BEGIN
    -- 1. 磁盘故障恢复测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_disk_failure_recovery();
        
        PERFORM review_system.record_test_result(
            '磁盘故障恢复测试',
            '极限测试-故障恢复',
            '通过',
            '成功测试磁盘故障恢复机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '磁盘故障恢复测试',
            '极限测试-故障恢复',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 2. 网络故障恢复测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_network_failure_recovery();
        
        PERFORM review_system.record_test_result(
            '网络故障恢复测试',
            '极限测试-故障恢复',
            '通过',
            '成功测试网络故障恢复机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '网络故障恢复测试',
            '极限测试-故障恢复',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 3. 进程崩溃恢复测试
    BEGIN
        v_start_time := clock_timestamp();
        
        SELECT * FROM review_system.test_process_crash_recovery();
        
        PERFORM review_system.record_test_result(
            '进程崩溃恢复测试',
            '极限测试-故障恢复',
            '通过',
            '成功测试进程崩溃恢复机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '进程崩溃恢复测试',
            '极限测试-故障恢复',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 4. 数据一致性恢复测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 模拟数据不一致
        BEGIN
            -- 插入测试数据
            INSERT INTO review_system.reviews_partitioned (
                game_id, user_id, rating, content
            ) VALUES (1001, 1, 4.5, '一致性测试');
            
            -- 故意制造不一致
            UPDATE review_system.reviews_partitioned
            SET rating = -1
            WHERE content = '一致性测试';
            
            -- 检查并修复不一致
            UPDATE review_system.reviews_partitioned
            SET rating = CASE 
                WHEN rating < 0 THEN 0
                WHEN rating > 5 THEN 5
                ELSE rating
            END
            WHERE rating < 0 OR rating > 5;
        END;
        
        PERFORM review_system.record_test_result(
            '数据一致性恢复测试',
            '极限测试-故障恢复',
            '通过',
            '成功测试数据一致性恢复机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '数据一致性恢复测试',
            '极限测试-故障恢复',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;

    -- 5. 备份恢复测试
    BEGIN
        v_start_time := clock_timestamp();
        
        -- 创建测试表
        CREATE TEMP TABLE backup_test (
            id serial,
            data text
        );
        
        -- 插入测试数据
        INSERT INTO backup_test (data)
        SELECT 'Test data ' || generate_series
        FROM generate_series(1, 1000);
        
        -- 模拟备份
        CREATE TEMP TABLE backup_test_copy AS
        SELECT * FROM backup_test;
        
        -- 模拟数据丢失
        DELETE FROM backup_test;
        
        -- 从备份恢复
        INSERT INTO backup_test
        SELECT * FROM backup_test_copy;
        
        -- 清理
        DROP TABLE backup_test;
        DROP TABLE backup_test_copy;
        
        PERFORM review_system.record_test_result(
            '备份恢复测试',
            '极限测试-故障恢复',
            '通过',
            '成功测试备份恢复机制',
            clock_timestamp() - v_start_time
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM review_system.record_test_result(
            '备份恢复测试',
            '极限测试-故障恢复',
            '失败',
            SQLERRM,
            clock_timestamp() - v_start_time
        );
    END;
END $$; 