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

-- 创建策略
CREATE POLICY review_access_policy ON review_system.reviews_partitioned
    USING (
        (CURRENT_USER = 'postgres') OR  -- 管理员可以看所有
        (user_id = review_system.get_current_user_id()) OR  -- 用户可以看自己的
        (review_status = 'active' AND deleted_at IS NULL)  -- 所有人可以看活跃的
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

-- 创建专用角色
CREATE ROLE review_readonly;
CREATE ROLE review_writer;
CREATE ROLE review_admin;

-- 设置基础权限
GRANT USAGE ON SCHEMA review_system TO review_readonly, review_writer, review_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA review_system TO review_readonly;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA review_system TO review_writer;
GRANT ALL ON ALL TABLES IN SCHEMA review_system TO review_admin;

-- 设置默认权限
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