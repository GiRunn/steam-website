/******************************************
 * 分区监控功能测试
 * 测试目标：验证分区表的监控和预警功能
 ******************************************/

-- 测试准备
--------------------------
-- 创建监控指标表
CREATE TABLE IF NOT EXISTS review_system.partition_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    partition_name VARCHAR(100),
    metric_type VARCHAR(50),
    metric_value NUMERIC,
    threshold_value NUMERIC,
    alert_level VARCHAR(20),
    collection_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

-- 创建监控告警表
CREATE TABLE IF NOT EXISTS review_system.partition_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    partition_name VARCHAR(100),
    alert_type VARCHAR(50),
    alert_level VARCHAR(20),
    alert_message TEXT,
    metric_value NUMERIC,
    threshold_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    alert_status VARCHAR(20) DEFAULT 'ACTIVE',
    details JSONB
);

-- 1. 分区大小监控测试
--------------------------

-- 1.1 创建分区大小监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_partition_size(
    p_size_threshold_mb INTEGER DEFAULT 1000
) RETURNS void AS $$
DECLARE
    v_partition record;
    v_size_bytes BIGINT;
    v_size_mb NUMERIC;
BEGIN
    FOR v_partition IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'review_system'
        AND tablename ~ '^reviews_y\d{4}m\d{2}$'
    ) LOOP
        -- 获取分区大小
        SELECT pg_total_relation_size(v_partition.schemaname || '.' || v_partition.tablename)
        INTO v_size_bytes;
        
        v_size_mb := v_size_bytes::numeric / (1024 * 1024);
        
        -- 记录监控指标
        INSERT INTO review_system.partition_metrics (
            partition_name,
            metric_type,
            metric_value,
            threshold_value,
            alert_level,
            details
        ) VALUES (
            v_partition.tablename,
            'PARTITION_SIZE',
            v_size_mb,
            p_size_threshold_mb,
            CASE 
                WHEN v_size_mb >= p_size_threshold_mb THEN 'HIGH'
                WHEN v_size_mb >= p_size_threshold_mb * 0.8 THEN 'MEDIUM'
                ELSE 'LOW'
            END,
            jsonb_build_object(
                'size_bytes', v_size_bytes,
                'size_pretty', pg_size_pretty(v_size_bytes)
            )
        );
        
        -- 生成告警
        IF v_size_mb >= p_size_threshold_mb THEN
            INSERT INTO review_system.partition_alerts (
                partition_name,
                alert_type,
                alert_level,
                alert_message,
                metric_value,
                threshold_value,
                details
            ) VALUES (
                v_partition.tablename,
                'PARTITION_SIZE',
                'HIGH',
                format('Partition %s size (%s) exceeds threshold (%s MB)',
                    v_partition.tablename,
                    pg_size_pretty(v_size_bytes),
                    p_size_threshold_mb
                ),
                v_size_mb,
                p_size_threshold_mb,
                jsonb_build_object(
                    'current_size', pg_size_pretty(v_size_bytes),
                    'threshold_size', pg_size_pretty(p_size_threshold_mb * 1024 * 1024)
                )
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. 分区行数监控测试
--------------------------

-- 2.1 创建分区行数监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_partition_rows(
    p_rows_threshold INTEGER DEFAULT 1000000
) RETURNS void AS $$
DECLARE
    v_partition record;
    v_row_count BIGINT;
BEGIN
    FOR v_partition IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'review_system'
        AND tablename ~ '^reviews_y\d{4}m\d{2}$'
    ) LOOP
        -- 获取行数
        EXECUTE format('SELECT COUNT(*) FROM review_system.%I', v_partition.tablename)
        INTO v_row_count;
        
        -- 记录监控指标
        INSERT INTO review_system.partition_metrics (
            partition_name,
            metric_type,
            metric_value,
            threshold_value,
            alert_level,
            details
        ) VALUES (
            v_partition.tablename,
            'ROW_COUNT',
            v_row_count,
            p_rows_threshold,
            CASE 
                WHEN v_row_count >= p_rows_threshold THEN 'HIGH'
                WHEN v_row_count >= p_rows_threshold * 0.8 THEN 'MEDIUM'
                ELSE 'LOW'
            END,
            jsonb_build_object(
                'row_count', v_row_count,
                'threshold', p_rows_threshold
            )
        );
        
        -- 生成告警
        IF v_row_count >= p_rows_threshold THEN
            INSERT INTO review_system.partition_alerts (
                partition_name,
                alert_type,
                alert_level,
                alert_message,
                metric_value,
                threshold_value,
                details
            ) VALUES (
                v_partition.tablename,
                'ROW_COUNT',
                'HIGH',
                format('Partition %s row count (%s) exceeds threshold (%s)',
                    v_partition.tablename,
                    v_row_count,
                    p_rows_threshold
                ),
                v_row_count,
                p_rows_threshold,
                jsonb_build_object(
                    'current_rows', v_row_count,
                    'threshold_rows', p_rows_threshold
                )
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. 分区增长趋势监控测试
--------------------------

-- 3.1 创建分区增长趋势监控函数
CREATE OR REPLACE FUNCTION review_system.monitor_partition_growth(
    p_growth_rate_threshold NUMERIC DEFAULT 50.0  -- 50% growth rate threshold
) RETURNS void AS $$
DECLARE
    v_partition record;
    v_current_size BIGINT;
    v_previous_size BIGINT;
    v_growth_rate NUMERIC;
BEGIN
    FOR v_partition IN (
        SELECT 
            m1.partition_name,
            m1.metric_value as current_value,
            m2.metric_value as previous_value
        FROM review_system.partition_metrics m1
        LEFT JOIN review_system.partition_metrics m2 ON 
            m1.partition_name = m2.partition_name AND
            m1.metric_type = m2.metric_type AND
            m2.collection_time = (
                SELECT MAX(collection_time)
                FROM review_system.partition_metrics m3
                WHERE m3.partition_name = m1.partition_name
                AND m3.metric_type = m1.metric_type
                AND m3.collection_time < m1.collection_time
            )
        WHERE m1.metric_type = 'PARTITION_SIZE'
        AND m1.collection_time >= CURRENT_TIMESTAMP - interval '1 day'
    ) LOOP
        -- 计算增长率
        IF v_partition.previous_value > 0 THEN
            v_growth_rate := ((v_partition.current_value - v_partition.previous_value) / 
                             v_partition.previous_value * 100.0);
            
            -- 记录监控指标
            INSERT INTO review_system.partition_metrics (
                partition_name,
                metric_type,
                metric_value,
                threshold_value,
                alert_level,
                details
            ) VALUES (
                v_partition.partition_name,
                'GROWTH_RATE',
                v_growth_rate,
                p_growth_rate_threshold,
                CASE 
                    WHEN v_growth_rate >= p_growth_rate_threshold THEN 'HIGH'
                    WHEN v_growth_rate >= p_growth_rate_threshold * 0.8 THEN 'MEDIUM'
                    ELSE 'LOW'
                END,
                jsonb_build_object(
                    'current_value', v_partition.current_value,
                    'previous_value', v_partition.previous_value,
                    'growth_rate', v_growth_rate
                )
            );
            
            -- 生成告警
            IF v_growth_rate >= p_growth_rate_threshold THEN
                INSERT INTO review_system.partition_alerts (
                    partition_name,
                    alert_type,
                    alert_level,
                    alert_message,
                    metric_value,
                    threshold_value,
                    details
                ) VALUES (
                    v_partition.partition_name,
                    'GROWTH_RATE',
                    'HIGH',
                    format('Partition %s growth rate (%.2f%%) exceeds threshold (%.2f%%)',
                        v_partition.partition_name,
                        v_growth_rate,
                        p_growth_rate_threshold
                    ),
                    v_growth_rate,
                    p_growth_rate_threshold,
                    jsonb_build_object(
                        'current_value', v_partition.current_value,
                        'previous_value', v_partition.previous_value,
                        'growth_rate', v_growth_rate
                    )
                );
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 执行监控测试
--------------------------

-- 4.1 执行所有监控检查
DO $$
BEGIN
    -- 执行大小监控
    PERFORM review_system.monitor_partition_size(1000);  -- 1000MB阈值
    
    -- 执行行数监控
    PERFORM review_system.monitor_partition_rows(1000000);  -- 100万行阈值
    
    -- 执行增长趋势监控
    PERFORM review_system.monitor_partition_growth(50.0);  -- 50%增长率阈值
END;
$$;

-- 5. 监控报告生成
--------------------------

-- 5.1 生成监控指标报告
SELECT 
    partition_name,
    metric_type,
    metric_value,
    threshold_value,
    alert_level,
    collection_time,
    details
FROM review_system.partition_metrics
WHERE collection_time >= CURRENT_TIMESTAMP - interval '1 day'
ORDER BY collection_time DESC, partition_name;

-- 5.2 生成告警报告
SELECT 
    partition_name,
    alert_type,
    alert_level,
    alert_message,
    created_at,
    resolved_at,
    alert_status,
    details
FROM review_system.partition_alerts
WHERE created_at >= CURRENT_TIMESTAMP - interval '1 day'
ORDER BY created_at DESC;

-- 6. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
-- 清理监控数据
TRUNCATE review_system.partition_metrics;
TRUNCATE review_system.partition_alerts;

-- 删除测试函数
DROP FUNCTION IF EXISTS review_system.monitor_partition_size(INTEGER);
DROP FUNCTION IF EXISTS review_system.monitor_partition_rows(INTEGER);
DROP FUNCTION IF EXISTS review_system.monitor_partition_growth(NUMERIC);
*/ 