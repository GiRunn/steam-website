CREATE OR REPLACE FUNCTION review_system.generate_detailed_test_report()
RETURNS TABLE (
    test_category TEXT,
    total_tests INTEGER,
    passed_tests INTEGER,
    failed_tests INTEGER,
    execution_time INTERVAL,
    error_details TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.test_category,
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE status = '通过') as passed_tests,
        COUNT(*) FILTER (WHERE status = '失败') as failed_tests,
        MAX(execution_time) as max_execution_time,
        array_agg(error_message) FILTER (WHERE error_message IS NOT NULL) as error_details
    FROM review_system.test_results r
    GROUP BY r.test_category;
END;
$$ LANGUAGE plpgsql; 