@echo off
chcp 65001
echo Running review system tests...

set PGPASSWORD=123qweasdzxc..a
set PGCLIENTENCODING=UTF8

cd /d "%~dp0"
psql -U postgres -d games -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 