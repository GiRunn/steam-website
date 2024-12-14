// src/modules/gameMedia/routes/gameMediaRoutes.js
const express = require('express');

class GameMediaRoutes {
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router(); // 创建新的router实例
    this.initializeRoutes();
  }

  initializeRoutes() {
    console.log('Initializing media routes...'); // 添加日志
    
    // 明确指定完整路径
    this.router.get('/:gameId/media', (req, res) => {
      console.log('Media route hit, gameId:', req.params.gameId); // 添加日志
      this.controller.getGameMedia(req, res);
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = GameMediaRoutes;