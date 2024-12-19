-- 测试包装函数
CREATE OR REPLACE FUNCTION review_system.run_test_with_monitoring(
    p_test_name TEXT,
    p_test_sql TEXT
) RETURNS TEXT AS $$
DECLARE
    v_test_id INTEGER;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_monitoring_interval INTEGER := 1; -- 1秒间隔
BEGIN
    -- 开始监控
    v_test_id := review_system.start_monitoring(p_test_name, v_monitoring_interval);
    v_start_time := clock_timestamp();

    -- 执行测试
    BEGIN
        EXECUTE p_test_sql;
        
        -- 更新测试状态为成功
        UPDATE review_system.test_results
        SET status = 'Success',
            ended_at = clock_timestamp()
        WHERE test_id = v_test_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- 记录异常
        INSERT INTO review_system.test_anomalies (
            test_id,
            anomaly_type,
            severity,
            description,
            stack_trace
        ) VALUES (
            v_test_id,
            'Test Failure',
            'Critical',
            SQLERRM,
            pg_backend_pid()::text
        );
        
        -- 更新测试状态为失败
        UPDATE review_system.test_results
        SET status = 'Failed',
            ended_at = clock_timestamp(),
            error_message = SQLERRM
        WHERE test_id = v_test_id;
        
        RAISE;
    END;

    -- 生成报告
    RETURN review_system.generate_monitoring_report(v_test_id);
END;
$$ LANGUAGE plpgsql; 