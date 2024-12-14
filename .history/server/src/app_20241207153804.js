const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');
const gameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');
const { pool } = require('./config/database'); // 使用已有的数据库连接池
const { redis } = require('./config/redis'); // 使用已有的Redis客户端
const { GameOverviewRepository, GameOverviewService, GameOverviewController } = require('./modules/gameOverview');

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
app.use('/api/v1', gameOverviewRoutes(gameOverviewController)); // 添加游戏概览路由

module.exports = app;