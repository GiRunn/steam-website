class GameBasicInfoRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'game:basic:';
        this.CACHE_TTL = 900; // 15分钟缓存
    }

    async getGameBasicInfo(gameId) {
        try {
            const query = `
                WITH game_base AS (
                    SELECT 
                        g.game_id,
                        g.current_price,
                        g.discount,
                        d.developer_name,
                        g.release_date,
                        g.player_count
                    FROM games g
                    LEFT JOIN developers d ON g.developer_id = d.developer_id
                    WHERE g.game_id = $1 AND g.deleted_at IS NULL
                ),
                game_tag_info AS (
                    SELECT 
                        gt.game_id,
                        json_agg(
                            json_build_object(
                                'tag_id', t.tag_id,
                                'name', t.name,
                                'type', t.type
                            )
                        ) as tags
                    FROM game_tags gt
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE gt.game_id = $1
                    GROUP BY gt.game_id
                )
                SELECT 
                    gb.*,
                    COALESCE(gti.tags, '[]'::json) as tags
                FROM game_base gb
                LEFT JOIN game_tag_info gti ON gb.game_id = gti.game_id
            `;

            const result = await this.pool.query(query, [gameId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }
}

module.exports = GameBasicInfoRepository; 