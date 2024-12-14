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
                    p.start_time AT TIME ZONE 'UTC' as start_time,
                    p.min_purchase
                FROM promotions p
                WHERE (p.status = 'active' OR p.status = 'scheduled')
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
}

module.exports = PromotionRepository; 