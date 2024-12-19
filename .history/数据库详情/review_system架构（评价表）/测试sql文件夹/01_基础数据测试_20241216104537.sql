-- 连接数据库
\c games

-- 设置客户端编码和服务器编码
SET client_encoding = 'UTF8';
SET server_encoding = 'UTF8';

-- 基础数据测试
DO $$
BEGIN
    -- 清理测试数据
    DELETE FROM review_system.reviews_partitioned WHERE game_id = 99999;
    DELETE FROM review_system.review_replies_partitioned WHERE review_id IN 
        (SELECT review_id FROM review_system.reviews_partitioned WHERE game_id = 99999);
    
    -- 测试1：插入基本评论
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1001, 4.5, '这是一个测试评论', 10, 'PC', 'zh-CN', true);
    
    -- 验证评论插入
    PERFORM review_system.assert_equals(
        '测试评论基本插入',
        1,
        (SELECT COUNT(*) FROM review_system.reviews_partitioned WHERE game_id = 99999),
        '基础数据测试'
    );
    
    -- 测试2：验证评分范围约束
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, rating, content, playtime_hours, 
            platform, language, is_recommended
        ) VALUES 
        (99999, 1002, 5.5, '这是一个无效评分的评论', 10, 'PC', 'zh-CN', true);
        
        PERFORM review_system.assert_equals(
            '测试评分范围约束（不应该成功）',
            FALSE,
            TRUE,
            '数据约束测试'
        );
    EXCEPTION WHEN check_violation THEN
        PERFORM review_system.assert_equals(
            '测试评分范围约束（应该失败）',
            TRUE,
            TRUE,
            '数据约束测试'
        );
    END;
    
    -- 测试3：验证必填字段
    BEGIN
        INSERT INTO review_system.reviews_partitioned (
            game_id, user_id, content, playtime_hours
        ) VALUES 
        (99999, 1003, '缺少评分的评论', 10);
        
        PERFORM review_system.assert_equals(
            '测试必填字段约束（不应该成功）',
            FALSE,
            TRUE,
            '数据约束测试'
        );
    EXCEPTION WHEN not_null_violation THEN
        PERFORM review_system.assert_equals(
            '测试必填字段约束（应该失败）',
            TRUE,
            TRUE,
            '数据约束测试'
        );
    END;
    
    -- 测试4：验证汇总数据更新
    PERFORM review_system.assert_equals(
        '测试汇总数据生成',
        TRUE,
        EXISTS (
            SELECT 1 
            FROM review_system.review_summary_partitioned 
            WHERE game_id = 99999
        ),
        '汇总数据测试'
    );
    
    -- 测试5：验证评分计算
    PERFORM review_system.assert_equals(
        '测试平均评分计算',
        4.5::DECIMAL(3,2),
        (
            SELECT average_rating 
            FROM review_system.review_summary_partitioned 
            WHERE game_id = 99999 
            ORDER BY last_updated DESC 
            LIMIT 1
        ),
        '计算准确性测试'
    );
    
    -- 测试6：中文内容处理
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, playtime_hours, 
        platform, language, is_recommended
    ) VALUES 
    (99999, 1004, 4.0, '测试中文内容：这是一个包含特殊字符的评论！@#￥%……&*（）', 
     15, 'PS5', 'zh-CN', true);
     
    PERFORM review_system.assert_equals(
        '测试中文内容存储',
        1,
        (
            SELECT COUNT(*) 
            FROM review_system.reviews_partitioned 
            WHERE game_id = 99999 
            AND content LIKE '%特殊字符%'
        ),
        '字符编码测试'
    );
END;
$$; 