-- 触发器测试用例
-- 1. 测试汇总数据更新触发器
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, playtime_hours, 
    platform, language, is_recommended
) VALUES 
(2001, 1, 4.5, 'Trigger test review', 10, 'PC', 'en-US', true);

-- 验证汇总数据是否正确更新
SELECT * FROM review_system.review_summary_partitioned 
WHERE game_id = 2001;

-- 2. 测试统计数据更新触发器
UPDATE review_system.reviews_partitioned 
SET rating = 5.0 
WHERE game_id = 2001;

-- 验证统计数据是否正确更新
SELECT * FROM review_system.review_summary_partitioned 
WHERE game_id = 2001; 