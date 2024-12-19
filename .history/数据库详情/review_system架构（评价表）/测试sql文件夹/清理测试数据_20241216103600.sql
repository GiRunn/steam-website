-- 清理测试数据
DELETE FROM review_system.reviews_partitioned WHERE game_id = 99999;
DELETE FROM review_system.review_replies_partitioned WHERE review_id IN 
    (SELECT review_id FROM review_system.reviews_partitioned WHERE game_id = 99999);
DELETE FROM review_system.review_summary_partitioned WHERE game_id = 99999;

-- 清理测试结果
TRUNCATE TABLE review_system.test_results;