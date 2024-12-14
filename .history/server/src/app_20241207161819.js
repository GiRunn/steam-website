const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const { pool, checkConnection } = require('./config/database');

// 其他导入保持不变...

// 初始化应用
const initializeApp = async () => {
    try {
        // 检查数据库连接
        const isConnected = await checkConnection();
        if (!isConnected) {
            throw new Error('Unable to connect to the database');
        }

        // 初始化游戏概览模块
        const gameOverviewRepository = new GameOverviewRepository(pool);
        const gameOverviewService = new GameOverviewService(gameOverviewRepository);
        const gameOverviewController = new GameOverviewController(gameOverviewService);

        const app = express();

        app.use(helmet());
        app.use(cors());
        app.use(express.json());

        // 注册路由
        app.use('/api/v1/games', gameDetailRoutes);
        app.use('/api/v1/games', setupGameOverviewRoutes(gameOverviewController));

        // 错误处理中间件
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                error: err.message || 'Internal Server Error',
                timestamp: new Date().toISOString()
            });
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Application initialization failed:', error);
        process.exit(1);
    }
};

// 启动应用
initializeApp();

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