class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    async getGameOverview(gameId) {
        try {
            // 增加 console.log 来调试
            console.log('Querying game overview for ID:', gameId);
            
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

            // 记录查询语句
            console.log('Executing query:', query);
            console.log('With params:', [gameId]);

            const result = await this.pool.query(query, [gameId]);
            
            // 记录查询结果
            console.log('Query result:', result.rows);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            // 记录具体错误
            console.error('Error in getGameOverview repository:', error);
            throw error;
        }
    }
}

module.exports = GameOverviewRepository;