-- 创建汇总数据更新触发器
CREATE TRIGGER trg_update_review_summary
    AFTER INSERT OR UPDATE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.update_review_summary();

-- 创建统计数据更新触发器
CREATE TRIGGER trg_update_review_stats
    BEFORE INSERT OR UPDATE ON review_system.review_summary_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.update_review_stats(); 