@echo off
echo Running review system tests...

set PGPASSWORD=123qweasdzxc..a
psql -U postgres -d games -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 