@echo off
set PGUSER=your_username
set PGPASSWORD=your_password
set PGDATABASE=your_database
set PGHOST=localhost
set PGPORT=5432

echo Running review system tests...

psql -f "E:\Steam\steam-website\数据库详情\review_system架构（评价表）\测试\run_all_tests.sql"

pause 