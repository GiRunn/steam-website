// server/src/modules/gameOverview/repositories/gameOverviewRepository.js
class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    async getGameOverview(gameId) {
        // 首先尝试从Redis缓存获取
        const cacheKey = `game_overview:${gameId}`;
        const cachedData = await this.redis.get(cacheKey);
        
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // 如果缓存没有，则查询数据库
        const query = `
            SELECT 
                g.description,
                g.rating,
                rs.positive_rate,
                rs.avg_playtime_hours,
                rs.total_reviews
            FROM games g
            LEFT JOIN review_system.review_summary rs 
                ON g.game_id = rs.game_id
            WHERE g.game_id = $1 AND g.deleted_at IS NULL
        `;

        const result = await this.pool.query(query, [gameId]);
        
        if (result.rows.length === 0) {
            return null;
        }

        const overview = result.rows[0];
        
        // 将结果存入Redis缓存，设置1小时过期时间
        await this.redis.setex(cacheKey, 3600, JSON.stringify(overview));
        
        return overview;
    }
}

module.exports = GameOverviewRepository;
