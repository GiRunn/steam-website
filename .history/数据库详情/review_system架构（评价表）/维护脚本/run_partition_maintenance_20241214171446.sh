#!/bin/bash

# 数据库连接信息
DB_USER="your_user"
DB_NAME="your_database"
DB_HOST="localhost"
DB_PORT="5432"

# 执行维护任务
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -c "SELECT review_system.run_maintenance_job();"

# 检查执行结果
if [ $? -eq 0 ]; then
    echo "Partition maintenance completed successfully"
else
    echo "Partition maintenance failed"
    exit 1
fi 