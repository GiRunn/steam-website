// src/app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { pool, checkConnection } = require('./config/database');
const redis = require('./config/redis');

// Import game modules
const GameDetailRepository = require('./modules/game/repositories/gameDetailRepository');
const GameDetailService = require('./modules/game/services/gameDetailService');
const GameDetailController = require('./modules/game/controllers/gameDetailController');

const app = express();

// Initialize game detail module
const gameDetailRepository = new GameDetailRepository(pool);
const gameDetailService = new GameDetailService(gameDetailRepository, redis);
const gameDetailController = new GameDetailController(gameDetailService);

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check route
app.get('/health', async (req, res) => {
    const dbStatus = await checkConnection();
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus ? 'connected' : 'disconnected',
            redis: redis.status === 'ready' ? 'connected' : 'disconnected'
        }
    });
});

// API routes
app.use('/api/v1/games', require('./modules/game/routes/gameDetailRoutes')(gameDetailController));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handler
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
