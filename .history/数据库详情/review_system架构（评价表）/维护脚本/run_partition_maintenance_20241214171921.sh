#!/bin/bash

# 配置文件路径
CONFIG_FILE="/path/to/db_config.conf"

# 如果配置文件存在，则读取配置
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    # 默认数据库连接信息
    DB_USER="your_user"
    DB_NAME="your_database"
    DB_HOST="localhost"
    DB_PORT="5432"
fi

# 日志文件
LOG_FILE="/var/log/partition_maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 创建日志函数
log() {
    echo "$DATE - $1" >> "$LOG_FILE"
    echo "$DATE - $1"
}

# 检查PSQL是否可用
if ! command -v psql &> /dev/null; then
    log "ERROR: psql command not found"
    exit 1
fi

# 执行维护任务
log "Starting partition maintenance..."
RESULT=$(psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT review_system.run_maintenance_job();" 2>&1)

# 检查执行结果
if [ $? -eq 0 ]; then
    log "Partition maintenance completed successfully"
    log "Result: $RESULT"
else
    log "ERROR: Partition maintenance failed"
    log "Error message: $RESULT"
    exit 1
fi 