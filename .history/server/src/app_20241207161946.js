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

// 初始化应用
const initializeApp = async () => {
    try {
        // 检查数据库连接
        const isConnected = await checkConnection();
        if (!isConnected) {
            throw new Error('Unable to connect to the database');
        }
        console.log('Database connection established successfully');

        // 检查Redis连接
        await redis.ping();
        console.log('Redis connection established successfully');

        // 初始化游戏概览模块
        
        const gameOverviewRepository = new GameOverviewRepository(pool, redis);
        const gameOverviewService = new GameOverviewService(gameOverviewRepository);
        const gameOverviewController = new GameOverviewController(gameOverviewService);

        const app = express();

        // 基础中间件
        app.use(helmet());  // 安全头
        app.use(cors());    // CORS 支持
        app.use(express.json());  // JSON 解析
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

        // 启动服务器
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`Health check available at http://localhost:${PORT}/health`);
        });

        // 优雅关闭处理
        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received. Closing HTTP server...');
            await pool.end();
            await redis.quit();
            process.exit(0);
        });

        return app;

    } catch (error) {
        console.error('Application initialization failed:', error);
        process.exit(1);
    }
};

// 启动应用
if (require.main === module) {
    initializeApp();
}

module.exports = initializeApp;