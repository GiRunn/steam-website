@echo off
echo 正在执行review_system测试套件...

set PGPASSWORD=your_password
set PGUSER=your_username
set PGDATABASE=your_database
set PGHOST=localhost
set PGPORT=5432

psql -f run_all_tests.sql

echo 测试执行完成，请查看结果。
pause