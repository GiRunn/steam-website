// src/config/database.js
const { Pool } = require('pg');

let pool;

try {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

} catch (error) {
    console.error('Error creating pool:', error);
    process.exit(-1);
}

const checkConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connection test successful');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};

module.exports = { pool, checkConnection };

// src/config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: times => {
        return Math.min(times * 50, 2000);
    }
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;

// src/modules/game/repositories/gameDetailRepository.js
class GameDetailRepository {
    constructor(pool) {
        if (!pool) {
            throw new Error('Database pool is required');
        }
        this.pool = pool;
    }

    async getGameMainInfo(gameId) {
        const query = `
            SELECT 
                g.game_id,
                g.title,
                g.banner_url,
                g.video_url,
                g.rating,
                COALESCE(rs.total_reviews, 0) as total_reviews,
                ARRAY_AGG(t.name) as tags
            FROM games g
            LEFT JOIN review_system.review_summary rs ON rs.game_id = g.game_id
            LEFT JOIN game_tags gt ON gt.game_id = g.game_id
            LEFT JOIN tags t ON t.tag_id = gt.tag_id
            WHERE g.game_id = $1
                AND g.deleted_at IS NULL
            GROUP BY 
                g.game_id, 
                g.title, 
                g.banner_url, 
                g.video_url, 
                g.rating, 
                rs.total_reviews
        `;

        try {
            const result = await this.pool.query(query, [gameId]);
            return result.rows[0];
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }
}

module.exports = GameDetailRepository;