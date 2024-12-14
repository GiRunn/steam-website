const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100
});

module.exports = (controller) => {
    router.get(
        '/:gameId/introductions',
        limiter,
        (req, res) => controller.getGameIntroductions(req, res)
    );

    return router;
}; 