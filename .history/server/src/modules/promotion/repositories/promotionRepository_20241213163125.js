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
            // 调试查询：检查所有活动的详细状态
            const debugQuery = `
                SELECT 
                    promotion_id,
                    name,
                    status,
                    priority,
                    start_time AT TIME ZONE 'UTC' as start_time,
                    end_time AT TIME ZONE 'UTC' as end_time,
                    NOW() AT TIME ZONE 'UTC' as current_time,
                    CASE 
                        WHEN end_time < NOW() THEN '已过期'
                        WHEN start_time > NOW() THEN '未开始'
                        ELSE '进行中'
                    END as time_status
                FROM promotions
                ORDER BY priority DESC;
            `;
            const debugResult = await this.pool.query(debugQuery);
            console.log('All promotions status:', debugResult.rows);

            // 修改主查询
            const query = `
                SELECT 
                    promotion_id,
                    name,
                    banner_url,
                    start_time AT TIME ZONE 'UTC' as start_time,
                    end_time AT TIME ZONE 'UTC' as end_time,
                    min_purchase,
                    status,
                    priority,
                    created_at
                FROM promotions p
                WHERE status = 'active'
                    AND start_time <= NOW()
                    AND end_time >= NOW()
                ORDER BY 
                    priority DESC,
                    created_at DESC
                LIMIT 2;
            `;

            console.log('Executing main query:', query);
            const result = await this.pool.query(query);
            console.log('Main query result:', result.rows);

            return result.rows;
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
