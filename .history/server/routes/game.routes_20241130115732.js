// src/routes/game.routes.js - 游戏路由
const express = require('express');
const GameController = require('../controllers/game.controller');

const router = express.Router();

// 获取游戏列表
router.get('/games', GameController.getGames);

// 获取游戏详情
router.get('/games/:gameId', GameController.getGameDetail);

// 搜索游戏
router.get('/games/search', GameController.searchGames);

// 按价格过滤游戏
router.get('/games/filter/price', GameController.filterByPrice);

module.exports = router;