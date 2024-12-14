require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { pool, checkConnection } = require('./config/database');
const redis = require('./config/redis');

// 导入路由
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');

// 导入游戏概览相关模块
const GameOverviewRepository = require('./modules/gameOverview/repositories/gameOverviewRepository');
const GameOverviewService = require('./modules/gameOverview/services/gameOverviewService');
const GameOverviewController = require('./modules/gameOverview/controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');

const app = express();

// 检查数据库连接
let isDbConnected = false;
checkConnection().then(isConnected => {
    if (!isConnected) {
        console.error('Unable to connect to the database');
    } else {
        isDbConnected = true;
        console.log('Database connection established successfully');
    }
}).catch(error => {
    console.error('Database connection error:', error);
});

// 检查Redis连接
redis.ping().then(() => {
    console.log('Redis connection established successfully');
}).catch(error => {
    console.error('Redis connection error:', error);
});

// 初始化游戏概览模块
const gameOverviewRepository = new GameOverviewRepository(pool, redis);
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

// 基础中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(morgan('dev'));

// 数据库连接检查中间件
app.use((req, res, next) => {
    if (!isDbConnected) {
        return res.status(503).json({
            error: 'Database connection not available',
            timestamp: new Date().toISOString()
        });
    }
    next();
});

// 路由日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// API路由 - 注意这里的顺序
app.use('/api/v1/games', gameDetailRoutes); // 游戏详情路由
app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController)); // 游戏概览路由

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
});

module.exports = app;