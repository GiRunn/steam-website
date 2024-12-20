-- 创建 review_system schema（如果不存在）
CREATE SCHEMA IF NOT EXISTS review_system;

-- 确保用户有正确的权限
GRANT USAGE ON SCHEMA review_system TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA review_system TO postgres;

-- 创建分区表（如果需要）
CREATE TABLE IF NOT EXISTS review_system.reviews_partitioned (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建初始分区
CREATE TABLE IF NOT EXISTS review_system.reviews_y2024m01 PARTITION OF review_system.reviews_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 添加必要的索引
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON review_system.reviews_partitioned(created_at); 