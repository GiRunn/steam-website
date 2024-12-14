const express = require('express');
const router = express.Router();

class GameMediaRoutes {
  constructor(controller) {
    this.controller = controller;
    this.router = router;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/:gameId', (req, res) => 
      this.controller.getGameMedia(req, res));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = GameMediaRoutes;