const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');

// 引入游戏概览相关模块
const GameOverviewRepository = require('./modules/gameOverview/repositories/gameOverviewRepository');
const GameOverviewService = require('./modules/gameOverview/services/gameOverviewService');
const GameOverviewController = require('./modules/gameOverview/controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');



// 初始化游戏概览模块
const gameOverviewRepository = new GameOverviewRepository(pool, redis);
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/v1/games', gameDetailRoutes);
// 添加游戏概览路由
app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController));

module.exports = app;