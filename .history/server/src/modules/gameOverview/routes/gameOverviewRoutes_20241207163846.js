// src/modules/gameOverview/routes/gameOverviewRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

module.exports = (controller) => {
    if (!controller) throw new Error('Controller is required');
    
    const router = express.Router();
    
    router.get(
        '/:gameId/overview',
        apiLimiter,
        controller.getGameOverview.bind(controller)
    );
    
    return router;
};