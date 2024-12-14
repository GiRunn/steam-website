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