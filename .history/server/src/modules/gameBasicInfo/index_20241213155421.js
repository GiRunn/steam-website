const GameBasicInfoRepository = require('./repositories/gameBasicInfoRepository');
const GameBasicInfoService = require('./services/gameBasicInfoService');
const GameBasicInfoController = require('./controllers/gameBasicInfoController');
const setupGameBasicInfoRoutes = require('./routes/gameBasicInfoRoutes');

const initializeGameBasicInfo = (pool, redis) => {
    const repository = new GameBasicInfoRepository(pool, redis);
    const service = new GameBasicInfoService(repository);
    const controller = new GameBasicInfoController(service);
    return setupGameBasicInfoRoutes(controller);
};

module.exports = initializeGameBasicInfo; 