-- 基础操作测试用例
-- 1. 插入评论测试
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, playtime_hours, 
    platform, language, is_recommended
) VALUES 
(1001, 1, 4.5, '很好玩的游戏!', 10, 'PC', 'zh-CN', true),
(1001, 2, 3.5, 'Good game but needs improvement', 5, 'PS5', 'en-US', true),
(1001, 3, 5.0, '素晴らしいゲーム!', 20, 'PC', 'ja-JP', true);

-- 2. 插入回复测试
INSERT INTO review_system.review_replies_partitioned (
    review_id, user_id, content, language
) VALUES 
(1, 4, '同意你的观点!', 'zh-CN'),
(1, 5, 'Thanks for sharing', 'en-US');

-- 3. 基础查询测试
SELECT * FROM review_system.reviews_partitioned WHERE game_id = 1001;
SELECT * FROM review_system.review_replies_partitioned WHERE review_id = 1;
SELECT * FROM review_system.review_summary_partitioned WHERE game_id = 1001; 