require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { pool, checkConnection } = require('./config/database.js');
const redis = require('./config/redis');

// 配置导入 - 只需要导入一次
const { performanceMonitor, cpuMonitor, errorRateMonitor } = require('./middleware/performanceMonitor');

// Overview 模块导入
const GameOverviewRepository = require('./modules/gameOverview/repositories/gameOverviewRepository');
const GameOverviewService = require('./modules/gameOverview/services/gameOverviewService');
const GameOverviewController = require('./modules/gameOverview/controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./modules/gameOverview/routes/gameOverviewRoutes');

// Main 模块导入
const GameDetailRepository = require('./modules/game/repositories/gameDetailRepository');
const GameDetailService = require('./modules/game/services/gameDetailService');
const GameDetailController = require('./modules/game/controllers/gameDetailController');
const setupGameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');

// Feature 模块导入
const initializeGameFeature = require('./modules/gameFeature');

// Media 模块导入
const gameMediaModule = require('./modules/gameMedia');

// 添加系统需求模块导入
const initializeGameSystem = require('./modules/gameSystemRequirements');

const app = express();

// 初始化数据库连接检查
checkConnection().catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
});

// Redis 连接检查
redis.ping().catch(error => {
    console.error('Redis connection failed:', error);
    process.exit(1);
});

// 基础中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志配置
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// 初始化游戏概览模块
const gameOverviewRepository = new GameOverviewRepository(pool, redis);
const gameOverviewService = new GameOverviewService(gameOverviewRepository);
const gameOverviewController = new GameOverviewController(gameOverviewService);

// 初始化游戏详情模块
const gameDetailRepository = new GameDetailRepository(pool);
const gameDetailService = new GameDetailService(gameDetailRepository, redis);
const gameDetailController = new GameDetailController(gameDetailService);

// 初始化游戏特征模块
const gameFeatureRoutes = initializeGameFeature(pool, redis);

// 健康检查路由
app.get('/health', async (req, res) => {
    try {
        const dbConnected = await checkConnection();
        const redisConnected = redis.status === 'ready';

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                database: dbConnected ? 'connected' : 'disconnected',
                redis: redisConnected ? 'connected' : 'disconnected'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API 路由配置
app.use('/api/v1/games', setupGameDetailRoutes(gameDetailController));
app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController));
app.use('/api/v1/games', gameFeatureRoutes);
app.use('/api/v1/games', gameMediaModule(pool, redis));
app.use('/api/v1/games', initializeGameSystem(pool, redis));

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';

    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });

    res.status(statusCode).json({
        error: errorMessage,
        status: statusCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
});

// 优雅关闭处理
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Starting graceful shutdown...');
    
    try {
        await pool.end();
        console.log('Database pool closed');
        
        await redis.quit();
        console.log('Redis connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

module.exports = app;