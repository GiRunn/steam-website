// server/src/modules/gameOverview/repositories/gameOverviewRepository.js
class GameOverviewRepository {
    constructor(pool, redis) {
        this.pool = pool;
        this.redis = redis;
    }

    async getGameOverview(gameId) {
        // 首先尝试从Redis缓存获取
        const cacheKey = `game_overview:${gameId}`;
        const cachedData = await this.redis.get(cacheKey);
        
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // 如果缓存没有，则查询数据库
        const query = `
            SELECT 
                g.description,
                g.rating,
                rs.positive_rate,
                rs.avg_playtime_hours,
                rs.total_reviews
            FROM games g
            LEFT JOIN review_system.review_summary rs 
                ON g.game_id = rs.game_id
            WHERE g.game_id = $1 AND g.deleted_at IS NULL
        `;

        const result = await this.pool.query(query, [gameId]);
        
        if (result.rows.length === 0) {
            return null;
        }

        const overview = result.rows[0];
        
        // 将结果存入Redis缓存，设置1小时过期时间
        await this.redis.setex(cacheKey, 3600, JSON.stringify(overview));
        
        return overview;
    }
}

module.exports = GameOverviewRepository;

// server/src/modules/gameOverview/services/gameOverviewService.js
class GameOverviewService {
    constructor(gameOverviewRepository) {
        this.gameOverviewRepository = gameOverviewRepository;
    }

    async getGameOverview(gameId) {
        const overview = await this.gameOverviewRepository.getGameOverview(gameId);
        
        if (!overview) {
            throw new Error('Game not found');
        }
        
        return {
            description: overview.description,
            rating: parseFloat(overview.rating),
            positiveRate: parseFloat(overview.positive_rate),
            avgPlaytimeHours: parseFloat(overview.avg_playtime_hours),
            totalReviews: parseInt(overview.total_reviews)
        };
    }
}

module.exports = GameOverviewService;

// server/src/modules/gameOverview/controllers/gameOverviewController.js
class GameOverviewController {
    constructor(gameOverviewService) {
        this.gameOverviewService = gameOverviewService;
    }

    async getGameOverview(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    error: 'Invalid game ID'
                });
            }

            const overview = await this.gameOverviewService.getGameOverview(gameId);
            
            return res.json(overview);
        } catch (error) {
            console.error('Error fetching game overview:', error);
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}

module.exports = GameOverviewController;

// server/src/modules/gameOverview/routes/gameOverviewRoutes.js
const express = require('express');

function setupGameOverviewRoutes(gameOverviewController) {
    const router = express.Router();
    
    router.get('/games/:gameId/overview', (req, res) => 
        gameOverviewController.getGameOverview(req, res)
    );
    
    return router;
}

module.exports = setupGameOverviewRoutes;

// server/src/modules/gameOverview/index.js
const GameOverviewRepository = require('./repositories/gameOverviewRepository');
const GameOverviewService = require('./services/gameOverviewService');
const GameOverviewController = require('./controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./routes/gameOverviewRoutes');

module.exports = {
    GameOverviewRepository,
    GameOverviewService,
    GameOverviewController,
    setupGameOverviewRoutes
};