@echo off
echo Running review system tests...

set PGPASSWORD=your_password
psql -U postgres -d your_database -f run_all_tests.sql

echo Tests completed. Check test_report.html for results.
pause 