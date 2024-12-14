const express = require('express');
const GameController = require('../controllers/gameController');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get(
  '/games/:gameId/main',
  apiLimiter,
  authMiddleware,
  GameController.getGameMainInfo
);

module.exports = router;