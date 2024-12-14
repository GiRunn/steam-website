const { performance } = require('perf_hooks');

class GameListRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'games:list';
        this.CACHE_TTL = 300; // 5分钟缓存
    }

    async getAllGames() {
        try {
            // 尝试从缓存获取
            const cachedData = await this.getFromCache();
            if (cachedData) {
                return cachedData;
            }

            const startTime = performance.now();

            const query = `
                SELECT 
                    g.game_id,
                    g.title,
                    g.rating,
                    g.banner_url,
                    g.base_price,
                    g.current_price,
                    g.discount,
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'tag_id', t.tag_id,
                                'name', t.name,
                                'type', t.type
                            )
                        ) FILTER (WHERE t.tag_id IS NOT NULL),
                        '[]'
                    ) as tags
                FROM games g
                LEFT JOIN game_tags gt ON g.game_id = gt.game_id
                LEFT JOIN tags t ON gt.tag_id = t.tag_id
                WHERE g.deleted_at IS NULL
                AND g.status = 'active'
                GROUP BY 
                    g.game_id,
                    g.title,
                    g.rating,
                    g.banner_url,
                    g.base_price,
                    g.current_price,
                    g.discount
                ORDER BY g.game_id DESC`;

            const result = await this.pool.query(query);

            const endTime = performance.now();
            console.log(`Query execution time: ${endTime - startTime}ms`);

            // 存入缓存
            await this.setCache(result.rows);

            return result.rows;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    async getFromCache() {
        try {
            const cachedData = await this.redis.get(this.CACHE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async setCache(data) {
        try {
            await this.redis.setex(
                this.CACHE_KEY,
                this.CACHE_TTL,
                JSON.stringify(data)
            );
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }
}

module.exports = GameListRepository; 