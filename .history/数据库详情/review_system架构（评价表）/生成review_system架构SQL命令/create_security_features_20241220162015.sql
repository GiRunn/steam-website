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
    INSERT INTO review_system.security_audit_log (
        event_type,
        user_id,
        ip_address,
        action_type,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        TG_OP,
        review_system.get_current_user_id(),
        inet_client_addr(),
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
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加审计触发器
CREATE TRIGGER trg_audit_reviews
    AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
    FOR EACH ROW EXECUTE FUNCTION review_system.log_data_changes();

-- 创建SQL注入检查函数
CREATE OR REPLACE FUNCTION review_system.check_sql_injection(
    p_text TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- 检查常见的SQL注入模式
    RETURN p_text !~ '(?i)(''|;|--|\b(union|select|insert|update|delete|drop|alter)\b)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
  