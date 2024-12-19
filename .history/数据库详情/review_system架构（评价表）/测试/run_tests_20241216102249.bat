@echo off
chcp 65001
echo Running review system tests...

set PGPASSWORD=123qweasdzxc..a
set PGCLIENTENCODING=UTF8

psql -U postgres -d games -c "\i 00_create_test_framework.sql"
psql -U postgres -d games -c "\i 01_basic_operations.sql"
psql -U postgres -d games -c "\i 02_partition_tests.sql"
psql -U postgres -d games -c "\i 03_performance_tests.sql"
psql -U postgres -d games -c "\i 04_trigger_tests.sql"
psql -U postgres -d games -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 