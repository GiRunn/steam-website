// src/models/game.model.js - 游戏数据模型
const pool = require('../config/db.config');

class Game {
  // 获取所有游戏列表
  static async getAllGames(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
      const result = await pool.query(
        `SELECT *
         FROM games 
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      // 获取总数
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM games WHERE deleted_at IS NULL'
      );
      
      return {
        games: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      };
    } catch (err) {
      throw new Error(`Error getting games: ${err.message}`);
    }
  }

  // 通过ID获取游戏详情
  static async getGameById(gameId) {
    try {
      const result = await pool.query(
        'SELECT * FROM games WHERE game_id = $1 AND deleted_at IS NULL',
        [gameId]
      );
      return result.rows[0];
    } catch (err) {
      throw new Error(`Error getting game by id: ${err.message}`);
    }
  }

  // 搜索游戏
  static async searchGames(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
      const result = await pool.query(
        `SELECT *
         FROM games
         WHERE (title ILIKE $1 OR description ILIKE $1)
         AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      );
      
      const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM games
         WHERE (title ILIKE $1 OR description ILIKE $1)
         AND deleted_at IS NULL`,
        [`%${searchTerm}%`]
      );
      
      return {
        games: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      };
    } catch (err) {
      throw new Error(`Error searching games: ${err.message}`);
    }
  }

  // 按价格范围筛选游戏
  static async filterGamesByPrice(minPrice, maxPrice, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
      const result = await pool.query(
        `SELECT *
         FROM games
         WHERE current_price BETWEEN $1 AND $2
         AND deleted_at IS NULL
         ORDER BY current_price ASC
         LIMIT $3 OFFSET $4`,
        [minPrice, maxPrice, limit, offset]
      );
      
      const countResult = await pool.query(
        `SELECT COUNT(*)
         FROM games
         WHERE current_price BETWEEN $1 AND $2
         AND deleted_at IS NULL`,
        [minPrice, maxPrice]
      );
      
      return {
        games: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      };
    } catch (err) {
      throw new Error(`Error filtering games by price: ${err.message}`);
    }
  }
}

module.exports = Game;