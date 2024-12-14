-- 1. 创建临时表
CREATE TABLE review_system.reviews_temp (
    review_id BIGINT,
    game_id INTEGER,
    user_id INTEGER,
    rating DECIMAL(2,1),
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER,
    review_status VARCHAR(20),
    is_recommended BOOLEAN,
    platform VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_system.review_replies_temp (
    reply_id BIGINT,
    review_id BIGINT,
    user_id INTEGER,
    parent_id BIGINT,
    content TEXT,
    likes_count INTEGER,
    reply_status VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_system.review_summary_temp (
    summary_id BIGINT,
    game_id INTEGER,
    total_reviews INTEGER,
    average_rating DECIMAL(4,2),
    total_playtime_hours BIGINT,
    total_likes INTEGER,
    total_replies INTEGER,
    replies_likes INTEGER,
    pc_count INTEGER,
    ps5_count INTEGER,
    xbox_count INTEGER,
    en_us_count INTEGER,
    en_gb_count INTEGER,
    zh_cn_count INTEGER,
    es_es_count INTEGER,
    ja_jp_count INTEGER,
    recommended_count INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE,
    positive_rate DECIMAL(5,2),
    avg_playtime_hours DECIMAL(10,2)
);

-- 2. 从CSV导入数据
COPY review_system.reviews_temp FROM 'E:/Steam/steam-website/数据库构建/review_system.reviews表.csv' 
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

COPY review_system.review_replies_temp FROM 'E:/Steam/steam-website/数据库构建/review_system.review_replies表.csv' 
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

COPY review_system.review_summary_temp FROM 'E:/Steam/steam-website/数据库构建/review_system.review_summary表.csv' 
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 3. 迁移数据到分区表
INSERT INTO review_system.reviews_partitioned
SELECT * FROM review_system.reviews_temp;

INSERT INTO review_system.review_replies_partitioned
SELECT * FROM review_system.review_replies_temp;

INSERT INTO review_system.review_summary_partitioned
SELECT * FROM review_system.review_summary_temp;

-- 4. 验证数据迁移
SELECT 
    'Original (reviews)' as source,
    COUNT(*) as count,
    MIN(created_at) as min_date,
    MAX(created_at) as max_date
FROM review_system.reviews_temp
UNION ALL
SELECT 
    'Partitioned (reviews)' as source,
    COUNT(*) as count,
    MIN(created_at) as min_date,
    MAX(created_at) as max_date
FROM review_system.reviews_partitioned;

-- 5. 检查分区数据分布
SELECT 
    child.relname AS partition_name,
    COUNT(*) as record_count
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    JOIN pg_namespace nmsp_parent ON parent.relnamespace = nmsp_parent.oid
    LEFT JOIN review_system.reviews_partitioned p ON true
WHERE parent.relname = 'reviews_partitioned'
GROUP BY child.relname
ORDER BY child.relname;

-- 6. 清理临时表（确认数据正确后执行）
-- DROP TABLE review_system.reviews_temp;
-- DROP TABLE review_system.review_replies_temp;
-- DROP TABLE review_system.review_summary_temp; 