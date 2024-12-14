// src/modules/gameFeature/routes/gameFeatureRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60
});

module.exports = (controller) => {
    router.get(
        '/:gameId/features',
        limiter,
        (req, res) => controller.getGameFeatureInfo(req, res)
    );

    return router;
};