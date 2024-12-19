-- 评论表索引
CREATE INDEX idx_reviews_game_id ON review_system.reviews_partitioned(game_id);
CREATE INDEX idx_reviews_user_id ON review_system.reviews_partitioned(user_id);
CREATE INDEX idx_reviews_status ON review_system.reviews_partitioned(review_status);
CREATE INDEX idx_reviews_created_at ON review_system.reviews_partitioned(created_at);
CREATE INDEX idx_reviews_rating ON review_system.reviews_partitioned(rating);

-- 回复表索引
CREATE INDEX idx_replies_review_id ON review_system.review_replies_partitioned(review_id);
CREATE INDEX idx_replies_user_id ON review_system.review_replies_partitioned(user_id);
CREATE INDEX idx_replies_parent_id ON review_system.review_replies_partitioned(parent_id);
-- 评论主表索引
CREATE INDEX idx_reviews_game_id ON review_system.reviews_partitioned(game_id, created_at);
CREATE INDEX idx_reviews_user_id ON review_system.reviews_partitioned(user_id, created_at);
CREATE INDEX idx_reviews_rating ON review_system.reviews_partitioned(rating, created_at);

-- 评论回复表索引
CREATE INDEX idx_replies_review_id ON review_system.review_replies_partitioned(review_id, created_at);
CREATE INDEX idx_replies_user_id ON review_system.review_replies_partitioned(user_id, created_at);
CREATE INDEX idx_replies_parent_id ON review_system.review_replies_partitioned(parent_id, created_at); 