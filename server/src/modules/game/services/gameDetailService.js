// src/modules/game/services/gameDetailService.js
class GameDetailService {
  constructor(repository, redis) {
      if (!repository) {
          throw new Error('Repository is required');
      }
      if (!redis) {
          throw new Error('Redis client is required');
      }
      this.repository = repository;
      this.redis = redis;
      this.CACHE_KEY = 'game:detail:main:';
      this.CACHE_TTL = 900; // 15 minutes
  }

  async getGameMainInfo(gameId) {
      try {
          // Try cache first
          const cachedData = await this.getFromCache(gameId);
          if (cachedData) {
              return cachedData;
          }

          // Get from database
          const gameData = await this.repository.getGameMainInfo(gameId);
          if (!gameData) {
              return null;
          }

          // Cache the result
          await this.setCache(gameId, gameData);
          
          return gameData;
      } catch (error) {
          console.error('Service error:', error);
          throw error;
      }
  }

  async getFromCache(gameId) {
      try {
          const data = await this.redis.hgetall(`${this.CACHE_KEY}${gameId}`);
          if (Object.keys(data).length === 0) {
              return null;
          }
          return this.parseCachedData(data);
      } catch (error) {
          console.error('Cache get error:', error);
          return null;
      }
  }

  async setCache(gameId, data) {
      try {
          const cacheData = {
              game_id: data.game_id.toString(),
              title: data.title,
              banner_url: data.banner_url || '',
              video_url: data.video_url || '',
              rating: data.rating.toString(),
              total_reviews: data.total_reviews.toString(),
              tags: JSON.stringify(data.tags)
          };

          await this.redis.hmset(`${this.CACHE_KEY}${gameId}`, cacheData);
          await this.redis.expire(`${this.CACHE_KEY}${gameId}`, this.CACHE_TTL);
      } catch (error) {
          console.error('Cache set error:', error);
      }
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

module.exports = GameDetailService;