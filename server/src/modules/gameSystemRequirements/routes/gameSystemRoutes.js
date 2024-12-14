const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30 // 30 requests per minute
});

module.exports = (controller) => {
    router.get(
        '/:gameId/system-requirements',
        limiter,
        (req, res) => controller.getSystemRequirements(req, res)
    );

    return router;
}; 