@echo off
:: Windows批处理文件
echo 开始执行测试...
psql -U postgres -d your_database_name -f "数据库详情/review_system架构（评价表）/测试报告/execute_tests.sql"
pause 