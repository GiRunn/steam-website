const GameListRepository = require('./repositories/gameListRepository');
const GameListService = require('./services/gameListService');
const GameListController = require('./controllers/gameListController');
const setupGameListRoutes = require('./routes/gameListRoutes');

const initializeGameList = (pool, redis) => {
    const repository = new GameListRepository(pool, redis);
    const service = new GameListService(repository);
    const controller = new GameListController(service);
    return setupGameListRoutes(controller);
};

module.exports = initializeGameList; 