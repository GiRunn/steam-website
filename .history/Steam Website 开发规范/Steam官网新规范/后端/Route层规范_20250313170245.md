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
        '/:id',
        apiLimiter,
        controller.getResource.bind(controller)
    );
    
    // 其他路由定义
    
    return router;
};
