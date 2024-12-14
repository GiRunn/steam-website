// src/controllers/game.controller.js - 游戏控制器
const Game = require('../models/game.model');
const { validateGameQuery, sanitizeInput } = require('../utils/validators');
const logger = require('../utils/logger');

class GameController {
  // 获取游戏列表
  static async getGames(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
      
      // 参数验证
      if (!validateGameQuery({ page, limit })) {
        return res.status(400).json({
          status: 'error',
          message: '无效的查询参数'
        });
      }

      const result = await Game.getAllGames(
        parseInt(page),
        parseInt(limit),
        sort,
        order
      );
      
      // 添加分页元数据
      res.json({
        status: 'success',
        data: result.games,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (err) {
      logger.error(`获取游戏列表失败: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: '获取游戏列表失败'
      });
    }
  }

  // 获取游戏详情
  static async getGameDetail(req, res) {
    try {
      const { gameId } = req.params;
      
      if (!gameId || !/^[0-9a-fA-F]{24}$/.test(gameId)) {
        return res.status(400).json({
          status: 'error',
          message: '无效的游戏ID'
        });
      }

      const game = await Game.getGameById(gameId);
      if (!game) {
        return res.status(404).json({
          status: 'error',
          message: '游戏不存在'
        });
      }

      // 增加游戏访问计数
      await Game.incrementViewCount(gameId);
      
      res.json({
        status: 'success',
        data: game
      });
    } catch (err) {
      logger.error(`获取游戏详情失败: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: '获取游戏详情失败'
      });
    }
  }

  // 搜索游戏
  static async searchGames(req, res) {
    try {
      const { q, page = 1, limit = 10, category, tags } = req.query;
      
      // 搜索词验证和清理
      const searchTerm = sanitizeInput(q);
      if (!searchTerm || searchTerm.length < 2) {
        return res.status(400).json({
          status: 'error',
          message: '搜索词至少需要2个字符'
        });
      }

      const result = await Game.searchGames(
        searchTerm,
        parseInt(page),
        parseInt(limit),
        category,
        tags
      );

      res.json({
        status: 'success',
        data: result.games,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (err) {
      logger.error(`搜索游戏失败: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: '搜索游戏失败'
      });
    }
  }

  // 按价格过滤游戏
  static async filterByPrice(req, res) {
    try {
      const {
        min = 0,
        max = 999999,
        page = 1,
        limit = 10,
        currency = 'CNY'
      } = req.query;

      // 价格范围验证
      if (min < 0 || max < min) {
        return res.status(400).json({
          status: 'error',
          message: '无效的价格范围'
        });
      }

      const result = await Game.filterGamesByPrice(
        parseFloat(min),
        parseFloat(max),
        parseInt(page),
        parseInt(limit),
        currency
      );

      res.json({
        status: 'success',
        data: result.games,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit)
        },
        priceRange: {
          min: parseFloat(min),
          max: parseFloat(max),
          currency
        }
      });
    } catch (err) {
      logger.error(`价格过滤失败: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: '价格过滤失败'
      });
    }
  }
}

module.exports = GameController;