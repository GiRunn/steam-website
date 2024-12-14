-- 1. 首先创建一个视图来统一访问接口
CREATE OR REPLACE VIEW review_system.reviews_unified_view AS
    SELECT * FROM review_system.reviews_partitioned
    UNION ALL
    SELECT * FROM review_system.reviews;

-- 2. 为原表创建 BEFORE INSERT 触发器
CREATE OR REPLACE FUNCTION review_system.review_redirect_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- 插入到分区表
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        playtime_hours,
        likes_count,
        review_status,
        is_recommended,
        platform,
        language,
        created_at,
        updated_at,
        deleted_at
    ) VALUES (
        NEW.game_id,
        NEW.user_id,
        NEW.rating,
        NEW.content,
        NEW.playtime_hours,
        NEW.likes_count,
        NEW.review_status,
        NEW.is_recommended,
        NEW.platform,
        NEW.language,
        COALESCE(NEW.created_at, CURRENT_TIMESTAMP),
        COALESCE(NEW.updated_at, CURRENT_TIMESTAMP),
        NEW.deleted_at
    );
    RETURN NULL;  -- 阻止原表插入
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER redirect_insert_to_partition
    BEFORE INSERT ON review_system.reviews
    FOR EACH ROW
    EXECUTE FUNCTION review_system.review_redirect_insert();

-- 3. 为视图创建 INSTEAD OF INSERT 触发器
CREATE OR REPLACE FUNCTION review_system.reviews_view_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO review_system.reviews_partitioned (
        game_id,
        user_id,
        rating,
        content,
        playtime_hours,
        likes_count,
        review_status,
        is_recommended,
        platform,
        language,
        created_at,
        updated_at,
        deleted_at
    ) VALUES (
        NEW.game_id,
        NEW.user_id,
        NEW.rating,
        NEW.content,
        NEW.playtime_hours,
        NEW.likes_count,
        NEW.review_status,
        NEW.is_recommended,
        NEW.platform,
        NEW.language,
        COALESCE(NEW.created_at, CURRENT_TIMESTAMP),
        COALESCE(NEW.updated_at, CURRENT_TIMESTAMP),
        NEW.deleted_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_to_partition_view
    INSTEAD OF INSERT ON review_system.reviews_unified_view
    FOR EACH ROW
    EXECUTE FUNCTION review_system.reviews_view_insert();

-- 4. 创建更新触发器
CREATE OR REPLACE FUNCTION review_system.review_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新分区表中的数据
    UPDATE review_system.reviews_partitioned
    SET 
        rating = NEW.rating,
        content = NEW.content,
        playtime_hours = NEW.playtime_hours,
        likes_count = NEW.likes_count,
        review_status = NEW.review_status,
        is_recommended = NEW.is_recommended,
        platform = NEW.platform,
        language = NEW.language,
        updated_at = CURRENT_TIMESTAMP,
        deleted_at = NEW.deleted_at
    WHERE review_id = OLD.review_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_both_tables
    BEFORE UPDATE ON review_system.reviews
    FOR EACH ROW
    EXECUTE FUNCTION review_system.review_update_trigger();

-- 5. 创建删除触发器
CREATE OR REPLACE FUNCTION review_system.review_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- 在分区表中标记删除
    UPDATE review_system.reviews_partitioned
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE review_id = OLD.review_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_both_tables
    BEFORE DELETE ON review_system.reviews
    FOR EACH ROW
    EXECUTE FUNCTION review_system.review_delete_trigger();

-- 6. 创建审计日志触发器
CREATE TABLE IF NOT EXISTS review_system.review_audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(10),
    review_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    changed_by INTEGER,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION review_system.review_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO review_system.review_audit_log (operation, review_id, new_data, changed_by)
        VALUES ('INSERT', NEW.review_id, row_to_json(NEW)::jsonb, NEW.user_id);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO review_system.review_audit_log (operation, review_id, old_data, new_data, changed_by)
        VALUES ('UPDATE', NEW.review_id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NEW.user_id);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO review_system.review_audit_log (operation, review_id, old_data, changed_by)
        VALUES ('DELETE', OLD.review_id, row_to_json(OLD)::jsonb, OLD.user_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_reviews_changes
    AFTER INSERT OR UPDATE OR DELETE ON review_system.reviews_partitioned
    FOR EACH ROW
    EXECUTE FUNCTION review_system.review_audit_trigger(); 