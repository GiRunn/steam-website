const express = require('express');
const router = express.Router();
const GameDetailController = require('../controllers/gameDetailController');

const gameDetailController = new GameDetailController();

router.get('/:gameId/main', gameDetailController.getGameDetail.bind(gameDetailController));

module.exports = router;