@echo off
REM 设置代码页为GBK
chcp 936

REM 设置PostgreSQL环境变量
set PGCLIENTENCODING=GBK
set PGPASSWORD=123qweasdzxc..a

cd /d "%~dp0"

echo 正在运行测试...

REM 删除旧的报告文件
if exist test_report.html del /f /q test_report.html

REM 执行测试
psql -U postgres -d games -f setup_test_env.sql
psql -U postgres -d games -f 00_create_test_framework.sql
psql -U postgres -d games -f 01_basic_operations.sql
psql -U postgres -d games -f 02_partition_tests.sql
psql -U postgres -d games -f 03_performance_tests.sql
psql -U postgres -d games -f 04_trigger_tests.sql
psql -U postgres -d games -f run_all_tests.sql

echo 测试完成。

pause