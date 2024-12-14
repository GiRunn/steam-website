const express = require('express');
const { GameController } = require('../controllers/gameController');  // 修改这里，使用解构
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// 修改这里，确保正确引用方法
router.get(
  '/games/:gameId/main',
  apiLimiter,
  authMiddleware,
  GameController.getGameMainInfo
);

module.exports = router;