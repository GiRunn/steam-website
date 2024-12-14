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
checkConnection().then(isConnected => {
    if (!isConnected) {
        console.error('Unable to connect to the database');
        process.exit(1);
    }
    console.log('Database connection established successfully');
}).catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
});

// 检查Redis连接
redis.ping().then(() => {
    console.log('Redis connection established successfully');
}).catch(error => {
    console.error('Redis connection error:', error);
    process.exit(1);
});

// 初始化游戏概览模块
const gameOverviewRepository = new GameOverviewRepository(pool, redis);
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

// 基础中间件
app.use(helmet());  // 安全头
app.use(cors());    // CORS 支持
app.use(express.json());  // JSON 解析
app.use('/api/v1/games', gameDetailRoutes);
app.use(express.urlencoded({ extended: true }));  // URL 编码解析

// 日志中间件
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// 健康检查路由
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            redis: 'connected'
        }
    });
});

// API路由
app.use('/api/v1/games', gameDetailRoutes);
app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController));

// 404处理
app.use((req, res, next) => {
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