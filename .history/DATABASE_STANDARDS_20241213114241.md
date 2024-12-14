# Steam Website 数据库开发规范

## 1. 数据库设计规范

### 1.1 命名规范

#### 表命名
- 使用小写字母
- 单词间使用下划线分隔
- 使用名词复数形式
- 示例：`game_categories`, `user_profiles`

#### 字段命名
- 使用小写字母
- 单词间使用下划线分隔
- 主键统一使用 `id`
- 外键格式：`表名单数_id`
- 创建时间：`created_at`
- 更新时间：`updated_at`
- 删除标记：`is_deleted`

### 1.2 字段类型规范

```sql
-- 主键
id BIGSERIAL PRIMARY KEY

-- 字符串
short_text VARCHAR(255)    -- 短文本
long_text TEXT            -- 长文本

-- 数值
price DECIMAL(10,2)       -- 金额
quantity INTEGER          -- 数量
status SMALLINT          -- 状态码

-- 时间
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

-- 布尔
is_active BOOLEAN DEFAULT true
```

## 2. 索引规范

### 2.1 索引命名
```sql
-- 主键索引
pk_表名

-- 唯一索引
uk_表名_字段名

-- 普通索引
idx_表名_字段名

-- 联合索引
idx_表名_字段1_字段2
```

### 2.2 索引使用规范
```sql
-- 必须建立索引的场景
1. 主键
2. 外键关联字段
3. 经常用于查询条件的字段
4. 经常用于排序的字段
5. 经常用于分组的字段

-- 索引示例
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
```

## 3. 触发器规范

### 3.1 触发器命名
```sql
-- 格式：trg_表名_动作_时机
trg_orders_update_timestamp_before_update
trg_games_check_price_before_insert
```

### 3.2 触发器模板
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_games_update_timestamp
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

## 4. 存储过程规范

### 4.1 存储过程命名
```sql
-- 格式：sp_动作_对象
sp_get_user_games
sp_update_order_status
```

### 4.2 存储过程模板
```sql
CREATE OR REPLACE PROCEDURE sp_get_user_games(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 参数验证
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;

    -- 业务逻辑
    RETURN QUERY
    SELECT g.*
    FROM games g
    JOIN user_games ug ON g.id = ug.game_id
    WHERE ug.user_id = p_user_id
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
```

## 5. 数据库关系规范

### 5.1 外键关系
```sql
-- 外键定义模板
ALTER TABLE child_table
ADD CONSTRAINT fk_child_parent
FOREIGN KEY (parent_id)
REFERENCES parent_table(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 示例
ALTER TABLE user_games
ADD CONSTRAINT fk_user_games_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```

### 5.2 关系类型规范
- 一对一关系：使用相同主键或唯一外键
- 一对多关系：在"多"的一方建立外键
- 多对多关系：使用中间表，并建立复合主键

## 6. 性能优化规范

### 6.1 查询优化
```sql
-- 推荐写法
SELECT g.id, g.title, c.name as category_name
FROM games g
LEFT JOIN categories c ON g.category_id = c.id
WHERE g.status = 1
LIMIT 20 OFFSET 0;

-- 避免使用
SELECT *
FROM games
WHERE title LIKE '%keyword%'
```

### 6.2 索引优化
```sql
-- 联合索引最左原则
CREATE INDEX idx_games_category_status_created
ON games(category_id, status, created_at);

-- 覆盖索引
CREATE INDEX idx_games_list
ON games(id, title, price, category_id)
INCLUDE (description);
```

## 7. 安全规范

### 7.1 权限控制
```sql
-- 创建应用角色
CREATE ROLE app_user LOGIN PASSWORD 'xxx';

-- 授权
GRANT SELECT, INSERT, UPDATE ON games TO app_user;
GRANT USAGE ON SEQUENCE games_id_seq TO app_user;
```

