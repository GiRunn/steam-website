const express = require('express');
const gameDetailController = require('../controllers/gameDetailController');
// const { authMiddleware } = require('../../../middleware/auth');  // 注释掉
const rateLimit = require('express-rate-limit');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

router.get(
  '/:gameId/main',
  apiLimiter,
  // authMiddleware,  // 注释掉认证中间件
  gameDetailController.getGameMainInfo.bind(gameDetailController)
);

module.exports = router;