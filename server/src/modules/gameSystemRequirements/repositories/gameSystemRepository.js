class GameSystemRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'game:system:';
        this.CACHE_VERSION = 'v1:'; // 添加缓存版本
        this.CACHE_TTL = 3600; // 1 hour cache
    }

    async getSystemRequirements(gameId) {
        try {
            const cacheKey = `${this.CACHE_KEY}${this.CACHE_VERSION}${gameId}`;
            
            // 尝试从缓存获取
            const cachedData = await this.redis.get(cacheKey);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                // 验证缓存数据是否完整
                if (this.validateSystemRequirements(parsed)) {
                    return parsed;
                }
                // 如果缓存数据不完整，删除缓存
                await this.redis.del(cacheKey);
            }

            const query = `
                SELECT 
                    game_id,
                    system_requirements
                FROM games 
                WHERE game_id = $1 
                AND deleted_at IS NULL
            `;

            const result = await this.pool.query(query, [gameId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const systemReq = result.rows[0].system_requirements;

            // 验证系统需求数据
            if (!this.validateSystemRequirements(systemReq)) {
                console.warn('Invalid or incomplete system requirements for game:', gameId);
                return null;
            }

            // 缓存结果
            await this.redis.setex(
                cacheKey,
                this.CACHE_TTL,
                JSON.stringify(systemReq)
            );

            return systemReq;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }

    validateSystemRequirements(systemReq) {
        if (!systemReq || !systemReq.minimum || !systemReq.recommended) {
            return false;
        }

        const requiredFields = ['os', 'processor', 'memory', 'graphics', 'storage'];
        
        // 验证最低配置字段
        const hasAllMinimumFields = requiredFields.every(field => 
            systemReq.minimum.hasOwnProperty(field) && 
            systemReq.minimum[field] && 
            typeof systemReq.minimum[field] === 'string'
        );

        // 验证推荐配置字段
        const hasAllRecommendedFields = requiredFields.every(field => 
            systemReq.recommended.hasOwnProperty(field) && 
            systemReq.recommended[field] && 
            typeof systemReq.recommended[field] === 'string'
        );

        return hasAllMinimumFields && hasAllRecommendedFields;
    }
}

module.exports = GameSystemRepository; 