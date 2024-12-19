#!/bin/bash
# Linux/Mac shell脚本
echo "开始执行测试..."
sudo -u postgres psql -d your_database_name -f "数据库详情/review_system架构（评价表）/测试报告/execute_tests.sql"
read -p "按任意键继续..." 