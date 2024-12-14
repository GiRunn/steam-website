// server/src/modules/gameOverview/index.js
const GameOverviewRepository = require('./repositories/gameOverviewRepository');
const GameOverviewService = require('./services/gameOverviewService');
const GameOverviewController = require('./controllers/gameOverviewController');
const setupGameOverviewRoutes = require('./routes/gameOverviewRoutes');

module.exports = {
    GameOverviewRepository,
    GameOverviewService,
    GameOverviewController,
    setupGameOverviewRoutes
};