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