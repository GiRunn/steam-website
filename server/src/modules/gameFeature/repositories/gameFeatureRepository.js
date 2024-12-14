// src/modules/gameFeature/repositories/gameFeatureRepository.js
class GameFeatureRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'game:feature:';
        this.CACHE_TTL = 900; // 15 minutes
    }

    async getGameFeatureInfo(gameId) {
        try {
            const query = `
                WITH game_base AS (
                    SELECT 
                        g.game_id,
                        g.player_count,
                        g.release_date,
                        g.system_requirements,
                        d.developer_name,
                        d.description as developer_description
                    FROM games g
                    LEFT JOIN developers d ON g.developer_id = d.developer_id
                    WHERE g.game_id = $1
                ),
                game_features AS (
                    SELECT 
                        t.name as tag_name,
                        t.type as tag_type,
                        t.description as tag_description
                    FROM game_tags gt
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE gt.game_id = $1 AND t.category_id = 2  -- category_id 2 表示游戏特征
                )
                SELECT 
                    gb.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'name', gf.tag_name,
                                'type', gf.tag_type,
                                'description', gf.tag_description
                            )
                        ) FILTER (WHERE gf.tag_name IS NOT NULL),
                        '[]'
                    ) as features
                FROM game_base gb
                LEFT JOIN game_features gf ON true
                GROUP BY 
                    gb.game_id, 
                    gb.player_count,
                    gb.release_date,
                    gb.system_requirements,
                    gb.developer_name,
                    gb.developer_description
            `;

            const result = await this.pool.query(query, [gameId]);
            if (result.rows.length === 0) return null;

            const gameInfo = result.rows[0];
            return this.formatGameFeatureInfo(gameInfo);
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    formatGameFeatureInfo(data) {
        let platform = 'Unknown';
        try {
            const sysReq = typeof data.system_requirements === 'string' 
                ? JSON.parse(data.system_requirements) 
                : data.system_requirements;
            platform = sysReq?.minimum?.os || 'Unknown';
        } catch (error) {
            console.error('Error parsing system requirements:', error);
        }

        return {
            game_id: data.game_id,
            release_info: {
                developer: {
                    name: data.developer_name,
                    description: data.developer_description
                },
                player_count: data.player_count,
                release_date: data.release_date,
                platform: platform
            },
            features: data.features
        };
    }
}

module.exports = GameFeatureRepository;