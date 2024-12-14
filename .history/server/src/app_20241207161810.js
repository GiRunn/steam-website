require('dotenv').config();


const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');


require('dotenv').config();

const cors = require('cors');
const { pool, checkConnection } = require('./config/database');

// 正确导入数据库连接
const { pool } = require('./config/database');

// 引入游戏概览相关模块
const GameOverviewRepository = require('./modules/gameOverview/repositories/gameOverviewRepository');
const GameOverviewService = require('./modules/gameOverview/services/gameOverviewService');
const GameOverviewController = require('./modules/gameOverview/controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');

// 测试数据库连接
console.log('Database pool:', pool); // 添加此行来检查pool是否正确导入

// 初始化游戏概览模块
const gameOverviewRepository = new GameOverviewRepository(pool);  // 暂时只传入pool
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/v1/games', gameDetailRoutes);
app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController));

module.exports = app;