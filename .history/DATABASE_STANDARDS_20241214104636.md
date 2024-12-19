## 11. 分区表规范

### 11.1 分区表命名规范
```sql
-- 主分区表命名
表名_partitioned

-- 分区命名
表名_y年份m月份  -- 例：reviews_y2024m12

-- 分区索引命名
idx_分区表名_字段名
```

### 11.2 分区表结构规范
```sql
-- 分区表模板
CREATE TABLE schema_name.table_name_partitioned (
    -- 必须包含分区键
    created_at TIMESTAMP WITH TIME ZONE,
    -- 其他字段
    ...
    -- 主键必须包含分区键
    CONSTRAINT table_name_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE schema_name.table_name_y2024m12 
PARTITION OF schema_name.table_name_partitioned
FOR VALUES FROM ('2024-12-01 00:00:00+08') 
TO ('2025-01-01 00:00:00+08');
```

### 11.3 分区表索引规范
```sql
-- 在主分区表上创建索引，会自动应用到所有分区
CREATE INDEX idx_table_name_field 
ON schema_name.table_name_partitioned (field);

-- 必须创建的索引
1. 包含分区键的联合索引
2. 常用查询条件的索引
3. 外键关联字段的索引
```

### 11.4 分区管理规范
```sql
-- 1. 创建新分区
CREATE TABLE review_system.reviews_y2025m01 
PARTITION OF review_system.reviews_partitioned
FOR VALUES FROM ('2025-01-01 00:00:00+08') 
TO ('2025-02-01 00:00:00+08');

-- 2. 删除旧分区
DROP TABLE review_system.reviews_y2023m12;

-- 3. 分区维护
-- 定期检查分区使用情况
SELECT 
    child.relname as partition_name,
    pg_size_pretty(pg_relation_size(child.oid)) as size,
    pg_stat_get_live_tuples(child.oid) as row_count
FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'reviews_partitioned';
```

### 11.5 分区表使用规范
```sql
-- 1. 查询时直接使用主分区表
SELECT * FROM reviews_partitioned 
WHERE created_at >= '2024-12-01'
AND created_at < '2025-01-01';

-- 2. 插入数据时使用主分区表
INSERT INTO reviews_partitioned 
(game_id, user_id, rating, created_at) 
VALUES (1001, 1, 4.5, '2024-12-07 09:53:44+08');

-- 3. 更新数据时使用主分区表
UPDATE reviews_partitioned 
SET rating = 5.0
WHERE review_id = 1 AND created_at >= '2024-12-01';
```

### 11.6 分区表性能优化
```sql
-- 1. 查询优化
-- 使用分区键进行条件过滤
SELECT * FROM reviews_partitioned 
WHERE created_at >= '2024-12-01'
AND game_id = 1001;

-- 2. 批量操作优化
-- 使用COPY命令批量导入数据
COPY reviews_partitioned 
FROM 'data.csv' WITH (FORMAT csv, HEADER true);

-- 3. 维护优化
-- 定期清理旧分区
-- 定期更新统计信息
ANALYZE reviews_partitioned;
```

### 11.7 分区表备份恢复
```sql
-- 1. 备份特定分区
pg_dump -t reviews_y2024m12 -f backup_202412.sql

-- 2. 恢复特定分区
psql -f backup_202412.sql

-- 3. 备份整个分区表
pg_dump -t reviews_partitioned -f backup_all.sql
```

### 11.8 分区表监控
```sql
-- 1. 分区使用情况监控
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(
        schemaname || '.' || tablename
    )) as total_size
FROM pg_tables
WHERE tablename LIKE 'reviews_y%'
ORDER BY tablename;

-- 2. 分区性能监控
SELECT 
    relname as partition_name,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
WHERE relname LIKE 'reviews_y%';