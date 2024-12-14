// src/modules/gameFeature/index.js
const { pool, redis } = require('../../config');
const GameFeatureRepository = require('./repositories/gameFeatureRepository');
const GameFeatureService = require('./services/gameFeatureService');
const GameFeatureController = require('./controllers/gameFeatureController');
const gameFeatureRoutes = require('./routes/gameFeatureRoutes');

const repository = new GameFeatureRepository(pool, redis);
const service = new GameFeatureService(repository);
const controller = new GameFeatureController(service);
const routes = gameFeatureRoutes(controller);

module.exports = routes;