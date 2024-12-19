@echo off
chcp 65001
echo 正在运行游戏评价系统测试...

set PGPASSWORD=123qweasdzxc..a
set PGCLIENTENCODING=UTF8

REM 获取PostgreSQL数据目录
for /f "tokens=*" %%a in ('psql -U postgres -t -c "show data_directory;"') do set PG_DATA_DIR=%%a

REM 执行测试
psql -U postgres -d games -f 00_create_test_framework.sql
psql -U postgres -d games -f 01_basic_operations.sql
psql -U postgres -d games -f 02_partition_tests.sql
psql -U postgres -d games -f 03_performance_tests.sql
psql -U postgres -d games -f 04_trigger_tests.sql
psql -U postgres -d games -f run_all_tests.sql

REM 复制报告到当前目录
copy /Y "%PG_DATA_DIR%\test_report.html" test_report.html

echo 测试完成。正在打开测试报告...
start test_report.html

pause 