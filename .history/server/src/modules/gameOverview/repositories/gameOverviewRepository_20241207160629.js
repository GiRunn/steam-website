// server/src/modules/gameOverview/repositories/gameOverviewRepository.js
const pool = require('../../config/database');
const redis = require('../../config/redis');

class GameOverviewRepository {
    async getGameOverview(gameId) {
        try {
            // 先尝试从Redis获取
            const cacheKey = `game:${gameId}:overview`;
            const cachedData = await redis.get(cacheKey);
            
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            // 如果缓存没有，从数据库查询
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

            const result = await pool.query(query, [gameId]);

            if (result.rows.length === 0) {
                return null;
            }

            const data = result.rows[0];
            
            // 将结果存入Redis，设置1小时过期
            await redis.setex(cacheKey, 3600, JSON.stringify(data));

            return data;
        } catch (error) {
            console.error('Error in getGameOverview:', error);
            throw error;
        }
    }
}

module.exports = new GameOverviewRepository();