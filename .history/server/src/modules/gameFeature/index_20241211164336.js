// src/modules/gameFeature/index.js
const GameFeatureRepository = require('./repositories/gameFeatureRepository');
const GameFeatureService = require('./services/gameFeatureService');
const GameFeatureController = require('./controllers/gameFeatureController');
const setupGameFeatureRoutes = require('./routes/gameFeatureRoutes');

const initializeGameFeature = (pool, redis) => {
    const repository = new GameFeatureRepository(pool, redis);
    const service = new GameFeatureService(repository);
    const controller = new GameFeatureController(service);
    return setupGameFeatureRoutes(controller);
};

module.exports = initializeGameFeature;

