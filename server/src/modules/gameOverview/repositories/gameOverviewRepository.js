// src/modules/gameOverview/repositories/gameOverviewRepository.js
class GameOverviewRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        
        this.pool = pool;
        this.redis = redis;
        this.cacheKeyPrefix = 'game:overview:';
        this.cacheDuration = 3600; // 1 hour
    }

    async getGameOverview(gameId) {
        try {
            // 尝试从缓存获取
            const cachedData = await this.redis.get(`${this.cacheKeyPrefix}${gameId}`);
            if (cachedData) {
                return JSON.parse(cachedData);
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

            const result = await this.pool.query(query, [gameId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const data = result.rows[0];
            
            // 缓存结果
            await this.redis.setex(
                `${this.cacheKeyPrefix}${gameId}`,
                this.cacheDuration,
                JSON.stringify(data)
            );

            return data;
        } catch (error) {
            console.error('Repository error:', {
                error: error.message,
                stack: error.stack,
                gameId,
                code: error.code
            });
            throw error;
        }
    }
}

module.exports = GameOverviewRepository;