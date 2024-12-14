class GameDetailRepository {
  constructor(pool) {
      if (!pool) {
          throw new Error('Database pool is required');
      }
      this.pool = pool;
  }

  async getGameMainInfo(gameId) {
      try {
          const query = `
              SELECT 
                  g.game_id,
                  g.title,
                  g.description,
                  g.short_description,
                  g.release_date,
                  g.publisher_id,
                  g.developer_id,
                  g.base_price,
                  g.current_price,
                  g.discount,
                  g.video_url,
                  g.image_url,
                  g.banner_url,
                  g.language_support,
                  g.system_requirements
              FROM games g
              WHERE g.game_id = $1 AND g.deleted_at IS NULL
          `;
          
          const result = await this.pool.query(query, [gameId]);
          return result.rows[0];
      } catch (error) {
          console.error('Error in getGameMainInfo:', error);
          throw error;
      }
  }
}

module.exports = GameDetailRepository;