class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    async getGameOverview(gameId) {
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

        return result.rows[0];
    }
}

module.exports = GameOverviewRepository;