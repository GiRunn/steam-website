-- 创建缓存预热函数
CREATE OR REPLACE FUNCTION review_system.cache_warmup()
RETURNS void AS $$
BEGIN
    -- 预热评论表最近数据
    EXECUTE 'SELECT count(*) FROM review_system.reviews_partitioned 
             WHERE created_at >= CURRENT_DATE - interval ''30 days''';
             
    -- 预热热门游戏的评论数据
    EXECUTE 'SELECT * FROM review_system.review_summary_partitioned 
             ORDER BY total_reviews DESC LIMIT 100';
             
    -- 预热最近的回复数据
    EXECUTE 'SELECT count(*) FROM review_system.review_replies_partitioned 
             WHERE created_at >= CURRENT_DATE - interval ''7 days''';
END;
$$ LANGUAGE plpgsql;

-- 创建定期缓存清理函数
CREATE OR REPLACE FUNCTION review_system.cache_maintenance()
RETURNS void AS $$
BEGIN
    -- 清理过期的缓存数据
    VACUUM ANALYZE review_system.reviews_partitioned;
    VACUUM ANALYZE review_system.review_replies_partitioned;
    VACUUM ANALYZE review_system.review_summary_partitioned;
    
    -- 更新统计信息
    ANALYZE review_system.reviews_partitioned;
    ANALYZE review_system.review_replies_partitioned;
    ANALYZE review_system.review_summary_partitioned;
END;
$$ LANGUAGE plpgsql;