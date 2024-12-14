const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 测试数据库连接
app.get('/test/db', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connection successful',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// 测试Redis连接
app.get('/test/redis', async (req, res) => {
  try {
    const redis = require('./config/redis');
    await redis.set('test_key', 'Hello Redis');
    const value = await redis.get('test_key');
    res.json({ 
      message: 'Redis connection successful',
      value: value
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Redis connection failed',
      message: error.message
    });
  }
});

// 测试游戏API
// 修改 src/app.js 中的测试游戏API
app.get('/test/game/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const pool = require('./config/database');
      
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
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Game not found' });
      }
  
      res.json({
        game_id: result.rows[0].game_id,
        title: result.rows[0].title,
        banner_url: result.rows[0].banner_url,
        video_url: result.rows[0].video_url,
        rating: result.rows[0].rating,
        total_reviews: result.rows[0].total_reviews,
        tags: result.rows[0].tags
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Game query failed',
        message: error.message 
      });
    }
  });

app.use('/api/v1', gameRoutes);

module.exports = app;
