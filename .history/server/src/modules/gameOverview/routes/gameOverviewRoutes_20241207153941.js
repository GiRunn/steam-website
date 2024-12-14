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
