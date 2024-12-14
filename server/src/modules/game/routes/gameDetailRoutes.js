// src/modules/game/routes/gameDetailRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

module.exports = (gameDetailController) => {
    const router = express.Router();

    router.get(
        '/:gameId/main',
        apiLimiter,
        gameDetailController.getGameMainInfo.bind(gameDetailController)
    );

    return router;
};
