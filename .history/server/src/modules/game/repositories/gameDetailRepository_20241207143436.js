const pool = require('../../../config/database');

class GameDetailRepository {
  async getGameMainInfo(gameId) {
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
        AND g.deleted_at IS NULL
      GROUP BY 
        g.game_id, 
        g.title, 
        g.banner_url, 
        g.video_url, 
        g.rating, 
        rs.total_reviews
    `;

    const result = await pool.query(query, [gameId]);
    return result.rows[0];
  }
}

module.exports = new GameDetailRepository();