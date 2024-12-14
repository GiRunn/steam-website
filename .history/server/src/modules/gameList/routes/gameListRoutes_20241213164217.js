const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// 限流配置
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 100次请求
});

module.exports = (controller) => {
    router.get(
        '/list',
        limiter,
        (req, res) => controller.getAllGames(req, res)
    );

    return router;
}; 