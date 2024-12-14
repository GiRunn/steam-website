// server/src/modules/gameOverview/repositories/gameOverviewRepository.js
class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    // 在 gameOverviewRepository 中添加日志
    async getGameOverview(gameId) {
        try {
            // 首先尝试从Redis缓存获取
            const cacheKey = `game_overview:${gameId}`;
            const cachedData = await this.redis.get(cacheKey);
            
            if (cachedData) {
                console.log('Cache hit for game:', gameId);
                return JSON.parse(cachedData);
            }

            console.log('Cache miss for game:', gameId);

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

            console.log('Executing query:', query, 'with params:', [gameId]);

            const result = await this.pool.query(query, [gameId]);
            
            console.log('Query result:', result.rows);

            if (result.rows.length === 0) {
                return null;
            }

            const overview = result.rows[0];
            
            await this.redis.setex(cacheKey, 3600, JSON.stringify(overview));
            
            return overview;
        } catch (err) {
            console.error('Repository error:', err);
            throw err;
        }
}
}

module.exports = GameOverviewRepository;
