// src/controllers/game.controller.js - 游戏控制器
const Game = require('../models/game.model');

class GameController {
  // 获取游戏列表
  static async getGames(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await Game.getAllGames(parseInt(page), parseInt(limit));
      res.json({
        status: 'success',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }

  // 获取游戏详情
  static async getGameDetail(req, res) {
    try {
      const { gameId } = req.params;
      const game = await Game.getGameById(gameId);
      if (!game) {
        return res.status(404).json({
          status: 'error',
          message: 'Game not found'
        });
      }
      res.json({
        status: 'success',
        data: game
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }

  // 搜索游戏
  static async searchGames(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      if (!q) {
        return res.status(400).json({
          status: 'error',
          message: 'Search term is required'
        });
      }
      const result = await Game.searchGames(q, parseInt(page), parseInt(limit));
      res.json({
        status: 'success',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }

  // 按价格过滤游戏
  static async filterByPrice(req, res) {
    try {
      const { min = 0, max = 999999, page = 1, limit = 10 } = req.query;
      const result = await Game.filterGamesByPrice(
        parseFloat(min),
        parseFloat(max),
        parseInt(page),
        parseInt(limit)
      );
      res.json({
        status: 'success',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = GameController;