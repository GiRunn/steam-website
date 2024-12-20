import BaseService from '../base/BaseService';

export default class ReviewMetricsService extends BaseService {
    async getReviewSystemMetrics() {
        return this.withClient(async (client) => {
            const result = await client.query(`
                SELECT json_build_object(
                    'total_reviews', COALESCE((
                        SELECT count(*) 
                        FROM review_system.reviews_partitioned 
                        WHERE deleted_at IS NULL
                    ), 0),
                    'avg_rating', COALESCE((
                        SELECT ROUND(AVG(rating)::numeric, 2)
                        FROM review_system.reviews_partitioned
                        WHERE deleted_at IS NULL
                    ), 0),
                    'reviews_last_hour', COALESCE((
                        SELECT count(*) 
                        FROM review_system.reviews_partitioned
                        WHERE created_at >= NOW() - INTERVAL '1 hour'
                        AND deleted_at IS NULL
                    ), 0),
                    'unique_games_reviewed', COALESCE((
                        SELECT count(DISTINCT game_id)
                        FROM review_system.reviews_partitioned
                        WHERE deleted_at IS NULL
                    ), 0),
                    'total_replies', COALESCE((
                        SELECT count(*)
                        FROM review_system.review_replies_partitioned
                        WHERE deleted_at IS NULL
                    ), 0),
                    'avg_review_length', COALESCE((
                        SELECT ROUND(AVG(LENGTH(content))::numeric, 2)
                        FROM review_system.reviews_partitioned
                        WHERE deleted_at IS NULL
                    ), 0)
                ) as metrics
            `);

            return result.rows[0].metrics;
        }).catch(error => this.handleError(error, {
            total_reviews: 0,
            avg_rating: 0,
            reviews_last_hour: 0,
            unique_games_reviewed: 0,
            total_replies: 0,
            avg_review_length: 0
        }));
    }
} 