@echo off
REM 设置代码页为UTF-8
chcp 65001 > nul

REM 设置PostgreSQL环境变量
set PGCLIENTENCODING=GBK
set PGPASSWORD=123qweasdzxc..a

echo 正在运行游戏评价系统测试...

cd /d "%~dp0"

REM 删除旧的报告文件
if exist test_report.html del /f /q test_report.html

REM 执行测试
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f setup_test_env.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f 00_create_test_framework.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f 01_basic_operations.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f 02_partition_tests.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f 03_performance_tests.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f 04_trigger_tests.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -A -q -f run_all_tests.sql

REM 等待报告生成
timeout /t 2 /nobreak > nul

REM 检查报告是否生成成功
if exist test_report.html (
    echo 测试报告生成成功！
    start "" "test_report.html"
) else (
    echo 错误：未能生成测试报告文件。
    pause
    exit /b 1
)

echo 测试执行完成。
pause