const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');
const gameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');
const { pool } = require('./config/database');
const { redis } = require('./config/redis'); // 确保这里正确导入
const { GameOverviewRepository, GameOverviewService, GameOverviewController } = require('./modules/gameOverview');

// 添加连接测试
redis.ping().then(() => {
    console.log('Redis ping successful');
}).catch((err) => {
    console.error('Redis ping failed:', err);
});

// 初始化游戏概览模块的组件
const gameOverviewRepository = new GameOverviewRepository(pool, redis);
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/v1/games', gameDetailRoutes);
app.use('/api/v1', gameOverviewRoutes(gameOverviewController));

module.exports = app;