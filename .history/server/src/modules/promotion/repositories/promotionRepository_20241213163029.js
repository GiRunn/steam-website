class PromotionRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'promotion:active:';
        this.CACHE_TTL = 300; // 5分钟缓存
    }

    async getActivePromotions() {
        try {
            // 尝试从缓存获取数据
            const cachedData = await this.getCacheKey(this.CACHE_KEY + 'list');
            if (cachedData) {
                console.log('Returning cached promotions');
                return cachedData;
            }

            // 调试查询
            const debugQuery = `
                SELECT 
                    promotion_id,
                    name,
                    status,
                    priority,
                    start_time,
                    end_time,
                    NOW() as current_time
                FROM promotions
                ORDER BY priority DESC;
            `;
            const debugResult = await this.pool.query(debugQuery);
            console.log('Debug query result:', debugResult.rows);

            // 主查询
            const query = `
                SELECT 
                    promotion_id,
                    name,
                    banner_url,
                    start_time,
                    end_time,
                    min_purchase,
                    status,
                    priority,
                    created_at
                FROM promotions p
                WHERE status IN ('active', 'scheduled')
                    AND end_time >= NOW()
                ORDER BY 
                    priority DESC,
                    CASE 
                        WHEN start_time <= NOW() THEN 0
                        ELSE 1
                    END,
                    created_at DESC
                LIMIT 2;
            `;

            console.log('Executing query:', query);
            const result = await this.pool.query(query);
            console.log('Query result:', result.rows);

            if (result.rows.length > 0) {
                // 缓存结果
                await this.setCacheKey(this.CACHE_KEY + 'list', result.rows);
                return result.rows;
            }

            // 备用查询：查找即将开始的活动
            const upcomingQuery = `
                SELECT 
                    promotion_id,
                    name,
                    banner_url,
                    start_time,
                    end_time,
                    min_purchase,
                    status,
                    priority,
                    created_at
                FROM promotions
                WHERE status IN ('active', 'scheduled')
                    AND start_time > NOW()
                ORDER BY 
                    priority DESC,
                    start_time ASC
                LIMIT 2;
            `;

            console.log('Executing upcoming query:', upcomingQuery);
            const upcomingResult = await this.pool.query(upcomingQuery);
            console.log('Upcoming query result:', upcomingResult.rows);

            // 缓存备用查询结果
            if (upcomingResult.rows.length > 0) {
                await this.setCacheKey(this.CACHE_KEY + 'list', upcomingResult.rows);
            }

            return upcomingResult.rows;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    async getCacheKey(key) {
        try {
            const data = await this.redis.get(key);
            if (data) {
                console.log('Cache hit for key:', key);
                return JSON.parse(data);
            }
            console.log('Cache miss for key:', key);
            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async setCacheKey(key, data) {
        try {
            await this.redis.setex(key, this.CACHE_TTL, JSON.stringify(data));
            console.log('Cache set for key:', key);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    // 清除缓存
    async clearCache() {
        try {
            await this.redis.del(this.CACHE_KEY + 'list');
            console.log('Cache cleared');
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }
}

module.exports = PromotionRepository;
