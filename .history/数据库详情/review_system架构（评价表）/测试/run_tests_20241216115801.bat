@echo off
echo 正在执行review_system测试套件...

REM 设置数据库连接参数
set PGPASSWORD=your_password
set PGUSER=your_username
set PGDATABASE=your_database
set PGHOST=localhost
set PGPORT=5432

REM 设置工作目录
cd /d %~dp0

REM 执行测试
echo 开始执行测试...
psql -v ON_ERROR_STOP=1 -f run_all_tests.sql

REM 检查执行结果
if %ERRORLEVEL% == 0 (
    echo 测试执行完成。
) else (
    echo 测试执行失败，错误代码：%ERRORLEVEL%
)

echo 请查看上方的测试报告了解详细结果。
pause