-- 创建分区管理触发器
CREATE TRIGGER trg_create_reviews_partition
    BEFORE INSERT ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.create_partition_if_not_exists();

CREATE TRIGGER trg_create_replies_partition
    BEFORE INSERT ON review_system.review_replies_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.create_partition_if_not_exists();

CREATE TRIGGER trg_create_summary_partition
    BEFORE INSERT ON review_system.review_summary_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.create_partition_if_not_exists();

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

-- 添加插入前检查分区的触发器
CREATE TRIGGER trg_reviews_check_partition
    BEFORE INSERT ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.before_insert_check_partition();

CREATE TRIGGER trg_replies_check_partition
    BEFORE INSERT ON review_system.review_replies_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.before_insert_check_partition();

CREATE TRIGGER trg_summary_check_partition
    BEFORE INSERT ON review_system.review_summary_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.before_insert_check_partition(); 