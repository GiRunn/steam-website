const { performance } = require('perf_hooks');

class GameListRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'games:list:v2';
        this.CACHE_TTL = 300; // 5分钟缓存
    }

    async getAllGames() {
        try {
            // 强制清除旧缓存
            await this.clearCache();

            const startTime = performance.now();

            const query = `
                WITH GameTags AS (
                    SELECT 
                        gt.game_id,
                        t.tag_id,
                        t.name,
                        t.type,
                        gt.relevance,
                        ROW_NUMBER() OVER (
                            PARTITION BY gt.game_id 
                            ORDER BY gt.relevance DESC
                        ) as rn
                    FROM game_tags gt
                    JOIN tags t ON gt.tag_id = t.tag_id
                    WHERE gt.relevance > 0
                )
                SELECT 
                    g.game_id,
                    g.title,
                    g.rating,
                    g.banner_url,
                    g.base_price,
                    g.current_price,
                    g.discount,
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'tag_id', gt.tag_id,
                                    'name', gt.name,
                                    'type', gt.type
                                )
                            )
                            FROM (
                                SELECT *
                                FROM GameTags gt2
                                WHERE gt2.game_id = g.game_id
                                AND gt2.rn <= 4
                                ORDER BY gt2.relevance DESC
                            ) gt
                        ),
                        '[]'
                    ) as tags
                FROM games g
                WHERE g.deleted_at IS NULL
                AND g.status = 'active'
                ORDER BY g.game_id DESC`;

            const result = await this.pool.query(query);

            const endTime = performance.now();
            console.log(`Query execution time: ${endTime - startTime}ms`);

            // 存入新缓存
            await this.setCache(result.rows);

            return result.rows;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    async clearCache() {
        try {
            // 清除所有相关的缓存
            const keys = await this.redis.keys('games:list*');
            if (keys.length > 0) {
                await Promise.all(keys.map(key => this.redis.del(key)));
            }
        } catch (error) {
            console.error('Cache clear error:', error);
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