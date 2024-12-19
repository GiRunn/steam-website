@echo off
REM 设置控制台代码页为UTF-8
chcp 65001
REM 设置控制台字体为Consolas以更好地显示中文
REG ADD HKEY_CURRENT_USER\Console /v FaceName /t REG_SZ /d Consolas /f

echo [INFO] 开始执行测试...

set PGPASSWORD=123qweasdzxc..a
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=games
set PGCLIENTENCODING=UTF8

echo [INFO] 执行测试脚本...

REM 使用完整路径并添加编码参数
psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\00_测试框架.sql"
if %ERRORLEVEL% NEQ 0 goto error

psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\01_基础数据测试.sql"
if %ERRORLEVEL% NEQ 0 goto error

psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\02_分区测试.sql"
if %ERRORLEVEL% NEQ 0 goto error

psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\03_触发器测试.sql"
if %ERRORLEVEL% NEQ 0 goto error

psql -U postgres -d games -v ON_ERROR_STOP=1 --echo-all -X -A -w --pset footer=off --set AUTOCOMMIT=off -c "SET client_encoding TO 'UTF8';" -f "%~dp0\04_性能测试.sql"
if %ERRORLEVEL% NEQ 0 goto error

echo [SUCCESS] 测试执行完成。
goto end

:error
echo [ERROR] 测试执行失败！
exit /b 1

:end
pause