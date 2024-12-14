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
                    promotion_id,
                    name,
                    banner_url,
                    start_time,
                    min_purchase,
                    status,
                    priority,
                    created_at
                FROM promotions p
                WHERE status IN ('active', 'scheduled')
                    AND start_time <= NOW()
                    AND end_time >= NOW()
                    AND priority > 0
                ORDER BY 
                    priority DESC,
                    created_at DESC
                LIMIT 2;
            `;

            console.log('Executing query:', query);
            const result = await this.pool.query(query);
            console.log('Query result:', result.rows);
            
            if (result.rows.length === 0) {
                console.log('No results found with primary query, trying fallback query...');
                const fallbackQuery = `
                    SELECT 
                        promotion_id,
                        name,
                        banner_url,
                        start_time,
                        min_purchase,
                        status,
                        priority,
                        created_at
                    FROM promotions
                    WHERE status != 'ended'
                    ORDER BY 
                        priority DESC,
                        created_at DESC
                    LIMIT 2;
                `;
                
                console.log('Executing fallback query:', fallbackQuery);
                const fallbackResult = await this.pool.query(fallbackQuery);
                console.log('Fallback query result:', fallbackResult.rows);
                return fallbackResult.rows;
            }

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
