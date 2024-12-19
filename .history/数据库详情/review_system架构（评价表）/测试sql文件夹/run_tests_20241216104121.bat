@echo off
echo 开始执行测试...

set PGPASSWORD=123qweasdzxc..a
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=games

echo 执行测试脚本...

psql -c "\i 00_测试框架.sql"
psql -c "\i 01_基础数据测试.sql"
psql -c "\i 02_分区测试.sql"
psql -c "\i 03_触发器测试.sql"
psql -c "\i 04_性能测试.sql"

echo 测试执行完成。
pause 