#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 数据库连接信息
DB_HOST=localhost
DB_PORT=5432
DB_NAME=games
DB_USER=postgres

# 创建或更新 .pgpass 文件
PGPASS_FILE="$HOME/.pgpass"
echo "$DB_HOST:$DB_PORT:$DB_NAME:$DB_USER:123qweasdzxc..a" > "$PGPASS_FILE"
chmod 0600 "$PGPASS_FILE"

# SQL文件目录（相对于脚本位置）
SCRIPT_DIR="$SCRIPT_PATH/生成review_system架构SQL命令"

# 日志文件（在脚本所在目录）
LOG_FILE="$SCRIPT_PATH/deploy_review_system.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 创建日志函数
log() {
    echo "$DATE - $1" | tee -a "$LOG_FILE"
}

# 执行SQL文件函数
execute_sql() {
    local file=$1
    log "Executing $file..."
    if psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$SCRIPT_DIR/$file" 2>&1; then
        log "Successfully executed $file"
        return 0
    else
        log "Failed to execute $file"
        return 1
    fi
}

# 开始部署
log "Starting review system deployment..."

# 按顺序执行SQL文件
files=(
    "drop_review_tables.sql"
    "create_review_tables.sql"
    "create_partition_maintenance.sql"
    "create_partition_functions.sql"
    "create_triggers.sql"
    "create_indexes.sql"
    "create_initial_partitions.sql"
    "test_review_system.sql"
)

# 执行所有文件
for file in "${files[@]}"; do
    if ! execute_sql "$file"; then
        log "Deployment failed at $file"
        exit 1
    fi
done

log "Review system deployment completed successfully"

# 验证部署
log "Verifying deployment..."
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" << EOF
    -- 检查架构是否存在
    SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'review_system'
    );

    -- 检查分区管理表是否存在并有记录
    SELECT COUNT(*) as partition_count 
    FROM review_system.partition_management;

    -- 检查是否成功创建了分区
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'review_system' 
    AND tablename LIKE '%y%m%'
    ORDER BY tablename;
EOF

# 清理 .pgpass 文件（可选，取决于您的安全需求）
# rm "$PGPASS_FILE"

log "Deployment verification completed" 