/******************************************
 * 多语言评论功能测试
 * 测试目标：验证系统对多语言评论的支持
 ******************************************/

-- 测试准备
--------------------------
-- 清理测试数据
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;

-- 1. 多语言评论创建测试
--------------------------

-- 1.1 测试各种语言的评论创建
INSERT INTO review_system.reviews_partitioned (
    game_id, user_id, rating, content, playtime_hours, 
    is_recommended, platform, language
) VALUES 
-- 简体中文评论
(9001, 901, 4.5, '游戏非常好玩，画面精美，剧情丰富。支持中文配音和界面！', 
 100, true, 'PC', 'zh-CN'),

-- 繁体中文评论
(9001, 902, 4.0, '遊戲很有趣，但是繁體中文翻譯還需要改進。', 
 50, true, 'PS5', 'zh-TW'),

-- 英语评论 (美国)
(9001, 903, 4.8, 'Amazing game! Great graphics and storyline. Highly recommended!', 
 80, true, 'PC', 'en-US'),

-- 英语评论 (英国)
(9001, 904, 4.2, 'Brilliant game! Though the localisation could use some work.', 
 60, true, 'XBOX', 'en-GB'),

-- 日语评论
(9001, 905, 4.6, 'すばらしいゲームです！グラフィックも操作性も最高です。', 
 120, true, 'PS5', 'ja-JP'),

-- 韩语评论
(9001, 906, 4.3, '정말 재미있는 게임입니다. 한국어 번역이 잘 되어 있습니다.', 
 90, true, 'PC', 'ko-KR'),

-- 西班牙语评论
(9001, 907, 4.1, '¡Excelente juego! La traducción al español es muy buena.', 
 70, true, 'PS5', 'es-ES'),

-- 俄语评论
(9001, 908, 4.4, 'Отличная игра! Русский перевод на высоком уровне.', 
 85, true, 'PC', 'ru-RU');

/* 预期结果：
- 所有语言的评论都应成功插入
- 特殊字符应正确存储
*/

-- 2. 多语言查询测试
--------------------------

-- 2.1 按语言分组查询评论
SELECT 
    language,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 2) as avg_rating,
    ROUND(AVG(playtime_hours), 2) as avg_playtime
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL
GROUP BY language
ORDER BY review_count DESC;

-- 2.2 测试特定语言的评论检索
SELECT 
    review_id,
    content,
    rating,
    language,
    created_at
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND language = 'zh-CN'
    AND deleted_at IS NULL;

-- 3. 字符集和排序测试
--------------------------

-- 3.1 测试不同字符集的排序
SELECT 
    language,
    content
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL
ORDER BY 
    CASE 
        WHEN language LIKE 'zh-%' THEN 1
        WHEN language LIKE 'en-%' THEN 2
        ELSE 3
    END,
    content COLLATE "C";

-- 3.2 测试全文搜索 此处测试失败
-- 注：需要根据不同语言使用适当的全文搜索配置
SELECT 
    review_id,
    language,
    content,
    ts_rank(
        to_tsvector(CASE 
            WHEN language LIKE 'zh-%' THEN 'chinese'
            WHEN language LIKE 'ja-%' THEN 'japanese'
            ELSE 'english'
        END::regconfig, content),
        to_tsquery('english', 'game')
    ) as rank
FROM review_system.reviews_partitioned
WHERE game_id = 9001
    AND deleted_at IS NULL
ORDER BY rank DESC;


--错误： 文本搜寻配置 "chinese" 不存在 

--错误:  文本搜寻配置 "chinese" 不存在
--SQL 状态: 42704

-----------------------------------------------------------------

-- 4. 语言统计测试
--------------------------

-- 4.1 验证语言分布统计
SELECT 
    game_id,
    en_us_count,
    en_gb_count,
    zh_cn_count,
    zh_tw_count,
    ja_jp_count,
    ko_kr_count,
    es_es_count,
    ru_ru_count
FROM review_system.review_summary_partitioned
WHERE game_id = 9001;

--错误： 字段 "zh_tw_count" 不存在
--LINE 7:     zh_tw_count,
--            ^
--HINT:  也许您想要引用列"review_summary_partitioned.zh_cn_count"。 

--错误:  字段 "zh_tw_count" 不存在
--SQL 状态: 42703
--字符: 93

-------------------------------------------------------------------

/* 预期结果：
- 每种语言的评论数应正确统计
*/

-- 5. 多语言更新测试
--------------------------

-- 5.1 测试更新不同语言的评论
UPDATE review_system.reviews_partitioned
SET content = CASE 
    WHEN language = 'zh-CN' THEN '更新后的中文评论'
    WHEN language = 'en-US' THEN 'Updated English review'
    WHEN language = 'ja-JP' THEN '更新された日本語のレビュー'
    ELSE content
END
WHERE game_id = 9001
    AND language IN ('zh-CN', 'en-US', 'ja-JP')
RETURNING review_id, language, content;

-- 6. 语言验证测试
--------------------------

-- 6.1 测试语言代码验证
BEGIN;
    -- 测试无效的语言代码（应该失败）
    INSERT INTO review_system.reviews_partitioned (
        game_id, user_id, rating, content, platform, language
    ) VALUES 
    (9001, 909, 4.0, 'Invalid language test', 'PC', 'invalid-lang');
ROLLBACK;

-- 6.2 测试语言内容匹配
WITH language_check AS (
    SELECT 
        review_id,
        language,
        content,
        CASE 
            WHEN language = 'zh-CN' AND content ~ '[一-龥]' THEN true
            WHEN language = 'ja-JP' AND content ~ '[ぁ-んァ-ン]' THEN true
            WHEN language = 'ko-KR' AND content ~ '[가-힣]' THEN true
            WHEN language LIKE 'en-%' AND content ~ '^[A-Za-z0-9\s\p{P}]+$' THEN true
            ELSE false
        END as content_matches_language
    FROM review_system.reviews_partitioned
    WHERE game_id = 9001
)
SELECT 
    language,
    content_matches_language,
    COUNT(*) as review_count
FROM language_check
GROUP BY language, content_matches_language;





-----------------------------------------------------------------
错误： 无效的正则表达式: invalid escape \ sequence 

错误:  无效的正则表达式: invalid escape \ sequence
SQL 状态: 2201B

/* 预期结果：
- content_matches_language 应该全部为 true
*/

-- 7. 清理测试数据
--------------------------
-- 仅在需要时执行
/*
DELETE FROM review_system.reviews_partitioned 
WHERE game_id = 9001;
*/ 