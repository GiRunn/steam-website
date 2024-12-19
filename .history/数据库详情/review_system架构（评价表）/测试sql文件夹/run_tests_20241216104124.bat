@echo off
chcp 65001
echo 开始执行测试...

set PGPASSWORD=123qweasdzxc..a
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=games

echo 执行测试脚本...

:: 使用完整路径并添加编码参数
psql -U postgres -d games --set ON_ERROR_STOP=on --set AUTOCOMMIT=off -v ON_ERROR_STOP=1 --echo-all -f "%~dp0\00_测试框架.sql"
psql -U postgres -d games --set ON_ERROR_STOP=on --set AUTOCOMMIT=off -v ON_ERROR_STOP=1 --echo-all -f "%~dp0\01_基础数据测试.sql"
psql -U postgres -d games --set ON_ERROR_STOP=on --set AUTOCOMMIT=off -v ON_ERROR_STOP=1 --echo-all -f "%~dp0\02_分区测试.sql"
psql -U postgres -d games --set ON_ERROR_STOP=on --set AUTOCOMMIT=off -v ON_ERROR_STOP=1 --echo-all -f "%~dp0\03_触发器测试.sql"
psql -U postgres -d games --set ON_ERROR_STOP=on --set AUTOCOMMIT=off -v ON_ERROR_STOP=1 --echo-all -f "%~dp0\04_性能测试.sql"

echo 测试执行完成。
pause 