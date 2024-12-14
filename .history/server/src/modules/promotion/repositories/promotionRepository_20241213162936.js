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
            // 主查询：获取当前有效的活动
            const query = `
                WITH ranked_promotions AS (
                    SELECT 
                        promotion_id,
                        name,
                        banner_url,
                        start_time,
                        end_time,
                        min_purchase,
                        status,
                        priority,
                        created_at,
                        CASE 
                            WHEN status = 'active' THEN 1
                            WHEN status = 'scheduled' THEN 2
                            ELSE 3
                        END as status_rank
                    FROM promotions p
                    WHERE status IN ('active', 'scheduled')
                        AND end_time >= NOW()
                    ORDER BY 
                        status_rank ASC,
                        priority DESC,
                        CASE 
                            WHEN start_time <= NOW() THEN 0
                            ELSE 1
                        END ASC,
                        created_at DESC
                )
                SELECT *
                FROM ranked_promotions
                LIMIT 2;
            `;

            console.log('Executing query:', query);
            const result = await this.pool.query(query);
            console.log('Query result:', result.rows);

            // 如果没有找到活动，尝试查找即将开始的活动
            if (result.rows.length === 0) {
                console.log('No active promotions found, checking upcoming promotions...');
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
                    WHERE status != 'ended'
                        AND start_time > NOW()
                    ORDER BY 
                        start_time ASC,
                        priority DESC
                    LIMIT 2;
                `;

                console.log('Executing upcoming query:', upcomingQuery);
                const upcomingResult = await this.pool.query(upcomingQuery);
                console.log('Upcoming query result:', upcomingResult.rows);
                return upcomingResult.rows;
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
