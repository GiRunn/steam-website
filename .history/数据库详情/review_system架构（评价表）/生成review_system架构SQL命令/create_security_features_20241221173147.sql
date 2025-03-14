-- 创建获取当前用户ID的函数
CREATE OR REPLACE FUNCTION review_system.get_current_user_id()
RETURNS BIGINT AS $$
BEGIN
    -- 从会话变量中获取用户ID，如果未设置则返回NULL
    RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建行级安全策略
CREATE TABLE IF NOT EXISTS review_system.user_roles (
    user_id BIGINT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为评论表启用行级安全
ALTER TABLE review_system.reviews_partitioned ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在）
DO $$
BEGIN
    -- 删除评论表策略
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'review_system' 
        AND tablename = 'reviews_partitioned'
        AND policyname = 'review_access_policy'
    ) THEN
        DROP POLICY review_access_policy ON review_system.reviews_partitioned;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'review_system' 
        AND tablename = 'reviews_partitioned'
        AND policyname = 'reviews_readonly_policy'
    ) THEN
        DROP POLICY reviews_readonly_policy ON review_system.reviews_partitioned;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'review_system' 
        AND tablename = 'reviews_partitioned'
        AND policyname = 'reviews_writer_policy'
    ) THEN
        DROP POLICY reviews_writer_policy ON review_system.reviews_partitioned;
    END IF;
END $$;

-- 重新创建策略
CREATE POLICY review_access_policy ON review_system.reviews_partitioned
    USING (
        (CURRENT_USER = 'postgres') OR  
        (user_id = review_system.get_current_user_id()) OR  
        (review_status = 'active' AND deleted_at IS NULL)  
    );

-- 创建数据加密函数
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建加密函数
CREATE OR REPLACE FUNCTION review_system.encrypt_sensitive_data(
    p_data TEXT,
    p_key TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(
            p_data::TEXT,
            p_key,
            'cipher-algo=aes256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建解密函数
CREATE OR REPLACE FUNCTION review_system.decrypt_sensitive_data(
    p_encrypted_data TEXT,
    p_key TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(p_encrypted_data, 'base64')::bytea,
        p_key
    )::TEXT;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL; -- 解密失败时返回NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建专用角色（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'review_readonly') THEN
        CREATE ROLE review_readonly;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'review_writer') THEN
        CREATE ROLE review_writer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'review_admin') THEN
        CREATE ROLE review_admin;
    END IF;
END
$$;

-- 重新授予权限（即使角色已存在也可以安全执行）
GRANT USAGE ON SCHEMA review_system TO review_readonly, review_writer, review_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA review_system TO review_readonly;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA review_system TO review_writer;
GRANT ALL ON ALL TABLES IN SCHEMA review_system TO review_admin;

-- 设置默认权限（可以安全重复执行）
ALTER DEFAULT PRIVILEGES IN SCHEMA review_system 
    GRANT SELECT ON TABLES TO review_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA review_system 
    GRANT SELECT, INSERT, UPDATE ON TABLES TO review_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA review_system 
    GRANT ALL ON TABLES TO review_admin;

-- 创建更细粒度的行级安全策略
ALTER TABLE review_system.reviews_partitioned ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_system.review_replies_partitioned ENABLE ROW LEVEL SECURITY;

-- 只读用户策略
CREATE POLICY reviews_readonly_policy ON review_system.reviews_partitioned
    FOR SELECT
    TO review_readonly
    USING (review_status = 'active' AND deleted_at IS NULL);

-- 写入用户策略
CREATE POLICY reviews_writer_policy ON review_system.reviews_partitioned
    FOR ALL
    TO review_writer
    USING (
        (review_status = 'active' AND deleted_at IS NULL) OR
        (user_id = review_system.get_current_user_id())
    );

