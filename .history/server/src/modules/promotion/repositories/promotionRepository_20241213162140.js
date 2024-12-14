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
            const query = `
                SELECT 
                    p.banner_url,
                    p.name,
                    p.start_time,
                    p.min_purchase,
                    p.status  -- 添加状态输出用于调试
                FROM promotions p
                WHERE p.status IN ('active', 'scheduled')  -- 使用IN语句
                    AND p.start_time <= CURRENT_TIMESTAMP
                    AND (p.end_time IS NULL OR p.end_time > CURRENT_TIMESTAMP)
                ORDER BY 
                    p.priority DESC,
                    p.created_at DESC
                LIMIT 2;
            `;

            console.log('Executing query:', query);
            const result = await this.pool.query(query);
            console.log('Query result:', result.rows);
            
            return result.rows;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    // 添加缓存相关方法
    async getCacheKey(key) {
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async setCacheKey(key, data) {
        try {
            await this.redis.setex(key, this.CACHE_TTL, JSON.stringify(data));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }
}

module.exports = PromotionRepository;
