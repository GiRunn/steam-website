const redis = require('../../../config/redis');
const gameDetailRepository = require('../repositories/gameDetailRepository');

class GameDetailService {
  constructor() {
    this.CACHE_KEY = 'game:detail:main:';
    this.CACHE_TTL = 900; // 15 minutes
  }

  async getGameMainInfo(gameId) {
    // Try cache first
    const cachedData = await this.getFromCache(gameId);
    if (cachedData) {
      return cachedData;
    }

    // Get from database
    const gameData = await gameDetailRepository.getGameMainInfo(gameId);
    if (!gameData) {
      return null;
    }

    // Cache the result
    await this.setCache(gameId, gameData);
    
    return gameData;
  }

  async getFromCache(gameId) {
    const data = await redis.hgetall(`${this.CACHE_KEY}${gameId}`);
    if (Object.keys(data).length === 0) {
      return null;
    }
    return this.parseCachedData(data);
  }

  async setCache(gameId, data) {
    const cacheData = {
      game_id: data.game_id.toString(),
      title: data.title,
      banner_url: data.banner_url || '',
      video_url: data.video_url || '',
      rating: data.rating.toString(),
      total_reviews: data.total_reviews.toString(),
      tags: JSON.stringify(data.tags)
    };

    await redis.hmset(`${this.CACHE_KEY}${gameId}`, cacheData);
    await redis.expire(`${this.CACHE_KEY}${gameId}`, this.CACHE_TTL);
  }

  parseCachedData(data) {
    return {
      game_id: parseInt(data.game_id),
      title: data.title,
      banner_url: data.banner_url || null,
      video_url: data.video_url || null,
      rating: parseFloat(data.rating),
      total_reviews: parseInt(data.total_reviews),
      tags: JSON.parse(data.tags)
    };
  }
}

module.exports = new GameDetailService();