### 7.2 数据加密
```sql
-- 敏感数据加密
CREATE EXTENSION pgcrypto;

-- 加密示例
UPDATE users
SET password = crypt('user_password', gen_salt('bf'));
```

## 8. 备份规范

### 8.1 备份策略
```bash
# 每日全量备份
pg_dump -Fc dbname > backup_$(date +%Y%m%d).dump

# 定期归档WAL日志
archive_command = 'cp %p /archive/%f'
```

### 8.2 恢复测试
```bash
# 恢复测试流程
pg_restore -d dbname backup.dump
```

## 9. 监控规范

### 9.1 性能监控
```sql
-- 慢查询监控
SELECT pid, query, query_start, state
FROM pg_stat_activity
WHERE state != 'idle'
AND (now() - query_start) > interval '5 seconds';
```

### 9.2 空间监控
```sql
-- 表空间监控
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 10. 数据库表结构规范

### 10.1 核心表结构
```sql
-- 游戏表
CREATE TABLE games (
    game_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    publisher_id BIGINT REFERENCES publishers(publisher_id),
    developer_id BIGINT REFERENCES developers(developer_id),
    release_date TIMESTAMP WITH TIME ZONE,
    base_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    discount INTEGER,
    player_count VARCHAR(50),
    rating DECIMAL(3,2),
    status VARCHAR(50),
    language_support JSONB,
    system_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 用户表
CREATE TABLE user_system.users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,
    locale VARCHAR(10),
    timezone VARCHAR(50),
    account_status VARCHAR(20),
    role VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 评论表
CREATE TABLE review_system.reviews (
    review_id BIGSERIAL PRIMARY KEY,
    game_id BIGINT REFERENCES games(game_id),
    user_id BIGINT REFERENCES user_system.users(user_id),
    rating DECIMAL(3,2),
    content TEXT,
    playtime_hours INTEGER,
    likes_count INTEGER DEFAULT 0,
    review_status VARCHAR(20),
    is_recommended BOOLEAN,
    platform VARCHAR(20),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 10.2 Schema规范
```sql
-- 用户系统Schema
CREATE SCHEMA user_system;

-- 评论系统Schema
CREATE SCHEMA review_system;
```

## 11. 视图规范

### 11.1 统计视图
```sql
CREATE VIEW v_database_stats AS
SELECT 
    schemaname,
    relname,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(relid::regclass)) AS total_size
FROM pg_stat_user_tables;

CREATE VIEW game_overview_view AS
SELECT 
    g.game_id,
    g.description,
    g.rating,
    rs.positive_rate,
    rs.avg_playtime_hours,
    rs.total_reviews
FROM games g
LEFT JOIN review_system.review_summary rs ON g.game_id = rs.game_id
WHERE g.deleted_at IS NULL;
```

## 12. 分区表规范

### 12.1 按时间分区
```sql
-- 价格历史分区表
CREATE TABLE price_history (
    history_id BIGSERIAL,
    game_id BIGINT,
    price DECIMAL(10,2),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (start_time);

-- 创建分区
CREATE TABLE price_history_2024_q1 PARTITION OF price_history
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

## 13. 安全规范

### 13.1 角色权限
```sql
-- 创建应用角色
CREATE ROLE app_readonly LOGIN PASSWORD 'xxx';
CREATE ROLE app_readwrite LOGIN PASSWORD 'xxx';

-- 授权
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
```

### 13.2 行级安全性
```sql
-- 启用行级安全性
ALTER TABLE user_system.users ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY user_isolation_policy ON user_system.users
    USING (user_id = current_user_id());
```

## 14. 审计日志规范

### 14.1 审计表结构
```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(20),
    old_data JSONB,
    new_data JSONB,
    user_id BIGINT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 14.2 审计触发器
```sql
CREATE TRIGGER audit_games_changes
    AFTER INSERT OR UPDATE OR DELETE ON games
    FOR EACH ROW EXECUTE FUNCTION log_changes();