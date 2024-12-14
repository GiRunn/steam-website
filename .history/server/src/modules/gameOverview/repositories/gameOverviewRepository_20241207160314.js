// server/src/modules/gameOverview/repositories/gameOverviewRepository.js
class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    async getGameOverview(gameId) {
        try {
            console.log('Repository: Starting query for gameId:', gameId);
            
            // 验证数据库连接
            if (!this.pool) {
                throw new Error('Database connection not initialized');
            }

            const query = `
                SELECT 
                    g.description,
                    g.rating,
                    rs.positive_rate,
                    rs.avg_playtime_hours,
                    rs.total_reviews
                FROM games g
                LEFT JOIN "review_system"."review_summary" rs 
                    ON g.game_id = rs.game_id
                WHERE g.game_id = $1 AND g.deleted_at IS NULL
            `;

            console.log('Repository: Executing query:', {
                query,
                params: [gameId]
            });

            const result = await this.pool.query(query, [gameId]);
            console.log('Repository: Query result:', result.rows);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error('Repository error details:', {
                error: error.message,
                stack: error.stack,
                gameId,
                code: error.code, // PostgreSQL error code
                position: error.position, // SQL position where error occurred
                detail: error.detail // Detailed error message
            });
            throw error;
        }
    }
}

module.exports = GameOverviewRepository;