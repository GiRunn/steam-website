const GameIntroductionRepository = require('./repositories/gameIntroductionRepository');
const GameIntroductionService = require('./services/gameIntroductionService');
const GameIntroductionController = require('./controllers/gameIntroductionController');
const setupGameIntroductionRoutes = require('./routes/gameIntroductionRoutes');

const initializeGameIntroduction = (pool, redis) => {
    const repository = new GameIntroductionRepository(pool, redis);
    const service = new GameIntroductionService(repository);
    const controller = new GameIntroductionController(service);
    return setupGameIntroductionRoutes(controller);
};

module.exports = initializeGameIntroduction; 