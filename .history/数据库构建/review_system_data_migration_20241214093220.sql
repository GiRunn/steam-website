-- 1. 创建数据迁移存储过程
CREATE OR REPLACE PROCEDURE review_system.migrate_existing_data()
LANGUAGE plpgsql
AS $$
BEGIN
    -- 迁移评论数据
    INSERT INTO review_system.reviews_partitioned
    SELECT * FROM review_system.reviews;
    
    -- 迁移回复数据
    INSERT INTO review_system.review_replies_partitioned
    SELECT * FROM review_system.review_replies;
    
    -- 迁移汇总数据
    INSERT INTO review_system.review_summary_partitioned
    SELECT * FROM review_system.review_summary;
    
    -- 记录迁移日志
    INSERT INTO system_logs (operation, description, status)
    VALUES ('data_migration', 'Migrated review system data to partitioned tables', 'completed');
END;
$$; 