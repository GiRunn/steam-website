-- 创建只读视图
CREATE OR REPLACE VIEW review_system.reviews_readonly AS
SELECT * FROM review_system.reviews_partitioned
WHERE deleted_at IS NULL;

-- 创建读写分离函数
CREATE OR REPLACE FUNCTION review_system.route_query(
    p_is_write BOOLEAN DEFAULT false
)
RETURNS TEXT AS $$
BEGIN
    IF p_is_write THEN
        RETURN current_database();  -- 返回主库连接
    ELSE
        -- 这里可以配置多个只读副本的连接信息
        RETURN (
            SELECT concat(
                'host=', host, 
                ' port=', port, 
                ' dbname=', dbname, 
                ' user=', user_name
            )
            FROM (
                VALUES 
                    ('replica1.example.com', '5432', current_database(), 'readonly_user'),
                    ('replica2.example.com', '5432', current_database(), 'readonly_user')
            ) AS replicas(host, port, dbname, user_name)
            ORDER BY random()
            LIMIT 1
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建连接池管理函数
CREATE OR REPLACE FUNCTION review_system.get_connection(
    p_operation_type TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE p_operation_type
        WHEN 'write' THEN review_system.route_query(true)
        WHEN 'read' THEN review_system.route_query(false)
        ELSE review_system.route_query(false)  -- 默认使用只读连接
    END;
END;
$$ LANGUAGE plpgsql;

-- 创建读写分离触发器
CREATE OR REPLACE FUNCTION review_system.enforce_read_write_split()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') AND 
       current_setting('application_name') = 'readonly_connection' THEN
        RAISE EXCEPTION '只读连接不允许写操作';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_read_write_split
    BEFORE INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.enforce_read_write_split(); 