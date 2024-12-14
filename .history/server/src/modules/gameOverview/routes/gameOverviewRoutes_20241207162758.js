const express = require('express');

function setupGameOverviewRoutes(gameOverviewController) {
    const router = express.Router();
    
    router.get('/:gameId/overview', gameOverviewController.getGameOverview.bind(gameOverviewController));
    
    return router;
}

module.exports = setupGameOverviewRoutes;