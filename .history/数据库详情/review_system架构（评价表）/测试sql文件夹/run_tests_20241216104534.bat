@echo off
REM 设置控制台代码页为UTF-8
chcp 65001
REM 设置控制台字体为Consolas以更好地显示中文
REG ADD HKEY_CURRENT_USER\Console /v FaceName /t REG_SZ /d Consolas /f

echo [INFO] 开始执行测试...

REM 检查psql是否存在
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 未找到psql命令。请确保PostgreSQL已安装且添加到PATH环境变量中。
    echo 通常需要添加类似路径：C:\Program Files\PostgreSQL\{版本号}\bin
    pause
    exit /b 1
)

REM 设置数据库连接信息
set PGPASSWORD=123qweasdzxc..a
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=games
set PGCLIENTENCODING=UTF8
set PGOPTIONS='-c client_encoding=UTF8'

echo [INFO] 执行测试脚本...

REM 测试数据库连接
psql -U postgres -d games -c "\conninfo" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 无法连接到数据库。请检查连接信息是否正确：
    echo 主机: %PGHOST%
    echo 端口: %PGPORT%
    echo 数据库: %PGDATABASE%
    echo 用户名: %PGUSER%
    pause
    exit /b 1
)

REM 使用完整路径并添加编码参数
echo [INFO] 执行测试框架...
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8'; SET server_encoding TO 'UTF8';" -f "%~dp0\00_测试框架.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 测试框架执行失败！
    pause
    exit /b 1
)

echo [INFO] 执行基础数据测试...
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\01_基础数据测试.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 基础数据测试执行失败！
    pause
    exit /b 1
)

echo [INFO] 执行分区测试...
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\02_分区测试.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 分区测试执行失败！
    pause
    exit /b 1
)

echo [INFO] 执行触发器测试...
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\03_触发器测试.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 触发器测试执行失败！
    pause
    exit /b 1
)

echo [INFO] 执行性能测试...
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\04_性能测试.sql"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 性能测试执行失败！
    pause
    exit /b 1
)

echo [INFO] 生成测试报告...
psql -U postgres -d games -c "SELECT * FROM review_system.generate_test_report();"
psql -U postgres -d games -c "SELECT * FROM review_system.generate_detailed_test_report() WHERE 测试结果 = '失败';"

echo [SUCCESS] 测试执行完成。
echo.
echo 按任意键退出...
pause >nul
exit /b 0