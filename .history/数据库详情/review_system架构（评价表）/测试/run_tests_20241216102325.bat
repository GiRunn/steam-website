@echo off
chcp 65001
echo Running review system tests...

set PGPASSWORD=123qweasdzxc..a
set PGCLIENTENCODING=UTF8
set LANG=zh_CN.UTF-8

psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f 00_create_test_framework.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f 01_basic_operations.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f 02_partition_tests.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f 03_performance_tests.sql
psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f 04_trigger_tests.sql

REM 生成报告
psql -U postgres -d games -v ON_ERROR_STOP=1 -X -q -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 