-- 添加内容加密功能
CREATE OR REPLACE FUNCTION review_system.encrypt_content(
    p_content TEXT,
    p_encryption_key TEXT
) RETURNS TEXT AS $$
BEGIN
    -- 使用AES-256加密
    RETURN encode(
        pgp_sym_encrypt(
            p_content,
            p_encryption_key,
            'cipher-algo=aes256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加内容解密功能
CREATE OR REPLACE FUNCTION review_system.decrypt_content(
    p_encrypted_content TEXT,
    p_encryption_key TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(p_encrypted_content, 'base64')::bytea,
        p_encryption_key
    )::TEXT;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 修改评论表添加加密字段
ALTER TABLE review_system.reviews_partitioned
ADD COLUMN encrypted_content TEXT,
ADD COLUMN is_encrypted BOOLEAN DEFAULT false;

-- 增强审计日志表
CREATE TABLE review_system.security_audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id BIGINT,
    ip_address INET,
    user_agent TEXT,
    action_type VARCHAR(50),
    table_name VARCHAR(100),
    record_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    status VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建审计日志触发器函数
CREATE OR REPLACE FUNCTION review_system.log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- 添加错误处理
    BEGIN
        INSERT INTO review_system.security_audit_log (
            event_type,
            user_id,
            ip_address,
            action_type,
            table_name,
            record_id,
            old_data,
            new_data,
            status
        ) VALUES (
            TG_OP,
            COALESCE(review_system.get_current_user_id(), -1),  -- 使用COALESCE处理NULL
            COALESCE(inet_client_addr(), '0.0.0.0'::inet),      -- 使用COALESCE处理NULL
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'CREATE'
                WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
                WHEN TG_OP = 'DELETE' THEN 'DELETE'
            END,
            TG_TABLE_NAME,
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.review_id
                ELSE NEW.review_id
            END,
            CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
            'SUCCESS'
        );
    EXCEPTION WHEN OTHERS THEN
        -- 记录错误但不中断操作
        INSERT INTO review_system.security_audit_log (
            event_type,
            action_type,
            table_name,
            status,
            error_message
        ) VALUES (
            TG_OP,
            'ERROR',
            TG_TABLE_NAME,
            'FAILED',
            SQLERRM
        );
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加审计触发器
CREATE TRIGGER trg_audit_reviews
    AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
    FOR EACH ROW EXECUTE FUNCTION review_system.log_data_changes();

-- 增强SQL注入检查函数
CREATE OR REPLACE FUNCTION review_system.check_sql_injection(
    p_text TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- 更严格的SQL注入检查模式
    RETURN p_text !~ '(?i)(''|;|--|\b(union|select|insert|update|delete|drop|alter|exec|execute|sp_|xp_|syscolumns|information_schema)\b|\\/\\*|\\*\\/|@@|char|nchar|varchar|nvarchar|cast|convert|declare|waitfor|delay)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 添加参数化查询包装函数
CREATE OR REPLACE FUNCTION review_system.safe_query(
    p_query TEXT,
    p_params TEXT[]
) RETURNS SETOF record AS $$
DECLARE
    v_safe_query TEXT;
BEGIN
    -- 检查查询和参数
    IF NOT review_system.check_sql_injection(p_query) THEN
        RAISE EXCEPTION '检测到不安全的查询';
    END IF;
    
    -- 使用参数化查询
    v_safe_query := p_query;
    RETURN QUERY EXECUTE v_safe_query USING p_params;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加内容验证触发器
CREATE OR REPLACE FUNCTION review_system.validate_content()
RETURNS TRIGGER AS $$
BEGIN
    -- 检查评论内容是否包含SQL注入
    IF NOT review_system.check_sql_injection(NEW.content) THEN
        RAISE EXCEPTION '检测到潜在的SQL注入攻击';
    END IF;
    
    -- 检查评论长度
    IF length(NEW.content) > 10000 THEN
        RAISE EXCEPTION '评论内容超过最大长度限制';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_review_content
    BEFORE INSERT OR UPDATE ON review_system.reviews_partitioned
    FOR EACH ROW EXECUTE FUNCTION review_system.validate_content();

-- 创建会话控制表
CREATE TABLE review_system.user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建会话清理函数
CREATE OR REPLACE FUNCTION review_system.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE review_system.user_sessions
    SET is_active = false
    WHERE expires_at < CURRENT_TIMESTAMP
    AND is_active = true;
    
    DELETE FROM review_system.user_sessions
    WHERE expires_at < (CURRENT_TIMESTAMP - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- 添加密码策略检查函数
CREATE OR REPLACE FUNCTION review_system.check_password_strength(
    p_password TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- 检查密码长度
    IF length(p_password) < 8 THEN
        RETURN false;
    END IF;
    
    -- 检查是否包含数字
    IF p_password !~ '[0-9]' THEN
        RETURN false;
    END IF;
    
    -- 检查是否包含小写字母
    IF p_password !~ '[a-z]' THEN
        RETURN false;
    END IF;
    
    -- 检查是否包含大写字母
    IF p_password !~ '[A-Z]' THEN
        RETURN false;
    END IF;
    
    -- 检查是否包含特殊字符
    IF p_password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 创建IP限制表
CREATE TABLE IF NOT EXISTS review_system.ip_blacklist (
    ip_id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_by TEXT DEFAULT CURRENT_USER,
    UNIQUE(ip_address)
);

-- 创建IP检查函数
CREATE OR REPLACE FUNCTION review_system.check_ip_blacklist()
RETURNS TRIGGER AS $$
DECLARE
    v_client_ip INET;
BEGIN
    v_client_ip := inet_client_addr();
    
    IF EXISTS (
        SELECT 1 
        FROM review_system.ip_blacklist 
        WHERE ip_address = v_client_ip
        AND (blocked_until IS NULL OR blocked_until > CURRENT_TIMESTAMP)
    ) THEN
        RAISE EXCEPTION '此IP地址已被封禁';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加IP检查触发器
CREATE TRIGGER trg_check_ip_blacklist
    BEFORE INSERT OR UPDATE ON review_system.reviews_partitioned
    FOR EACH ROW EXECUTE FUNCTION review_system.check_ip_blacklist();

-- 创建登录失败记录表
CREATE TABLE IF NOT EXISTS review_system.login_attempts (
    attempt_id SERIAL PRIMARY KEY,
    user_id BIGINT,
    ip_address INET,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_successful BOOLEAN DEFAULT false
);

-- 创建检查登录失败次数的函数
CREATE OR REPLACE FUNCTION review_system.check_login_attempts(
    p_user_id BIGINT,
    p_ip_address INET
) RETURNS BOOLEAN AS $$
DECLARE
    v_failed_attempts INTEGER;
BEGIN
    -- 检查最近30分钟内的失败次数
    SELECT COUNT(*) 
    INTO v_failed_attempts
    FROM review_system.login_attempts
    WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND is_successful = false
    AND attempt_time > CURRENT_TIMESTAMP - INTERVAL '30 minutes';
    
    -- 如果失败次数超过5次，返回false
    RETURN v_failed_attempts < 5;
END;
$$ LANGUAGE plpgsql;

-- 创建敏感操作记录表
CREATE TABLE IF NOT EXISTS review_system.sensitive_operations (
    operation_id SERIAL PRIMARY KEY,
    user_id BIGINT,
    operation_type VARCHAR(50),
    operation_details JSONB,
    ip_address INET,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_operation_type CHECK (
        operation_type IN (
            'PASSWORD_CHANGE',
            'ROLE_CHANGE',
            'PERMISSION_CHANGE',
            'CONTENT_DELETE',
            'ACCOUNT_LOCK'
        )
    )
);

-- 创建记录敏感操作的函数
CREATE OR REPLACE FUNCTION review_system.log_sensitive_operation(
    p_user_id BIGINT,
    p_operation_type VARCHAR(50),
    p_operation_details JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO review_system.sensitive_operations (
        user_id,
        operation_type,
        operation_details,
        ip_address
    ) VALUES (
        p_user_id,
        p_operation_type,
        p_operation_details,
        inet_client_addr()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加密码策略
CREATE TABLE review_system.password_policies (
    policy_id SERIAL PRIMARY KEY,
    min_length INTEGER DEFAULT 8,
    require_uppercase BOOLEAN DEFAULT true,
    require_lowercase BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    require_special_chars BOOLEAN DEFAULT true,
    password_history_count INTEGER DEFAULT 5,
    max_age_days INTEGER DEFAULT 90
);

-- 添加API访问控制
CREATE TABLE review_system.api_access_control (
    access_id SERIAL PRIMARY KEY,
    api_key TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    allowed_ips INET[],
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 重新配置只读角色权限
REVOKE ALL ON ALL TABLES IN SCHEMA review_system FROM review_readonly;
GRANT SELECT ON review_system.reviews_readonly TO review_readonly;

-- 创建更严格的只读视图
CREATE OR REPLACE VIEW review_system.reviews_readonly AS 
SELECT review_id, game_id, user_id, rating, content, playtime_hours,
       platform, language, created_at
FROM review_system.reviews_partitioned
WHERE review_status = 'active' 
AND deleted_at IS NULL;

-- 添加行级安全策略
ALTER TABLE review_system.reviews_partitioned ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_readonly_policy ON review_system.reviews_partitioned
    FOR SELECT
    TO review_readonly
    USING (review_status = 'active' AND deleted_at IS NULL);

-- 添加死锁预防机制
CREATE OR REPLACE FUNCTION review_system.acquire_row_lock(
    p_table_name TEXT,
    p_row_id BIGINT,
    p_lock_timeout INTEGER DEFAULT 3000  -- 3秒超时
) RETURNS BOOLEAN AS $$
BEGIN
    -- 设置语句超时
    EXECUTE format('SET LOCAL statement_timeout = %s', p_lock_timeout);
    
    -- 尝试获取行级锁
    EXECUTE format(
        'SELECT 1 FROM %I WHERE review_id = $1 FOR UPDATE NOWAIT',
        p_table_name
    ) USING p_row_id;
    
    RETURN true;
EXCEPTION 
    WHEN lock_not_available THEN
        RETURN false;
    WHEN OTHERS THEN
        RAISE WARNING '获取锁失败: %', SQLERRM;
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 添加事务隔离级别控制
CREATE OR REPLACE FUNCTION review_system.set_transaction_level(
    p_isolation_level TEXT DEFAULT 'READ COMMITTED'
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('SET TRANSACTION ISOLATION LEVEL %I', p_isolation_level);
END;
$$ LANGUAGE plpgsql;
  