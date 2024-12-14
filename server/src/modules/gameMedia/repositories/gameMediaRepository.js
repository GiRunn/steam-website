class GameMediaRepository {
    constructor(db, redis) {
      this.db = db;
      this.redis = redis;
    }
  
    async getGameMedia(gameId) {
      const mediaQuery = `
        SELECT url, title, description, "order"
        FROM game_media 
        WHERE game_id = $1 
        ORDER BY "order" ASC
      `;
  
      const videoQuery = `
        SELECT video_url
        FROM games
        WHERE game_id = $1
      `;
  
      try {
        const [mediaResult, videoResult] = await Promise.all([
          this.db.query(mediaQuery, [gameId]),
          this.db.query(videoQuery, [gameId])
        ]);
  
        return {
          screenshots: mediaResult.rows,
          video: videoResult.rows[0]?.video_url
        };
      } catch (error) {
        throw new Error(`Error fetching game media: ${error.message}`);
      }
    }
  }
  
  module.exports = GameMediaRepository;