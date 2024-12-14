const pool = require('../config/database');
const redis = require('../config/redis');

class GameService {
  static CACHE_KEY = 'game:main:';
  static CACHE_TTL = 900; // 15 minutes

  static async getGameMainInfo(gameId) {
    // Try cache first
    const cachedData = await redis.hgetall(`${this.CACHE_KEY}${gameId}`);
    if (Object.keys(cachedData).length > 0) {
      return this.parseCachedGame(cachedData);
    }

    // If not in cache, get from database
    const query = `
      SELECT 
        g.game_id,
        g.title,
        g.banner_url,
        g.video_url,
        g.rating,
        COALESCE(rs.total_reviews, 0) as total_reviews,
        ARRAY_AGG(t.name) as tags
      FROM games g
      LEFT JOIN review_summary rs ON rs.game_id = g.game_id
      LEFT JOIN game_tags gt ON gt.game_id = g.game_id
      LEFT JOIN tags t ON t.tag_id = gt.tag_id
      WHERE g.game_id = $1
        AND g.status = 'active'
        AND g.deleted_at IS NULL
      GROUP BY g.game_id, g.title, g.banner_url, g.video_url, g.rating, rs.total_reviews
    `;

    const result = await pool.query(query, [gameId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const game = result.rows[0];
    
    // Cache the result
    await this.cacheGame(game);
    
    return game;
  }

  static async cacheGame(game) {
    const cacheData = {
      game_id: game.game_id.toString(),
      title: game.title,
      banner_url: game.banner_url || '',
      video_url: game.video_url || '',
      rating: game.rating.toString(),
      total_reviews: game.total_reviews.toString(),
      tags: JSON.stringify(game.tags)
    };

    await redis.hmset(`${this.CACHE_KEY}${game.game_id}`, cacheData);
    await redis.expire(`${this.CACHE_KEY}${game.game_id}`, this.CACHE_TTL);
  }

  static parseCachedGame(cachedData) {
    return {
      game_id: parseInt(cachedData.game_id),
      title: cachedData.title,
      banner_url: cachedData.banner_url || null,
      video_url: cachedData.video_url || null,
      rating: parseFloat(cachedData.rating),
      total_reviews: parseInt(cachedData.total_reviews),
      tags: JSON.parse(cachedData.tags)
    };
  }
}

module.exports = GameService;