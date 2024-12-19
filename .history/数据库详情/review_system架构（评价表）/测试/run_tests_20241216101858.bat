@echo off
echo Running review system tests...

set PGPASSWORD=123
psql -U postgres -d your_database -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 