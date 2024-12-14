class GameIntroductionRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'game:intro:';
        this.CACHE_TTL = 3600; // 1小时缓存
    }

    async getGameIntroductions(gameId) {
        const query = `
            SELECT pi.title, pi.short_desc, pi.icon_url
            FROM game_introductions gi
            JOIN product_introductions pi ON gi.intro_id = pi.intro_id
            WHERE gi.game_id = $1
            ORDER BY gi.display_order ASC
        `;

        try {
            const result = await this.pool.query(query, [gameId]);
            return result.rows;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }
}

module.exports = GameIntroductionRepository; 