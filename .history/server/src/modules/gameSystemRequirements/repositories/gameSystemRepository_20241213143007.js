class GameSystemRepository {
    constructor(pool, redis) {
        if (!pool) throw new Error('Database pool is required');
        if (!redis) throw new Error('Redis client is required');
        this.pool = pool;
        this.redis = redis;
        this.CACHE_KEY = 'game:system:';
        this.CACHE_TTL = 3600; // 1 hour cache
    }

    async getSystemRequirements(gameId) {
        try {
            // 尝试从缓存获取
            const cachedData = await this.redis.get(`${this.CACHE_KEY}${gameId}`);
            if (cachedData) {
                return JSON.parse(cachedData);
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

            // 添加数据验证
            if (!systemReq || typeof systemReq !== 'object') {
                console.error('Invalid system requirements format for game:', gameId);
                return null;
            }

            if (!systemReq.minimum || !systemReq.recommended) {
                console.warn('Incomplete system requirements for game:', gameId);
                // 构造默认结构
                systemReq = {
                    minimum: systemReq.minimum || {},
                    recommended: systemReq.recommended || {}
                };
            }

            // 缓存结果
            await this.redis.setex(
                `${this.CACHE_KEY}${gameId}`,
                this.CACHE_TTL,
                JSON.stringify(systemReq)
            );

            return systemReq;
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }
}

module.exports = GameSystemRepository; 