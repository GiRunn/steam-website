@echo off
chcp 65001
echo 正在运行游戏评价系统测试...

set PGPASSWORD=123qweasdzxc..a
set PGCLIENTENCODING=UTF8

cd /d "%~dp0"

REM 执行测试
psql -U postgres -d games -f 00_create_test_framework.sql
psql -U postgres -d games -f 01_basic_operations.sql
psql -U postgres -d games -f 02_partition_tests.sql
psql -U postgres -d games -f 03_performance_tests.sql
psql -U postgres -d games -f 04_trigger_tests.sql
psql -U postgres -d games -f run_all_tests.sql

echo 测试完成。正在打开测试报告...

if exist test_report.html (
    start test_report.html
) else (
    echo 错误：未能生成测试报告文件。
)

pause 