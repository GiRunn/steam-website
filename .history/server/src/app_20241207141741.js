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
app.get('/test/game/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const pool = require('./config/database');
    const result = await pool.query(
      'SELECT game_id, title, rating FROM games WHERE game_id = $1',
      [gameId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Game query failed',
      message: error.message 
    });
  }
});

app.use('/api/v1', gameRoutes);

module.exports = app;
