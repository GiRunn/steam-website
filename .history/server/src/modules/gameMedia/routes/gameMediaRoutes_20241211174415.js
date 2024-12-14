// src/modules/gameMedia/routes/gameMediaRoutes.js
const express = require('express');
const router = express.Router();

class GameMediaRoutes {
  constructor(controller) {
    this.controller = controller;
    this.router = router;
    this.initializeRoutes();
  }

  initializeRoutes() {
    // 原来的代码:
    // this.router.get('/', (req, res) => 
    //   this.controller.getGameMedia(req, res));

    // 修改为:
    this.router.get('/:gameId', (req, res) => 
      this.controller.getGameMedia(req, res));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = GameMediaRoutes;