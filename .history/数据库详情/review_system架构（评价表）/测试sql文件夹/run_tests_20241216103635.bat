@echo off
echo 开始执行测试...

set PGPASSWORD=123qweasdzxc..a
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=games

echo 执行测试脚本...

psql -f "执行所有测试.sql"

echo 测试执行完成。
pause 